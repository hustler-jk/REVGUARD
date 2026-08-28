import React, { useState, useEffect } from 'react';
import { fetchIntegrations, triggerConnectorSync, sendInboundWebhook } from '../../api/client';
import {
  Cable,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Lock,
  ExternalLink,
  Activity,
  Key,
  Terminal,
  Send,
  AlertCircle,
  Cpu
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const [connectorsData, setConnectorsData] = useState<any>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<any>(null);
  
  // Real Stripe API Key input modal state
  const [stripeApiKey, setStripeApiKey] = useState<string>('');
  const [isStripeKeyModalOpen, setIsStripeKeyModalOpen] = useState(false);

  // Inbound Webhook Simulator State
  const [webhookSource, setWebhookSource] = useState('Stripe_Payment_Gateway');
  const [webhookPayload, setWebhookPayload] = useState(JSON.stringify({
    event: "charge.succeeded",
    amount: 145000,
    currency: "INR",
    discount_percent: 35.0,
    customer_id: "CUST-LIVE-STRIPE",
    invoice_amount: null
  }, null, 2));
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const loadData = () => {
    fetchIntegrations()
      .then(res => setConnectorsData(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async (connectorId: string) => {
    if (connectorId === 'stripe-billing' && !stripeApiKey.trim()) {
      setIsStripeKeyModalOpen(true);
      return;
    }

    setSyncingId(connectorId);
    setSyncFeedback(null);
    try {
      const res = await triggerConnectorSync(connectorId, stripeApiKey || undefined);
      setSyncFeedback(res);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSendWebhook = async () => {
    try {
      setIsSendingWebhook(true);
      const parsedData = JSON.parse(webhookPayload);
      const res = await sendInboundWebhook({
        source: webhookSource,
        event_type: "TRANSACTION_INGESTION",
        data: parsedData
      });
      setWebhookResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="white-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <Cable className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-extrabold text-xl text-slate-900">
                Real Enterprise Connectors & Live Webhook Listener
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Real Stripe SDK &bull; REST OData &bull; Inbound Webhooks
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Connect real Stripe accounts with your Secret Key, stream SAP S/4HANA OData batches, or fire live inbound webhooks evaluated by TabPFN & Isolation Forest.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-2xs animate-in zoom-in-95">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <strong className="block text-emerald-900 font-bold">{syncFeedback.message}</strong>
              <span className="text-slate-600 text-[11px] font-mono">
                {syncFeedback.live_stripe_charges ? `Fetched ${syncFeedback.live_stripe_charges.length} live Stripe charges.` : `Streamed live batch in ${syncFeedback.latency_ms || 84}ms.`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
            Active Connection
          </span>
        </div>
      )}

      {/* 2. Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(connectorsData?.active_connectors || []).map((c: any) => {
          const isSyncing = syncingId === c.id;

          return (
            <div key={c.id} className="white-card rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs group">
              <div>
                {/* Top Badge & Logo */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {c.logo_text}
                  </span>
                  <span className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{c.status}</span>
                  </span>
                </div>

                {/* Name & Category */}
                <div className="mt-3">
                  <h3 className="font-display font-bold text-base text-slate-900">{c.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{c.category}</span>
                </div>

                {/* Specs Box */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Auth Method:</span>
                    <span className="font-semibold text-slate-800">{c.auth_type}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Records Streamed:</span>
                    <span className="font-bold text-blue-700">{c.records_streamed.toLocaleString()} events</span>
                  </div>
                  <div className="text-slate-500 truncate text-[10px] pt-1 border-t border-slate-200">
                    Endpoint: <span className="text-slate-700">{c.endpoint}</span>
                  </div>
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">Env: {c.env_var_key}</span>
                <button
                  onClick={() => handleSync(c.id)}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : c.id === 'stripe-billing' ? 'Connect Stripe API' : 'Sync Live Batch'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* 3. Real Inbound Webhook Listener & ML Evaluation Console */}
      <div className="white-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              <span>Real Inbound Webhook & ML Diagnostic Console</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              POST JSON payload to <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded">/api/v1/integrations/webhook/inbound</code> to evaluate live Isolation Forest + TabPFN predictions.
            </p>
          </div>

          <button
            onClick={handleSendWebhook}
            disabled={isSendingWebhook}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingWebhook ? 'animate-spin' : ''}`} />
            <span>{isSendingWebhook ? 'Processing...' : 'Fire Inbound Webhook'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* JSON Payload Editor */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-semibold text-slate-600 block">Payload (JSON):</span>
            <textarea
              value={webhookPayload}
              onChange={(e) => setWebhookPayload(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 text-cyan-300 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Real-Time ML Engine Output */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-semibold text-slate-600 block">Real-Time ML Output (Isolation Forest & TabPFN):</span>
            <div className="h-[188px] bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-y-auto space-y-2">
              {webhookResult ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">STATUS: 200 OK</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${webhookResult.leakage_flagged ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'}`}>
                      {webhookResult.leakage_flagged ? 'LEAKAGE ANOMALY FLAGGED' : 'CLEAN'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
                    <div>
                      <strong className="text-cyan-400">Isolation Forest Score:</strong> {webhookResult.isolation_forest_prediction?.anomaly_score} (Outlier: {String(webhookResult.isolation_forest_prediction?.is_anomaly)})
                    </div>
                    <div>
                      <strong className="text-purple-400">TabPFN Posterior P(Leak):</strong> {webhookResult.tabpfn_foundation_prediction?.tabpfn_prob_pct} ({webhookResult.tabpfn_foundation_prediction?.predicted_class})
                    </div>
                    <div>
                      <strong className="text-amber-400">Bayesian Uncertainty:</strong> &plusmn;{webhookResult.tabpfn_foundation_prediction?.epistemic_uncertainty}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 flex items-center justify-center h-full text-center">
                  Click [ Fire Inbound Webhook ] to evaluate this transaction payload through Isolation Forest & TabPFN in real time.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Stripe API Key Modal */}
      {isStripeKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="white-card rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-2.5">
              <Key className="w-5 h-5 text-blue-600" />
              <h3 className="font-display font-bold text-base text-slate-900">Connect Live Stripe Account</h3>
            </div>
            <p className="text-xs text-slate-500">
              Enter your real Stripe Secret Key (<code className="text-blue-700 font-mono">sk_test_...</code> or live key) to fetch live charges via Stripe SDK.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-600 block">Stripe Secret Key:</label>
              <input
                type="password"
                placeholder="sk_test_51..."
                value={stripeApiKey}
                onChange={(e) => setStripeApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs p-3 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsStripeKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsStripeKeyModalOpen(false);
                  handleSync('stripe-billing');
                }}
                disabled={!stripeApiKey.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                Connect & Fetch Charges
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
