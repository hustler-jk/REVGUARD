import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ListOrdered,
  GitMerge,
  Users,
  Lock,
  Cpu,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Zap,
  RefreshCw,
  Layers,
  Cable,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  caseCount: number;
  onOpenAutoSchema: () => void;
  onOpenIngest: () => void;
  onReseed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  caseCount,
  onOpenAutoSchema,
  onOpenIngest,
  onReseed,
}) => {
  const { currentRole, persona } = useAuth();

  // Role-based visibility filtering
  const canSeeOverview = currentRole === 'CFO' || currentRole === 'FINANCE_OPS';
  const canSeeCases = currentRole === 'CFO' || currentRole === 'FINANCE_OPS' || currentRole === 'REV_OPS';
  const canSeeRootCauses = currentRole === 'CFO' || currentRole === 'FINANCE_OPS';
  const canSeeCustomers = currentRole === 'CFO' || currentRole === 'REV_OPS';
  const canSeeAudit = currentRole === 'CFO' || currentRole === 'FINANCE_OPS';
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, visible: canSeeOverview, badge: null },
    { id: 'simulator', label: 'What-If Policy Simulator', icon: Sliders, visible: canSeeOverview, badge: 'EBITDA', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'pipeline', label: 'Live CSV & ML Studio', icon: Layers, visible: true, badge: 'TabPFN', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'integrations', label: 'Enterprise Connectors', icon: Cable, visible: true, badge: 'SAP/Stripe', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'cases', label: 'Priority Cases Ledger', icon: ListOrdered, visible: canSeeCases, badge: caseCount.toString(), badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'rootcauses', label: 'Root-Cause Clusters', icon: GitMerge, visible: canSeeRootCauses, badge: 'P1 Diff', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'customers', label: 'Customer 360 & SHAP', icon: Users, visible: canSeeCustomers, badge: null },
    { id: 'audit', label: 'Cryptographic Audit', icon: Lock, visible: canSeeAudit, badge: 'SOX', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'models', label: 'AI Model Hub', icon: Cpu, visible: true, badge: 'HuggingFace', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-2xs z-30 select-none">
      
      {/* 1. Top Section: Logo & Workspace */}
      <div className="p-5 space-y-5">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">REVGUARD</span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Revenue Recovery Layer</p>
          </div>
        </div>

        {/* Quick Launch Action Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
            Quick Ingestion Controls
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenAutoSchema}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 text-[11px] font-bold flex items-center justify-center space-x-1 shadow-2xs transition"
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI Schema</span>
            </button>
            <button
              onClick={onOpenIngest}
              className="px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center space-x-1 shadow-2xs transition"
            >
              <Zap className="w-3 h-3" />
              <span>+ Ingest</span>
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider px-3 mb-2">
            Intelligence Views
          </div>
          {navItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition group ${isActive ? 'bg-blue-50/90 text-blue-700 font-bold border border-blue-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* 2. Bottom Section: Active Persona Profile */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${persona.avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
              {persona.initials}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-900 leading-tight block">{persona.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">{persona.title}</span>
            </div>
          </div>

          <button
            onClick={onReseed}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition shadow-2xs"
            title="Reset Canonical Datasets"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Role Clearance:</span>
          <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
            {persona.badgeLabel.split('/')[0]}
          </span>
        </div>

      </div>

    </aside>
  );
};
