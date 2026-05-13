'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ValidationContextValue {
  relayError: boolean;
  triggerRelayError: () => void;
  clearRelayError: () => void;
}

const ValidationContext = createContext<ValidationContextValue | undefined>(undefined);

export function ValidationProvider({ children }: { children: ReactNode }) {
  const [relayError, setRelayError] = useState(false);

  const triggerRelayError = () => setRelayError(true);
  const clearRelayError = () => setRelayError(false);

  return (
    <ValidationContext.Provider value={{ relayError, triggerRelayError, clearRelayError }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const ctx = useContext(ValidationContext);
  if (!ctx) {
    return {
      relayError: false,
      triggerRelayError: () => {},
      clearRelayError: () => {},
    };
  }
  return ctx;
}
