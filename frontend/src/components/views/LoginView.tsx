import React, { useState } from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Role } from '../../types';
import { ShieldCheck, Lock, ArrowRight, Sparkles, Cpu, KeyRound, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('CFO');
  const [email, setEmail] = useState('cfo@enterprise-corp.com');
  const [passkey, setPasskey] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'CFO') setEmail('cfo@enterprise-corp.com');
    if (role === 'FINANCE_OPS') setEmail('finance.ops@enterprise-corp.com');
    if (role === 'REV_OPS') setEmail('rev.controller@enterprise-corp.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(selectedRole);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold tracking-wider uppercase mb-1 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SOX-404 Verified Revenue Intelligence</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
            REV<span className="text-blue-600">GUARD</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Cross-system Revenue Leakage Intelligence, Invariant Accounting Verification & Tamper-Evident Audit Ledger.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="white-card rounded-2xl p-8 space-y-6 shadow-xl border border-slate-200/90 bg-white">
          
          <div className="space-y-1">
            <h2 className="font-display font-bold text-base text-slate-900">
              Enterprise Role Authentication
            </h2>
            <p className="text-xs text-slate-500">
              Select your corporate designation to access role-specific financial controls:
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="space-y-2.5">
            {(Object.keys(ROLES) as Role[]).map((r) => {
              const p = ROLES[r];
              const isSelected = selectedRole === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between group ${isSelected ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-bold text-slate-900 block">{p.name}</strong>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                          {p.badgeLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{p.title}</span>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Corporate Single Sign-On (SSO) Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Hardware Passkey / Security Token</label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 mt-2 cursor-pointer"
            >
              <Lock className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Authenticating Secure Session...' : `Authenticate as ${ROLES[selectedRole].name}`}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </form>

        </div>

        {/* Security / Compliance Badges Footer */}
        <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 font-mono flex-wrap gap-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-blue-600" />
            <span>SHA-256 Ledger</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-600" />
            <span>Local VPC AI Engine</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Zero Data Exfiltration</span>
          </span>
        </div>

      </div>

    </div>
  );
};
