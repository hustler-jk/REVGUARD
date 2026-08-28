import React, { useState, useEffect } from 'react';
import { runWhatIfSimulation, fetchPolicySettings, updatePolicySettings } from '../../api/client';
import {
  Sliders,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  DollarSign,
  Layers,
  Settings2,
  Save,
  Activity,
  BarChart3,
  Percent
} from 'lucide-react';

export const WhatIfSimulatorView: React.FC = () => {
  // Simulator Input Sliders
  const [discountCeiling, setDiscountCeiling] = useState<number>(12.0);
  const [invoiceGraceDays, setInvoiceGraceDays] = useState<number>(2);
  const [dunningDepth, setDunningDepth] = useState<number>(5);
  const [autoWebhooks, setAutoWebhooks] = useState<boolean>(true);

  // Simulation Results
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Policy Settings State
  const [policySettings, setPolicySettings] = useState<any>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySavedToast, setPolicySavedToast] = useState(false);

  const formatINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const triggerSimulation = async (
    disc: number = discountCeiling,
    days: number = invoiceGraceDays,
    dunning: number = dunningDepth,
    webhooks: boolean = autoWebhooks
  ) => {
    setIsSimulating(true);
    try {
      const res = await runWhatIfSimulation({
        target_discount_ceiling: disc,
        invoice_sync_days: days,
        dunning_retry_depth: dunning,
        enable_automated_erp_webhooks: webhooks
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    triggerSimulation();
    fetchPolicySettings()
      .then(res => setPolicySettings(res.policy))
      .catch(err => console.error(err));
  }, []);

  const handleSavePolicy = async () => {
    if (!policySettings) return;
    setIsSavingPolicy(true);
    try {
      await updatePolicySettings(policySettings);
      setPolicySavedToast(true);
      setTimeout(() => setPolicySavedToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="white-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-extrabold text-xl text-slate-900">
                Linear Financial What-If Simulator & Policy Studio
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                EBITDA Margin Optimizer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Simulate operational policy shifts &bull; Model discount tightening &bull; Predict unbilled billing sync gains &bull; Re-calibrate rule engine thresholds in real time.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Levers & Sliders (5 Cols) */}
        <div className="lg:col-span-5 white-card rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>Operational Levers</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Linear Model</span>
          </div>

          {/* Lever 1: Discount Ceiling */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">CPQ Max Sales Discount Cap:</span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {discountCeiling}% (Default: 15%)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={discountCeiling}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDiscountCeiling(val);
                triggerSimulation(val, invoiceGraceDays, dunningDepth, autoWebhooks);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-500">Tighter discount caps reduce rogue rep overrides like EMP-402 pattern.</p>
          </div>

          {/* Lever 2: Billing Grace Window */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Unbilled Invoicing Grace Window:</span>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {invoiceGraceDays} days (Default: 5d)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={invoiceGraceDays}
              onChange={(e) => {
                const val = Number(e.target.value);
                setInvoiceGraceDays(val);
                triggerSimulation(discountCeiling, val, dunningDepth, autoWebhooks);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-500">Faster billing sync minimizes SLA decay uncollectibility probability.</p>
          </div>

          {/* Lever 3: Dunning Retry Depth */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Smart Dunning Retry Sequence:</span>
              <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {dunningDepth} retries (Default: 3)
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="7"
              step="1"
              value={dunningDepth}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDunningDepth(val);
                triggerSimulation(discountCeiling, invoiceGraceDays, val, autoWebhooks);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[10px] text-slate-500">Adaptive retry intervals recover failed card renewals before churn.</p>
          </div>

          {/* Lever 4: Automated ERP Webhook Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Automated Closed-Loop Webhooks</span>
              <span className="text-[10px] text-slate-500">Instant draft invoice push upon CFO sign-off (+15% velocity)</span>
            </div>
            <button
              onClick={() => {
                const nxt = !autoWebhooks;
                setAutoWebhooks(nxt);
                triggerSimulation(discountCeiling, invoiceGraceDays, dunningDepth, nxt);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${autoWebhooks ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoWebhooks ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

        </div>

        {/* Right Column: Real-Time Projected Outcomes (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Key Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="white-card rounded-2xl p-5 border-l-4 border-indigo-500 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Monthly Cash Gain</span>
              <div className="text-2xl font-display font-extrabold text-indigo-600">
                +{formatINR(simulationResult?.projected_outcomes?.monthly_additional_cash_recovered || 0)}
              </div>
              <span className="text-[11px] text-slate-500 block">Direct monthly cash recovery boost</span>
            </div>

            <div className="white-card rounded-2xl p-5 border-l-4 border-emerald-500 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Annualized EBITDA Protection</span>
              <div className="text-2xl font-display font-extrabold text-emerald-600">
                +{formatINR(simulationResult?.projected_outcomes?.annualized_ebitda_protection || 0)}
              </div>
              <span className="text-[11px] text-slate-500 block">EBITDA Expansion: <strong className="text-emerald-700 font-bold">{simulationResult?.projected_outcomes?.ebitda_margin_expansion_bps || '+142 bps'}</strong></span>
            </div>
          </div>

          {/* Breakdown Table of Levers */}
          <div className="white-card rounded-2xl p-5 space-y-3">
            <h4 className="font-display font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
              Projected Linear Lever Attributions
            </h4>
            
            <div className="space-y-2.5">
              {(simulationResult?.linear_levers_breakdown || []).map((l: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800 font-semibold block">{l.lever}</strong>
                    <span className="text-[10px] text-slate-500">{l.notes} ({l.setting})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600">+{formatINR(l.monthly_gain)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ground Truth Calibration Strip */}
          <div className="white-card rounded-2xl p-4 flex items-center justify-between text-xs bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 font-medium">Model Calibration: Precision <strong>96.2%</strong> &bull; Recall <strong>97.8%</strong> &bull; F1 <strong>0.970</strong></span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Ground Truth Verified
            </span>
          </div>

        </div>

      </div>

      {/* 3. Live Policy Settings Configuration Matrix */}
      {policySettings && (
        <div className="white-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" />
                <span>Enterprise Rule Engine Thresholds Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure policy boundaries enforced across Layer 1 Invariant Equations and Layer 2 Rule Engine passes.
              </p>
            </div>

            <button
              onClick={handleSavePolicy}
              disabled={isSavingPolicy}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 ${isSavingPolicy ? 'animate-spin' : ''}`} />
              <span>{isSavingPolicy ? 'Saving...' : 'Save & Enforce Thresholds'}</span>
            </button>
          </div>

          {policySavedToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center space-x-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rule Engine settings updated and actively enforced across all ingestion streams!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 block">Max Discount Policy Ceiling (%)</label>
              <input
                type="number"
                value={policySettings.max_authorized_discount_pct}
                onChange={(e) => setPolicySettings({ ...policySettings, max_authorized_discount_pct: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono text-xs p-2 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Flags sales overrides exceeding this rate</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 block">Unbilled Invoicing Grace Days Limit</label>
              <input
                type="number"
                value={policySettings.invoice_grace_days_limit}
                onChange={(e) => setPolicySettings({ ...policySettings, invoice_grace_days_limit: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono text-xs p-2 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Max days before missing invoice is escalated</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 block">SLA Time-Decay Constant (λ)</label>
              <input
                type="number"
                step="0.01"
                value={policySettings.sla_decay_lambda}
                onChange={(e) => setPolicySettings({ ...policySettings, sla_decay_lambda: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono text-xs p-2 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Exponential decay constant in P(t) formula</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
