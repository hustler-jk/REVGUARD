import React, { useState, useEffect } from 'react';
import { fetchModelsStatus, matchColumnsWithAI } from '../../api/client';
import { Cpu, Sparkles, CheckCircle2, Zap, ArrowRight, Activity, Terminal, Shield } from 'lucide-react';

export const ModelsHubView: React.FC = () => {
  const [modelsData, setModelsData] = useState<any>(null);
  const [testInput, setTestInput] = useState('VBELN_SALES_DOC, WRBTR_NET_AMT, KUNNR_CUSTOMER, OVERRIDE_DISC_VAL');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchModelsStatus()
      .then(res => setModelsData(res))
      .catch(err => console.error(err));
  }, []);

  const handleRunEmbedding = async () => {
    setIsLoading(true);
    try {
      const cols = testInput.split(',').map(c => c.trim()).filter(Boolean);
      const res = await matchColumnsWithAI(cols);
      setMatchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="white-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-extrabold text-xl text-slate-900">
                AI & Machine Learning Engine Hub
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Hugging Face &bull; TabPFN &bull; PyTorch &bull; Scikit-Learn
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Production ML pipeline serving zero-shot dense vector embeddings, tabular foundation transformer priors, multivariate financial anomaly scoring, and mathematical SHAP feature attribution.
            </p>
          </div>
        </div>
      </div>

      {/* Active Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(modelsData?.active_models || []).map((m: any) => (
          <div key={m.id} className="white-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {m.provider}
                </span>
                <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{m.status}</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 mt-3">{m.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{m.task}</p>
              
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-1">
                <div className="text-slate-600">
                  <span className="text-slate-400">Architecture:</span> {m.architecture || m.parameters}
                </div>
                <div className="text-slate-600">
                  <span className="text-slate-400">Framework:</span> {m.framework}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Latency: <strong className="text-slate-800">{m.latency_ms}ms</strong></span>
              <span className="text-emerald-700 font-mono font-bold">{m.precision} Accuracy</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Interactive HuggingFace Embedding Console */}
      <div className="white-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Live HuggingFace Zero-Shot Column Vector Embedder
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
            sentence-transformers/all-MiniLM-L6-v2
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Test real zero-shot vector embeddings. Enter any raw ERP/database column names to evaluate 384-dimensional cosine similarity matching against canonical revenue primitives:
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="e.g. VBELN_SALES_DOC, WRBTR_NET_AMT, KUNNR_CUSTOMER"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunEmbedding}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Computing PyTorch Embeddings...' : 'Run Zero-Shot Embeddings'}</span>
            </button>
          </div>
        </div>

        {matchResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-600" />
                <span>Vector Cosine Similarity Output ({matchResult.device})</span>
              </span>
              <span className="text-[11px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">
                Inference: {matchResult.inference_latency_ms}ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(matchResult.matched_fields || []).map((m: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-mono shadow-2xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Raw Header:</span>
                    <strong className="text-slate-800">{m.raw_column}</strong>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                  <div className="text-right">
                    <span className="text-blue-700 font-bold block">{m.matched_canonical_field}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{m.confidence_pct} match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
