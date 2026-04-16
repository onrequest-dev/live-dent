'use client';

import { createContext, useContext, ReactNode } from 'react';

type ClinicContextType = {
  clinicId: string;
};

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({
  children,
  clinicId,
}: {
  children: ReactNode;
  clinicId: string;
}) {
  return (
    <ClinicContext.Provider value={{ clinicId }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within ClinicProvider');
  }
  return context;
}