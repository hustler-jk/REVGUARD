import React from 'react';
import { ShieldCheck, X, CheckCircle2, Lock, Terminal } from 'lucide-react';

interface ERPWebhookReceiptModalProps {
  receipt: any | null;
  onClose: () => void;
}

export const ERPWebhookReceiptModal: React.FC<ERPWebhookReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-cyan-500/50 glow-cyan-subtle rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Closed-Loop ERP Webhook Dispatched</h3>
              <p className="text-xs text-cyan-300 font-mono">NetSuite / SAP SOX-Compliant Cryptographic Receipt</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Box */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-bold block">Status: Idempotent Execution Confirmed</span>
            <span className="text-gray-300">The target ERP webhook processed the invoice draft payload without duplicate billing risks.</span>
          </div>
        </div>

        {/* Cryptographic Signature & Idempotency Key */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-gray-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Idempotency Key (ERP De-dup)</span>
            </span>
            <p className="text-cyan-300 font-bold mt-1 text-[11px] truncate">
              {receipt.idempotency_key}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-gray-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>SHA-256 SOX Signature</span>
            </span>
            <p className="text-emerald-300 font-bold mt-1 text-[11px] truncate">
              {receipt.hash_signature}
            </p>
          </div>
        </div>

        {/* Formatted JSON Payload */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono uppercase font-bold text-[10px]">Transmitted ERP Payload (JSON):</span>
          </div>
          <pre className="p-4 rounded-2xl bg-[#0B0F19] border border-gray-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-48 shadow-inner">
            {JSON.stringify(receipt.erp_payload, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
