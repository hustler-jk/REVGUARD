import React, { useState, useEffect } from 'react';
import { RevenueCase } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchCaseAIExplanation } from '../../api/client';
import {
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  Cpu,
  Sparkles,
  RefreshCw,
  ListOrdered,
  FileCheck2,
  Lock,
  Layers
} from 'lucide-react';

interface CaseInvestigationDrawerProps {
  revenueCase: RevenueCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRecovery: (c: RevenueCase) => void;
  onMarkNormal: (c: RevenueCase) => void;
  onEscalate: (c: RevenueCase) => void;
}

export const CaseInvestigationDrawer: React.FC<CaseInvestigationDrawerProps> = ({
  revenueCase,
  isOpen,
  onClose,
  onConfirmRecovery,
  onMarkNormal,
  onEscalate,
}) => {
  const { persona } = useAuth();
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (isOpen && revenueCase) {
      setIsLoadingAI(true);
      fetchCaseAIExplanation(revenueCase.id)
        .then(data => setAiExplanation(data))
        .catch(err => console.error('Error loading AI explanation:', err))
        .finally(() => setIsLoadingAI(false));
    } else {
      setAiExplanation(null);
    }
  }, [isOpen, revenueCase?.id]);

  if (!isOpen || !revenueCase) return null;

  const formatINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Lifecycle node chain
  const lifecycleNodes = [
    { key: 'customer', label: 'Customer' },
    { key: 'contract', label: 'Contract' },
    { key: 'order', label: 'Order' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'payment', label: 'Payment' },
    { key: 'refund', label: 'Refund' },
  ];

  const getBrokenNode = () => {
    if (revenueCase.id === 'CASE-HERO-001') return 'invoice';
    if (revenueCase.id.startsWith('CASE-EMP402')) return 'order';
    if (revenueCase.id === 'CASE-HERO-003') return 'none';
    if (revenueCase.id === 'CASE-HERO-004') return 'contract';
    if (revenueCase.category === 'PROCESS_LEAKAGE') return 'invoice';
    return 'payment';
  };

  const brokenNode = getBrokenNode();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {revenueCase.id}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${revenueCase.owner === 'Company-Side' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                {revenueCase.owner}
              </span>
              {revenueCase.is_hero && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                  HERO {revenueCase.hero_case_number}
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 mt-1.5">{revenueCase.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Lifecycle Breadcrumb Node Chain */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Lifecycle Reconciliation Chain</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-medium">Point-of-Failure Audit</span>
            </div>

            <div className="flex items-center justify-between overflow-x-auto py-2">
              {lifecycleNodes.map((node, index) => {
                const isBroken = brokenNode === node.key;
                const isPassed = !isBroken && brokenNode !== 'none';

                let badgeClass = 'bg-white border-slate-200 text-slate-500';
                if (isBroken) {
                  badgeClass = 'bg-rose-50 border-rose-400 text-rose-700 font-bold animate-pulse shadow-sm shadow-rose-200';
                } else if (isPassed) {
                  badgeClass = 'bg-emerald-50 border-emerald-300 text-emerald-700';
                }

                return (
                  <React.Fragment key={node.key}>
                    <div className={`px-3 py-1.5 rounded-xl border text-xs text-center min-w-[76px] ${badgeClass}`}>
                      <span>{node.label}</span>
                      {isBroken && <span className="block text-[8px] uppercase tracking-wider text-rose-600 font-mono mt-0.5 font-bold">Broken</span>}
                    </div>
                    {index < lifecycleNodes.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mx-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 2. Financial Math Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Exposure</span>
              <span className="text-xl font-display font-extrabold text-rose-600 mt-1 block font-mono">
                {formatINR(revenueCase.exposure_amt)}
              </span>
              <span className="text-[10px] text-slate-400">Unbilled / Policy Gap</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Expected Value (ERV)</span>
              <span className="text-xl font-display font-extrabold text-emerald-600 mt-1 block font-mono">
                {formatINR(revenueCase.expected_recovery)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{(revenueCase.recovery_probability * 100).toFixed(0)}% Probability</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Urgency / Aging</span>
              <span className="text-xl font-display font-extrabold text-blue-700 mt-1 block font-mono">
                {revenueCase.case_aging_days} Days
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Score: {revenueCase.escalation_score}/100</span>
            </div>
          </div>

          {/* 3. AI Predictive Narrative & Diagnostic Assistant */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-blue-50/60 border border-indigo-200/80 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>REVGUARD AI Narrative Diagnostic & Recovery Plan</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                In-Context ML
              </span>
            </div>

            {isLoadingAI ? (
              <div className="flex items-center justify-center py-6 text-slate-500 text-xs font-mono">
                <RefreshCw className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
                <span>Synthesizing cross-lifecycle AI diagnosis...</span>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 leading-relaxed shadow-2xs">
                  <strong className="text-indigo-950 font-bold block mb-1">Executive Diagnostic Summary:</strong>
                  <p className="text-slate-600">{aiExplanation.executive_summary}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 leading-relaxed shadow-2xs">
                  <strong className="text-indigo-950 font-bold block mb-1">Root Cause & Point-of-Failure:</strong>
                  <p className="text-slate-600">{aiExplanation.root_cause_diagnosis}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 leading-relaxed shadow-2xs">
                  <strong className="text-indigo-950 font-bold block mb-1">Actionable Recovery Steps:</strong>
                  <ul className="space-y-1 mt-1 text-slate-600 list-disc list-inside">
                    {(aiExplanation.recommended_action_steps || []).map((step: string, sIdx: number) => (
                      <li key={sIdx} className="leading-normal">{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                {revenueCase.evidence_data?.issue_summary || 'Deterministic reconciliation anomaly flagged across general ledger records.'}
              </p>
            )}
          </div>

          {/* 4. Attached Evidence (Raw JSON) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono uppercase font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Attached Evidence Payload (JSON)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Entity: {revenueCase.entity_ref}</span>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-[11px] p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-40 shadow-inner">
              {JSON.stringify(revenueCase.evidence_data || {}, null, 2)}
            </pre>
          </div>

          {/* 5. Leak Immunization Recommendation */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 shadow-2xs">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Proactive Leak Immunization Guardrail (§8.6)</span>
            </span>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {revenueCase.suggested_immunization?.control || 'Deploy automated ERP milestone reconciliation webhook trigger.'}
            </p>
          </div>

        </div>

        {/* 6. Action Console */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Reviewer: <strong className="text-slate-800 font-semibold">{persona.name}</strong> ({persona.badgeLabel})
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onMarkNormal(revenueCase)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs"
            >
              Mark Legitimate
            </button>
            <button
              onClick={() => onEscalate(revenueCase)}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition shadow-2xs"
            >
              Escalate to CFO
            </button>
            <button
              onClick={() => onConfirmRecovery(revenueCase)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Recovery & Trigger ERP</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
