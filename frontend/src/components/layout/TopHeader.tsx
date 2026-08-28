import React, { useState } from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { FilterMode, Role } from '../../types';
import { ChevronDown, Database, Lock, Search, Sparkles, Activity, LogOut, ShieldCheck } from 'lucide-react';

interface TopHeaderProps {
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  filterMode,
  onFilterChange,
}) => {
  const { currentRole, persona, switchRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      
      {/* 1. Left: Scope Filter & Global Search Input */}
      <div className="flex items-center space-x-4">
        
        {/* Global Scope Filter Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${filterMode === 'ALL' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Leaks
          </button>
          <button
            onClick={() => onFilterChange('COMPANY_SIDE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${filterMode === 'COMPANY_SIDE' ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span>🏢</span>
            <span>Company-Side</span>
          </button>
          <button
            onClick={() => onFilterChange('CUSTOMER_SIDE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${filterMode === 'CUSTOMER_SIDE' ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span>🛒</span>
            <span>Customer-Side</span>
          </button>
        </div>

      </div>

      {/* 2. Right: Engine Health & Persona Switcher */}
      <div className="flex items-center space-x-3">
        
        {/* Live System Diagnostics */}
        <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            PostgreSQL / SQLite
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-blue-700 font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3 text-blue-600" />
            SOX Valid
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-slate-600 font-bold">8.4ms</span>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${persona.avatarGradient} flex items-center justify-center text-white font-bold text-[10px] shadow-xs`}>
              {persona.initials}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 leading-tight block">{persona.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl p-2.5 shadow-xl border border-slate-200 z-50 space-y-1 animate-in zoom-in-95">
              <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                <span>Switch Enterprise Role:</span>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">RBAC</span>
              </div>
              {(Object.keys(ROLES) as Role[]).map((r) => {
                const p = ROLES[r];
                return (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center space-x-2.5 cursor-pointer ${currentRole === r ? 'bg-blue-50/80 border border-blue-200' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.avatarGradient} flex items-center justify-center text-white font-bold text-[10px] shadow-xs`}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{p.title}</p>
                    </div>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Session / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
