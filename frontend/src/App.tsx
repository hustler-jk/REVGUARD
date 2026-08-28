import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './components/views/DashboardView';
import { PriorityCasesView } from './components/views/PriorityCasesView';
import { RootCauseView } from './components/views/RootCauseView';
import { CustomerIntelView } from './components/views/CustomerIntelView';
import { AuditTrailView } from './components/views/AuditTrailView';
import { ModelsHubView } from './components/views/ModelsHubView';
import { LivePipelineStudioView } from './components/views/LivePipelineStudioView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { WhatIfSimulatorView } from './components/views/WhatIfSimulatorView';
import { LoginView } from './components/views/LoginView';
import { CaseInvestigationDrawer } from './components/drawers/CaseInvestigationDrawer';
import { IngestModal } from './components/modals/IngestModal';
import { ERPWebhookReceiptModal } from './components/modals/ERPWebhookReceiptModal';
import { AutoSchemaModal } from './components/modals/AutoSchemaModal';
import {
  fetchDashboardSummary,
  fetchCases,
  fetchRootCauses,
  fetchCustomers,
  reseedData,
  reviewCaseAction,
  triggerRemediationWebhook
} from './api/client';
import { DashboardSummary, RevenueCase, RootCause, Customer, FilterMode } from './types';
import { Info } from 'lucide-react';

function AppContent() {
  const { persona, currentRole, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginView />;
  }
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'pipeline' | 'integrations' | 'cases' | 'rootcauses' | 'customers' | 'audit' | 'models'>('overview');
  
  // Global Filter State
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');

  // Datasets
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cases, setCases] = useState<RevenueCase[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Modals & Drawers
  const [selectedCase, setSelectedCase] = useState<RevenueCase | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [autoSchemaOpen, setAutoSchemaOpen] = useState(false);
  const [webhookReceipt, setWebhookReceipt] = useState<any | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [sumRes, casesRes, rcRes, custRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchCases(),
        fetchRootCauses(),
        fetchCustomers()
      ]);
      setSummary(sumRes);
      setCases(casesRes);
      setRootCauses(rcRes);
      setCustomers(custRes);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // When switching role, align the active tab to the role's primary focus
  useEffect(() => {
    if (currentRole === 'REV_OPS' && (activeTab === 'overview' || activeTab === 'audit')) {
      setActiveTab('customers');
    } else if (currentRole === 'FINANCE_OPS' && activeTab === 'customers') {
      setActiveTab('cases');
    }
  }, [currentRole]);

  // Reseed data
  const handleReseed = async () => {
    try {
      await reseedData();
      showToast('Database Reseeded', 'Canonical dataset & 4 Hero Cases refreshed.');
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Inspect Case (Open Drawer)
  const handleInspectCase = (c: RevenueCase) => {
    setSelectedCase(c);
    setIsDrawerOpen(true);
  };

  // Action: Confirm Recovery & Trigger ERP Webhook
  const handleConfirmRecovery = async (c: RevenueCase) => {
    try {
      const webhookRes = await triggerRemediationWebhook({
        case_id: c.id,
        action: 'CONFIRM_RECOVERY',
        reviewer_id: persona.role,
        reviewer_name: persona.name,
        amount: c.exposure_amt
      });
      setWebhookReceipt(webhookRes);
      showToast('ERP Webhook Dispatched', 'Action Hashed with SHA-256 & Idempotency Key generated.');
      setIsDrawerOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Mark as Legitimate / Normal Exception
  const handleMarkNormal = async (c: RevenueCase) => {
    try {
      await reviewCaseAction(c.id, {
        action: 'REJECT',
        reviewer_id: persona.role,
        reviewer_name: persona.name,
        reviewer_role: persona.title,
        notes: 'Cleared as verified legitimate business transaction.'
      });
      showToast('Case Cleared', `${c.id} marked as NORMAL / legitimate exception.`);
      setIsDrawerOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Escalate to CFO
  const handleEscalate = async (c: RevenueCase) => {
    try {
      await reviewCaseAction(c.id, {
        action: 'ESCALATE',
        reviewer_id: persona.role,
        reviewer_name: persona.name,
        reviewer_role: persona.title,
        notes: `Urgent escalation forwarded to CFO by ${persona.name}.`
      });
      showToast('Case Escalated', `${c.id} escalated to Executive CFO queue.`);
      setIsDrawerOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Hero Quick Select
  const handleSelectHero = (heroNum: number) => {
    if (heroNum === 1) {
      setActiveTab('cases');
      const h1 = cases.find(c => c.id === 'CASE-HERO-001');
      if (h1) handleInspectCase(h1);
    } else if (heroNum === 2) {
      setActiveTab('rootcauses');
    } else if (heroNum === 3) {
      setActiveTab('cases');
      const h3 = cases.find(c => c.id === 'CASE-HERO-003');
      if (h3) handleInspectCase(h3);
    } else if (heroNum === 4) {
      setActiveTab('cases');
      const h4 = cases.find(c => c.id === 'CASE-HERO-004');
      if (h4) handleInspectCase(h4);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600/15 selection:text-blue-900 font-sans">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        caseCount={summary?.active_cases_count || cases.length}
        onOpenAutoSchema={() => setAutoSchemaOpen(true)}
        onOpenIngest={() => setIngestModalOpen(true)}
        onReseed={handleReseed}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Command Header */}
        <TopHeader
          filterMode={filterMode}
          onFilterChange={setFilterMode}
        />

        {/* View Main Content Area */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardView
              summary={summary}
              rootCauses={rootCauses}
              onNavigateToCases={() => setActiveTab('cases')}
              onNavigateToRootCauses={() => setActiveTab('rootcauses')}
            />
          )}

          {activeTab === 'simulator' && (
            <WhatIfSimulatorView />
          )}

          {activeTab === 'pipeline' && (
            <LivePipelineStudioView
              onTriggerWebhookReceipt={(res) => setWebhookReceipt(res)}
              onRefreshData={loadAllData}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView />
          )}

          {activeTab === 'cases' && (
            <PriorityCasesView
              cases={cases}
              filterMode={filterMode}
              onInspectCase={handleInspectCase}
            />
          )}

          {activeTab === 'rootcauses' && (
            <RootCauseView
              rootCauses={rootCauses}
              onApplyImmunization={(rc) => showToast('Immunization Deployed', `Proactive ERP rule enabled for ${rc.id}.`)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerIntelView
              customers={customers}
              onTriggerRecoveryPlan={(c) => showToast('Recovery Plan Initiated', `Smart dunning & card outreach triggered for ${c.name}.`)}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView />
          )}

          {activeTab === 'models' && (
            <ModelsHubView />
          )}
        </main>

      </div>

      {/* Slide-Over Case Investigation Drawer */}
      <CaseInvestigationDrawer
        revenueCase={selectedCase}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConfirmRecovery={handleConfirmRecovery}
        onMarkNormal={handleMarkNormal}
        onEscalate={handleEscalate}
      />

      {/* Event Ingest Modal */}
      <IngestModal
        isOpen={ingestModalOpen}
        onClose={() => setIngestModalOpen(false)}
        onSuccess={(res) => {
          showToast(res.leakage_detected ? 'Leakage Flagged (§7.7)' : 'Ingest Success', res.message);
          loadAllData();
        }}
      />

      {/* AI Zero-Shot Auto-Schema Modal */}
      <AutoSchemaModal
        isOpen={autoSchemaOpen}
        onClose={() => setAutoSchemaOpen(false)}
        onSuccess={() => {
          showToast('Schema Ingested', 'SAP dataset mapped via Zero-Shot Cosine Embeddings.');
          loadAllData();
        }}
      />

      {/* Closed-Loop ERP Webhook Receipt Modal */}
      <ERPWebhookReceiptModal
        receipt={webhookReceipt}
        onClose={() => setWebhookReceipt(null)}
      />

      {/* Realtime Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xl text-xs flex items-center space-x-3 transition-all animate-in slide-in-from-bottom-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{toast.title}</h4>
            <p className="text-slate-600">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
