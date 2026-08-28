import React, { useState } from 'react';
import { Customer } from '../../types';
import { Search, BarChart2, Send, ShieldAlert, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface CustomerIntelProps {
  customers: Customer[];
  onTriggerRecoveryPlan: (c: Customer) => void;
}

export const CustomerIntelView: React.FC<CustomerIntelProps> = ({
  customers,
  onTriggerRecoveryPlan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustId, setSelectedCustId] = useState<string>(customers[0]?.customer_id || '');

  const formatINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.customer_id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.segment.toLowerCase().includes(q)
    );
  });

  const activeCustomer = customers.find((c) => c.customer_id === selectedCustId) || customers[0];

  // Format SHAP data for Recharts horizontal bar chart
  const shapChartData = (activeCustomer?.shap_factors || []).map(f => ({
    name: f.label.replace(' Impact', '').replace(' Attribution', ''),
    score: f.direction === 'RISK_INCREASE' ? Math.abs(f.impact_score) : -Math.abs(f.impact_score),
    rawScore: f.impact_score,
    direction: f.direction,
    input: f.value
  }));

  return (
    <div className="white-card rounded-2xl p-6 space-y-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-display font-bold text-xl text-slate-900">Customer Intelligence & Churn Risk</h2>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Layer D (Kept Separate)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Logistic Regression Churn Scoring with Mathematical SHAP Feature Importance Breakdown
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search account name, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Searchable Customer Account Table on White */}
        <div className="lg:col-span-6 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block font-mono">
            Customer Accounts ({filteredCustomers.length})
          </span>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.map((c) => {
              const isSelected = c.customer_id === activeCustomer?.customer_id;
              const isHighRisk = c.churn_probability > 0.5;

              return (
                <div
                  key={c.customer_id}
                  onClick={() => setSelectedCustId(c.customer_id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50/80 border-blue-300 shadow-xs' : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'}`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({c.customer_id})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 font-sans">
                      Segment: {c.segment} &bull; ARR: <strong className="text-slate-800 font-mono">{formatINR(c.arr)}</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${isHighRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {(c.churn_probability * 100).toFixed(0)}% Churn Risk
                    </span>
                    <span className="text-[10px] text-amber-700 block font-mono font-medium">
                      {formatINR(c.revenue_at_risk)} at risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: SHAP Feature Attribution Chart on White */}
        {activeCustomer && (
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Profile Card */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">{activeCustomer.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{activeCustomer.customer_id} &bull; {activeCustomer.segment}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${activeCustomer.churn_probability > 0.5 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {(activeCustomer.churn_probability * 100).toFixed(0)}% Churn Risk
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total ARR</span>
                  <span className="text-sm font-display font-bold text-slate-900 mt-1 block font-mono">{formatINR(activeCustomer.arr)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">90-Day at Risk</span>
                  <span className="text-sm font-display font-bold text-amber-600 mt-1 block font-mono">{formatINR(activeCustomer.revenue_at_risk)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Payment Failures</span>
                  <span className="text-sm font-display font-bold text-rose-600 mt-1 block font-mono">{activeCustomer.payment_failure_count} Retries</span>
                </div>
              </div>

              {/* Recharts SHAP Attribution Chart */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-mono">
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>SHAP Mathematical Risk Attribution</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Positive = Risk Driver</span>
                </div>

                <div className="h-44 w-full bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shapChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <XAxis type="number" stroke="#94A3B8" fontSize={10} domain={[-0.5, 0.5]} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`} />
                      <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                        formatter={(val: any, name: any, item: any) => [`${item.payload.direction === 'RISK_INCREASE' ? '+' : ''}${item.payload.rawScore} SHAP (Input: ${item.payload.input})`, 'Feature Attribution']}
                      />
                      <ReferenceLine x={0} stroke="#CBD5E1" />
                      <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                        {shapChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.direction === 'RISK_INCREASE' ? '#E11D48' : '#10B981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => onTriggerRecoveryPlan(activeCustomer)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-xs flex items-center space-x-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger Account Recovery Plan</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
