'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Merchant, LoyaltyProgram } from '@/lib/types';
import { db } from '@/lib/db';

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

  const loadData = async () => {
    const sessionMerchantId =
      typeof window !== 'undefined' ? localStorage.getItem('fidelitydz_merchant_session') : null;
    const sessionExpiry =
      typeof window !== 'undefined' ? Number(localStorage.getItem('fidelitydz_merchant_session_expiry') || '0') : 0;

    // Règle 7 : Session utilisateur 30 jours max + Isolation totale en navigation privée
    if (!sessionMerchantId || (sessionExpiry > 0 && Date.now() > sessionExpiry)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fidelitydz_merchant_session');
        localStorage.removeItem('fidelitydz_merchant_session_expiry');
        localStorage.removeItem('fidelitydz_active_merchant');
        db.clearSensitiveCache();
      }
      setAllMerchants([]);
      setCurrentMerchant(null);
      setProgram(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      return;
    }

    await db.syncFromSupabase();
    const merchants = db.getMerchants();
    setAllMerchants(merchants);

    if (sessionMerchantId) {
      const found = merchants.find((m) => m.id === sessionMerchantId || m.slug === sessionMerchantId);
      if (found) {
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
      }
    }

    setCurrentMerchant(null);
    setProgram(null);
    setIsAuthenticated(false);
    setIsLoadingAuth(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loginMerchantSession = (merchant: Merchant) => {
    if (typeof window !== 'undefined') {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('fidelitydz_merchant_session', merchant.id);
      localStorage.setItem('fidelitydz_merchant_session_expiry', String(Date.now() + thirtyDaysMs));
      localStorage.setItem('fidelitydz_active_merchant', merchant.id);
    }
    setCurrentMerchant(merchant);
    setProgram(db.getProgramByMerchantId(merchant.id));
    setIsAuthenticated(true);
  };

  const logoutMerchantSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fidelitydz_merchant_session');
      localStorage.removeItem('fidelitydz_merchant_session_expiry');
      localStorage.removeItem('fidelitydz_active_merchant');
      db.clearSensitiveCache();
    }
    setCurrentMerchant(null);
    setProgram(null);
    setIsAuthenticated(false);
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
