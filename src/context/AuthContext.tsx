import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'official' | 'citizen' | 'guest';

interface AuthContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue>({ role: 'guest', setRole: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('guest');
  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
