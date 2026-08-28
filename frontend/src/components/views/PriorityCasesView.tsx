import React, { useState } from 'react';
import { RevenueCase, FilterMode } from '../../types';
import { Search, ArrowUpRight, ArrowDownUp } from 'lucide-react';

interface PriorityCasesProps {
  cases: RevenueCase[];
  filterMode: FilterMode;
  onInspectCase: (c: RevenueCase) => void;
}

export const PriorityCasesView: React.FC<PriorityCasesProps> = ({
  cases,
  filterMode,
  onInspectCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const formatINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const filteredCases = cases.filter((c) => {
    if (filterMode === 'COMPANY_SIDE' && c.owner !== 'Company-Side') return false;
    if (filterMode === 'CUSTOMER_SIDE' && c.owner !== 'Customer-Side') return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.entity_ref.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="white-card rounded-2xl p-6 space-y-4 shadow-xs">
      
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900">Priority Cases Operational Ledger</h2>
          <p className="text-xs text-slate-500">
            Ranked by Expected Recovery (ERV) with escalation score urgency tiebreaker
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search case, entity ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-64 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="">All Leakage Types</option>
            <option value="FINANCIAL_LEAKAGE">Financial Leakage</option>
            <option value="PROCESS_LEAKAGE">Process Leakage</option>
            <option value="NORMAL">Normal / Cleared</option>
          </select>
        </div>
      </div>

      {/* High-Density Cases Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 font-bold bg-slate-50/80 font-mono">
              <th className="py-3 px-3">Case ID & Title</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Root Cause Link</th>
              <th className="py-3 px-3 text-right">Exposure (₹)</th>
              <th className="py-3 px-3 text-right">Expected Recovery (ERV)</th>
              <th className="py-3 px-3 text-center">Urgency Score</th>
              <th className="py-3 px-3 text-center">Aging</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400 font-sans">
                  No priority revenue cases matching current filters.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => {
                const isFinancial = c.category === 'FINANCIAL_LEAKAGE';
                const isProcess = c.category === 'PROCESS_LEAKAGE';

                const catBadge = isFinancial ? (
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                    FINANCIAL
                  </span>
                ) : isProcess ? (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                    PROCESS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                    NORMAL
                  </span>
                );

                const ownerTag = c.owner === 'Company-Side' ? (
                  <span className="text-[10px] text-slate-500 font-medium">🏢 Company</span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-medium">🛒 Customer</span>
                );

                const statusBadge = c.status === 'CONFIRMED' || c.status === 'RECOVERED' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    RECOVERED
                  </span>
                ) : c.status === 'VALIDATED' || c.status === 'IN_REVIEW' ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                    IN-REVIEW
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                    {c.status}
                  </span>
                );

                const score = c.escalation_score || 50;
                const scoreColor = score > 70 ? 'bg-rose-500' : score > 40 ? 'bg-amber-500' : 'bg-blue-500';

                return (
                  <tr
                    key={c.id}
                    onClick={() => onInspectCase(c)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    {/* Case ID & Title */}
                    <td className="py-3.5 px-3 font-medium text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-blue-700 font-bold">{c.id}</span>
                        {c.is_hero && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300 font-mono">
                            HERO {c.hero_case_number}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5 font-sans font-normal truncate max-w-xs">
                        {c.title}
                      </span>
                    </td>

                    {/* Category & Owner */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col space-y-1">
                        {catBadge}
                        {ownerTag}
                      </div>
                    </td>

                    {/* Root Cause Link */}
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] text-slate-800 font-mono font-medium">
                        {c.root_cause_id || 'RC-UNBILLED-ORD'}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[140px] font-mono">
                        Ref: {c.entity_ref}
                      </span>
                    </td>

                    {/* Exposure */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                      {formatINR(c.exposure_amt)}
                    </td>

                    {/* ERV */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                      {formatINR(c.expected_recovery)}
                    </td>

                    {/* Urgency Progress Pill */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className={`h-full ${scoreColor} rounded-full`} style={{ width: `${score}%` }}></div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-700 font-bold">{score}</span>
                      </div>
                    </td>

                    {/* Aging */}
                    <td className="py-3.5 px-3 text-center font-mono text-[11px] text-slate-600">
                      {c.case_aging_days}d open
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">{statusBadge}</td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectCase(c);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold flex items-center space-x-1 transition mx-auto shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
