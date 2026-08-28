import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, Zap, CheckCircle, Sparkles, Database, Lock, RefreshCw } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { FilterMode, Role } from '../types';

interface HeaderProps {
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  onReseed: () => void;
  onOpenIngest: () => void;
  onOpenAutoSchema: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filterMode,
  onFilterChange,
  onReseed,
  onOpenIngest,
  onOpenAutoSchema,
}) => {
  const { currentRole, persona, switchRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        
        {/* Left: Brand & Live Status */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-xl tracking-tight text-slate-900">
                REVGUARD
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                AI RECOVERY
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Database className="w-3 h-3 text-blue-600 inline" />
                PostgreSQL / SQLite
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3 text-emerald-600 inline" />
                SHA-256 Valid
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Scope Filter Mode Toggle */}
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

        {/* Right: Actions & Persona Switcher */}
        <div className="flex items-center space-x-2.5">
          
          <button
            onClick={onOpenAutoSchema}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span className="hidden lg:inline">AI Schema Ingest</span>
          </button>

          <button
            onClick={onReseed}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            title="Reseed Ground Truth Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenIngest}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Ingest (§7.7)</span>
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${persona.avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                {persona.initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{persona.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200 font-mono">
                    {persona.badgeLabel.split('/')[0]}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{persona.title}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl p-2.5 shadow-xl border border-slate-200 z-50 space-y-1">
                <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Switch Corporate Persona:
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
                      className={`w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center space-x-2.5 ${currentRole === r ? 'bg-blue-50/70 border border-blue-200' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                        {p.initials}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-900">{p.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {p.badgeLabel.split('/')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{p.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
