import React, { useState, useEffect } from 'react';
import { RevenueCase } from '../../types';
import { fetchCaseGraph } from '../../api/client';
import { Network, ChevronRight, GitCommit } from 'lucide-react';

interface EventGraphProps {
  cases: RevenueCase[];
}

export const EventGraphView: React.FC<EventGraphProps> = ({ cases }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseGraph(selectedCaseId).then(setGraphData).catch(console.error);
    }
  }, [selectedCaseId]);

  const formatINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const nodes = graphData?.graph?.nodes || [];

  return (
    <div className="glass-card rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Revenue Event Graph Traversal</h2>
          <p className="text-xs text-slate-400">Customer-to-Cash Lifecycle Node Traversal with Point-of-Failure Breakdown</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Inspecting Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 min-h-[380px] flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl flex items-center justify-between relative">
          {nodes.map((n: any, i: number) => {
            let nodeBg = 'bg-slate-900 border-slate-700 text-slate-200';
            if (n.status === 'broken' || n.status === 'policy_breach' || n.status === 'critical') {
              nodeBg = 'bg-rose-950/80 border-rose-500 text-rose-200 glow-rose animate-pulse';
            } else if (n.status === 'ok' || n.status === 'verified') {
              nodeBg = 'bg-emerald-950/60 border-emerald-600 text-emerald-200';
            } else if (n.status === 'drift' || n.status === 'anomaly') {
              nodeBg = 'bg-amber-950/70 border-amber-500 text-amber-200';
            }

            return (
              <React.Fragment key={n.id || i}>
                <div className="flex items-center flex-1 last:flex-none">
                  <div className={`p-4 rounded-2xl border-2 ${nodeBg} font-medium text-xs text-center shadow-xl min-w-[150px]`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">{n.type}</span>
                    <span className="font-bold text-sm block mt-1">{n.label}</span>
                  </div>
                  {i < nodes.length - 1 && (
                    <div className="flex-1 flex items-center justify-center px-2">
                      <div className="h-0.5 w-full bg-slate-700"></div>
                      <ChevronRight className="w-4 h-4 text-slate-500 -ml-2" />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {graphData && (
          <div className="mt-8 max-w-2xl p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <GitCommit className="w-4 h-4" />
              <span>Graph Divergence Analysis for {graphData.case_id}</span>
            </div>
            <p>
              Lifecycle point-of-divergence identified. Quantified financial exposure: <span className="font-bold text-rose-300 font-mono">{formatINR(graphData.exposure_amt)}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
