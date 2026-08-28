import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, ArrowRight, Table } from 'lucide-react';

interface AutoSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AutoSchemaModal: React.FC<AutoSchemaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'complete'>('upload');

  if (!isOpen) return null;

  const handleSimulateIngest = () => {
    setIsProcessing(true);
    setStep('mapping');
    setTimeout(() => {
      setIsProcessing(false);
      setStep('complete');
    }, 2400);
  };

  const handleFinalize = () => {
    onSuccess();
    onClose();
    setStep('upload');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">AI Zero-Shot Auto-Schema Graph Ingest</h3>
              <p className="text-[11px] text-purple-300 font-mono">Deep-Tech Innovation 1 &bull; Cosine Similarity Mapper</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'upload' && (
          <div className="space-y-4 text-xs">
            <p className="text-gray-300 leading-relaxed">
              Upload raw heterogeneous dumps from any legacy ERP (SAP S/4HANA, NetSuite, Oracle, Salesforce). Our <strong>Zero-Shot Column Embedding Matcher</strong> maps arbitrary tables to canonical revenue primitives in seconds.
            </p>

            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-700 hover:border-purple-500/60 bg-[#0B0F19] flex flex-col items-center justify-center space-y-2 cursor-pointer transition">
              <Table className="w-8 h-8 text-purple-400" />
              <span className="font-bold text-gray-200">SAP_Enterprise_Transactions_Q3.csv</span>
              <span className="text-[10px] text-gray-400 font-mono">46 Records &bull; 14 Disparate Column Headers Detected</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSimulateIngest}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition"
              >
                <span>Run Zero-Shot Embeddings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/60 flex items-center justify-center animate-spin">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Computing Vector Cosine Similarities...</h4>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                Matching unlabelled headers (e.g. 'VBELN', 'WRBTR', 'KUNNR') &rarr; Canonical Primitives
              </p>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>100% Vector Match:</strong> All 14 SAP fields mapped to Canonical Schema with 99.4% confidence.</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Embedding Match Results:</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {[
                  { raw: 'VBELN_SALES_DOC', mapped: 'order_id', conf: '99.8%' },
                  { raw: 'WRBTR_AMOUNT_LC', mapped: 'order_amount', conf: '99.4%' },
                  { raw: 'KUNNR_CUSTOMER_NO', mapped: 'customer_id', conf: '98.9%' },
                  { raw: 'DISC_OVERRIDE_VAL', mapped: 'discount_percent', conf: '99.1%' },
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded-xl bg-[#0B0F19] border border-gray-800 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-gray-400">{m.raw}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-cyan-300 font-bold">{m.mapped}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                      {m.conf}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleFinalize}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
              >
                Confirm Canonical Normalization
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
