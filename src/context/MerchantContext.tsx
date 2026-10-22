'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Merchant, LoyaltyProgram } from '@/lib/types';
import { db } from '@/lib/db';

interface MerchantContextType {
  currentMerchant: Merchant | null;
  setCurrentMerchant: (merchant: Merchant | null) => void;
  program: LoyaltyProgram | null;
  refreshMerchantData: () => void;
  switchMerchant: (slugOrId: string) => void;
  updateProgram: (newProg: LoyaltyProgram) => void;
  allMerchants: Merchant[];
  loginMerchantSession: (merchant: Merchant) => void;
  logoutMerchantSession: () => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [currentMerchant, setCurrentMerchant] = useState<Merchant | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);

  const loadData = () => {
    const merchants = db.getMerchants();
    setAllMerchants(merchants);

    // Récupérer le marchand actif sauvegardé ou le premier par défaut
    const savedId = typeof window !== 'undefined' ? localStorage.getItem('fidelitydz_active_merchant') : null;
    let active = merchants.find(m => m.id === savedId || m.slug === savedId);
    if (!active && merchants.length > 0) {
      active = merchants[0]; // Café El Bahdja
    }

    if (active) {
      setCurrentMerchant(active);
      const prog = db.getProgramByMerchantId(active.id);
      setProgram(prog);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchMerchant = (slugOrId: string) => {
    const merchants = db.getMerchants();
    const target = merchants.find(m => m.id === slugOrId || m.slug === slugOrId);
    if (target) {
      setCurrentMerchant(target);
      const prog = db.getProgramByMerchantId(target.id);
      setProgram(prog);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fidelitydz_active_merchant', target.id);
      }
    }
  };

  const updateProgram = (newProg: LoyaltyProgram) => {
    db.saveProgram(newProg);
    setProgram({ ...newProg });
  };

  const refreshMerchantData = () => {
    loadData();
  };

  const loginMerchantSession = (merchant: Merchant) => {
    setCurrentMerchant(merchant);
    const prog = db.getProgramByMerchantId(merchant.id);
    setProgram(prog);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fidelitydz_active_merchant', merchant.id);
    }
  };

  const logoutMerchantSession = () => {
    setCurrentMerchant(null);
    setProgram(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fidelitydz_active_merchant');
    }
  };

  return (
    <MerchantContext.Provider
      value={{
        currentMerchant,
        setCurrentMerchant,
        program,
        refreshMerchantData,
        switchMerchant,
        updateProgram,
        allMerchants,
        loginMerchantSession,
        logoutMerchantSession,
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
