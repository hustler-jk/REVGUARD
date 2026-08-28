import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types';

export interface PersonaConfig {
  role: Role;
  name: string;
  title: string;
  initials: string;
  badgeLabel: string;
  avatarGradient: string;
  badgeBg: string;
  permissions: {
    canSignOff: boolean;
    canConfirmRecovery: boolean;
    canTriggerDunning: boolean;
    canViewInternalOps: boolean;
    canViewCustomerRisk: boolean;
    canViewAuditTrail: boolean;
  };
  description: string;
}

export const ROLES: Record<Role, PersonaConfig> = {
  CFO: {
    role: 'CFO',
    name: 'Chief Financial Officer',
    title: 'Executive Financial Sign-Off',
    initials: 'CFO',
    badgeLabel: 'CFO / Executive',
    avatarGradient: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    permissions: {
      canSignOff: true,
      canConfirmRecovery: true,
      canTriggerDunning: true,
      canViewInternalOps: true,
      canViewCustomerRisk: true,
      canViewAuditTrail: true,
    },
    description: 'Executive Access: Macro-financial KPIs, Cost-of-Inaction, Strategic Root Causes & Final Sign-Off.',
  },
  FINANCE_OPS: {
    role: 'FINANCE_OPS',
    name: 'Finance Operations Lead',
    title: 'Internal Audit & Reconciliation',
    initials: 'FO',
    badgeLabel: 'Finance Operations',
    avatarGradient: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    permissions: {
      canSignOff: false,
      canConfirmRecovery: true,
      canTriggerDunning: false,
      canViewInternalOps: true,
      canViewCustomerRisk: false,
      canViewAuditTrail: true,
    },
    description: 'Operational Access: Granular Priority Ledger, Evidence Investigation & SHA-256 Audit Trail.',
  },
  REV_OPS: {
    role: 'REV_OPS',
    name: 'Revenue Controller',
    title: 'Revenue Operations & Customer Risk',
    initials: 'RC',
    badgeLabel: 'Revenue Controller',
    avatarGradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    permissions: {
      canSignOff: false,
      canConfirmRecovery: false,
      canTriggerDunning: true,
      canViewInternalOps: false,
      canViewCustomerRisk: true,
      canViewAuditTrail: false,
    },
    description: 'Customer Risk Access: Dunning Failures, Churn Scoring (SHAP) & Account Recovery Plans.',
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  currentRole: Role;
  persona: PersonaConfig;
  switchRole: (role: Role) => void;
  login: (role?: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  currentRole: 'CFO',
  persona: ROLES.CFO,
  switchRole: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('revguard_auth');
    return saved !== null ? saved === 'true' : true;
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem('revguard_role') as Role;
    return savedRole && ROLES[savedRole] ? savedRole : 'CFO';
  });

  useEffect(() => {
    localStorage.setItem('revguard_auth', String(isAuthenticated));
    localStorage.setItem('revguard_role', currentRole);
  }, [isAuthenticated, currentRole]);

  const switchRole = (role: Role) => {
    if (ROLES[role]) {
      setCurrentRole(role);
    }
  };

  const login = (role: Role = 'CFO') => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        persona: ROLES[currentRole],
        switchRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
