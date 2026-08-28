import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { ingestLiveRecord } from '../../api/client';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [orderId, setOrderId] = useState('ORD-LIVE-9921');
  const [custId, setCustId] = useState('CUST-102');
  const [amount, setAmount] = useState(88000);
  const [leakType, setLeakType] = useState('MISSING_INVOICE');
  const [empId, setEmpId] = useState('EMP-402');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      order_id: orderId,
      customer_id: custId,
      order_amount: amount,
      order_status: 'COMPLETED',
      invoice_id: leakType === 'MISSING_INVOICE' ? null : `INV-${orderId}`,
      invoice_amount: leakType === 'MISSING_INVOICE' ? null : amount,
      discount_percent: leakType === 'UNAUTHORIZED_DISCOUNT' ? 35.0 : 0.0,
      employee_id: empId
    };

    try {
      const res = await ingestLiveRecord(payload);
      onSuccess(res);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-white">Event-Triggered Ingest (§7.7)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Simulate an incoming REST event from your order/billing gateway. Ingests immediately and evaluates the deterministic rule layer in real time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Customer ID</label>
              <input
                type="text"
                value={custId}
                onChange={(e) => setCustId(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Order Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Simulate Anomaly Type</label>
              <select
                value={leakType}
                onChange={(e) => setLeakType(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="MISSING_INVOICE">Missing Invoice (No Invoice ID)</option>
                <option value="UNAUTHORIZED_DISCOUNT">Unauthorized Discount (35%)</option>
                <option value="CLEAN">Clean Transaction (Normal)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Approver / Employee</label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono font-medium"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md transition"
            >
              Ingest & Evaluate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
