'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Merchant, LoyaltyProgram } from '@/lib/types';
import { db } from '@/lib/db';

// Déconnexion automatique stricte après 6 heures d'inactivité (AFK)
const AFK_TIMEOUT_MS = 6 * 60 * 60 * 1000;

interface MerchantContextType {
  currentMerchant: Merchant | null;
  setCurrentMerchant: (merchant: Merchant | null) => void;
  program: LoyaltyProgram | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isSubscriptionExpired: boolean;
  daysLeft: number;
  refreshMerchantData: () => Promise<void>;
  switchMerchant: (slugOrId: string) => void;
  loginMerchantSession: (merchant: Merchant) => void;
  logoutMerchantSession: () => void;
  updateProgram: (newProg: LoyaltyProgram) => void;
  updateMerchant: (newMerchant: Merchant) => void;
  allMerchants: Merchant[];
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [currentMerchant, setCurrentMerchant] = useState<Merchant | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const clearLocalSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fidelitydz_current_store_id');
      localStorage.removeItem('fidelitydz_store_ttl');
      localStorage.removeItem('fidelitydz_active_merchant');
      db.clearSensitiveCache();
    }
    setAllMerchants([]);
    setCurrentMerchant(null);
    setProgram(null);
    setIsAuthenticated(false);
    setIsLoadingAuth(false);
  }, []);

  const loadData = useCallback(async () => {
    const activeStoreId =
      typeof window !== 'undefined' ? localStorage.getItem('fidelitydz_current_store_id') : null;
    const sessionExpiry =
      typeof window !== 'undefined' ? Number(localStorage.getItem('fidelitydz_store_ttl') || '0') : 0;

    // Déconnexion automatique si aucune session ou si inactif (AFK) depuis plus de 6 heures
    if (!activeStoreId || (sessionExpiry > 0 && Date.now() > sessionExpiry)) {
      if (activeStoreId && typeof window !== 'undefined') {
        const deviceId = localStorage.getItem('fidelitydz_device_id');
        if (deviceId) {
          db.logoutMerchantAsync(activeStoreId, deviceId).catch(() => {});
        }
      }
      clearLocalSession();
      return;
    }

    const syncOk = await db.syncFromSupabase();
    const syncDetails = db.getLastSyncDetails();
    if ((syncDetails as any)?.device_unauthorized) {
      clearLocalSession();
      return;
    }

    const merchants = db.getMerchants();
    setAllMerchants(merchants);

    if (activeStoreId) {
      const found = merchants.find((m) => m.id === activeStoreId || m.slug === activeStoreId);
      if (found) {
        // Vérifier si l'appareil actuel est toujours autorisé dans la limite max_users (et non expiré après 6h AFK)
        const currentDeviceId = db.getDeviceId();
        if (currentDeviceId && found.active_device_ids) {
          const now = Date.now();
          const activeDevices = found.active_device_ids
            .split(',')
            .map((s) => {
              const [id, tsStr] = s.trim().split(':');
              return { id: (id || '').trim(), ts: Number(tsStr) || now };
            })
            .filter((d) => d.id && now - d.ts < AFK_TIMEOUT_MS);

          const isCurrentInList = activeDevices.some((d) => d.id === currentDeviceId);
          const maxUsers = Number(found.max_users || 2);

          if (!isCurrentInList && activeDevices.length >= maxUsers) {
            clearLocalSession();
            return;
          }
        }

        // Rafraîchir l'expiration de session (6 heures d'inactivité AFK max)
        if (typeof window !== 'undefined') {
          localStorage.setItem('fidelitydz_store_ttl', String(Date.now() + AFK_TIMEOUT_MS));
        }

        // Vérifier automatiquement si les 14 jours d'essai ou l'abonnement sont dépassés
        const expiryTime = new Date(found.subscription_ends_at).getTime();
        if (expiryTime < Date.now() && found.subscription_status !== 'EXPIRED') {
          found.subscription_status = 'EXPIRED';
          db.saveMerchant(found);
        }
        setCurrentMerchant(found);
        setProgram(db.getProgramByMerchantId(found.id));
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        return;
      } else if (!syncOk) {
        // En cas de coupure réseau temporaire, garder la session locale si non expirée
        setIsLoadingAuth(false);
        return;
      }
    }

    clearLocalSession();
  }, [clearLocalSession]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Surveillance de l'activité utilisateur (AFK 6 heures max) + vérification périodique
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated || !currentMerchant) return;

    let lastActivityUpdate = Date.now();

    const handleUserActivity = () => {
      const now = Date.now();
      const currentTtl = Number(localStorage.getItem('fidelitydz_store_ttl') || '0');
      if (currentTtl > 0 && now > currentTtl) {
        // Déjà expiré après 6h d'AFK
        const deviceId = db.getDeviceId();
        if (deviceId && currentMerchant) {
          db.logoutMerchantAsync(currentMerchant.id, deviceId).catch(() => {});
        }
        clearLocalSession();
        return;
      }
      // Mettre à jour le compteur AFK au maximum toutes les 60 secondes d'activité
      if (now - lastActivityUpdate > 60 * 1000) {
        lastActivityUpdate = now;
        localStorage.setItem('fidelitydz_store_ttl', String(now + AFK_TIMEOUT_MS));
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Vérification toutes les 60 secondes si le délai AFK de 6h est dépassé ou si l'appareil a été déconnecté
    const afkInterval = setInterval(async () => {
      const ttl = Number(localStorage.getItem('fidelitydz_store_ttl') || '0');
      if (!ttl || Date.now() > ttl) {
        const deviceId = db.getDeviceId();
        if (deviceId && currentMerchant) {
          await db.logoutMerchantAsync(currentMerchant.id, deviceId).catch(() => {});
        }
        clearLocalSession();
        return;
      }
    }, 60 * 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(afkInterval);
    };
  }, [isAuthenticated, currentMerchant, clearLocalSession]);

  const loginMerchantSession = (merchant: Merchant) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fidelitydz_current_store_id', merchant.id);
      localStorage.setItem('fidelitydz_store_ttl', String(Date.now() + AFK_TIMEOUT_MS));
      localStorage.setItem('fidelitydz_active_merchant', merchant.id);
    }
    setCurrentMerchant(merchant);
    setProgram(db.getProgramByMerchantId(merchant.id));
    setIsAuthenticated(true);
  };

  const logoutMerchantSession = () => {
    if (currentMerchant) {
      const deviceId = db.getDeviceId();
      if (deviceId) {
        db.logoutMerchantAsync(currentMerchant.id, deviceId).catch(() => {});
      }
    }
    clearLocalSession();
  };

  const switchMerchant = (slugOrId: string) => {
    const merchants = db.getMerchants();
    const target = merchants.find((m) => m.id === slugOrId || m.slug === slugOrId);
    if (target) {
      loginMerchantSession(target);
    }
  };

  const updateProgram = (newProg: LoyaltyProgram) => {
    db.saveProgram(newProg);
    setProgram({ ...newProg });
  };

  const updateMerchant = (newMerchant: Merchant) => {
    db.saveMerchant(newMerchant);
    setCurrentMerchant({ ...newMerchant });
    setAllMerchants((prev) =>
      prev.map((m) => (m.id === newMerchant.id || m.slug === newMerchant.slug ? newMerchant : m))
    );
  };

  const refreshMerchantData = async () => {
    await loadData();
  };

  const endsAtMs = currentMerchant?.subscription_ends_at
    ? new Date(currentMerchant.subscription_ends_at).getTime()
    : 0;
  const daysLeft = endsAtMs ? Math.max(0, Math.ceil((endsAtMs - Date.now()) / 86400000)) : 0;
  const isSubscriptionExpired = Boolean(
    currentMerchant &&
      (currentMerchant.subscription_status === 'EXPIRED' || (endsAtMs > 0 && endsAtMs < Date.now()))
  );

  return (
    <MerchantContext.Provider
      value={{
        currentMerchant,
        setCurrentMerchant,
        program,
        isAuthenticated,
        isLoadingAuth,
        isSubscriptionExpired,
        daysLeft,
        refreshMerchantData,
        switchMerchant,
        loginMerchantSession,
        logoutMerchantSession,
        updateProgram,
        updateMerchant,
        allMerchants,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
}
