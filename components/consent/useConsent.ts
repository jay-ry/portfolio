"use client";

import { useSyncExternalStore } from "react";
import {
  acceptConsent,
  closeConsentPanel,
  getConsentServerSnapshot,
  getConsentSnapshot,
  getPanelOpenServerSnapshot,
  getPanelOpenSnapshot,
  openConsentPanel,
  rejectConsent,
  subscribeConsent,
  type ConsentChoice,
} from "@/lib/consent";

interface ConsentState {
  choice: ConsentChoice | null;
  isPanelOpen: boolean;
  isVisible: boolean;
  accept: () => void;
  reject: () => void;
  openSettings: (trigger?: HTMLElement | null) => void;
  closeSettings: () => void;
}

export function useConsent(): ConsentState {
  const choice = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);
  const isPanelOpen = useSyncExternalStore(subscribeConsent, getPanelOpenSnapshot, getPanelOpenServerSnapshot);

  return {
    choice,
    isPanelOpen,
    isVisible: choice === null || isPanelOpen,
    accept: acceptConsent,
    reject: rejectConsent,
    openSettings: openConsentPanel,
    closeSettings: closeConsentPanel,
  };
}
