import { DashboardSummary, RevenueCase, RootCause, Customer } from '../types';

const API_BASE = '/api/v1';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchCases(params?: { category?: string; owner?: string; sort?: string }): Promise<RevenueCase[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.owner) query.append('owner', params.owner);
  if (params?.sort) query.append('sort', params.sort);
  const res = await fetch(`${API_BASE}/cases?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function fetchRootCauses(): Promise<RootCause[]> {
  const res = await fetch(`${API_BASE}/root-causes`);
  if (!res.ok) throw new Error('Failed to fetch root causes');
  return res.json();
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomerRisk(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/customers/${id}/risk`);
  if (!res.ok) throw new Error('Failed to fetch customer risk');
  return res.json();
}

export async function fetchCaseGraph(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${id}/graph`);
  if (!res.ok) throw new Error('Failed to fetch graph');
  return res.json();
}

export async function reviewCaseAction(caseId: string, payload: { action: string; reviewer_id: string; reviewer_name: string; reviewer_role: string; notes?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to review case');
  return res.json();
}

export async function triggerRemediationWebhook(payload: { case_id: string; action: string; reviewer_id: string; reviewer_name: string; amount: number }): Promise<any> {

  const res = await fetch(`${API_BASE}/remediate/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to fire remediation webhook');
  return res.json();
}

export async function fetchDBSCANClustering(): Promise<any> {
  const res = await fetch(`${API_BASE}/root-causes/analytics/dbscan-clustering`);
  if (!res.ok) throw new Error('Failed to fetch DBSCAN clusters');
  return res.json();
}

export async function fetchAuditLogs(): Promise<any[]> {

  const res = await fetch(`${API_BASE}/audit-log`);
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
}

export async function verifyAuditChain(): Promise<any> {
  const res = await fetch(`${API_BASE}/audit-log/verify`);
  if (!res.ok) throw new Error('Failed to verify audit chain');
  return res.json();
}

export async function reseedData(): Promise<any> {
  const res = await fetch(`${API_BASE}/ingest/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reseed');
  return res.json();
}

export async function ingestLiveRecord(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/ingest/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to ingest record');
  return res.json();
}

export async function fetchModelsStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/models/status`);
  if (!res.ok) throw new Error('Failed to fetch AI models status');
  return res.json();
}

export async function matchColumnsWithAI(columns: string[]): Promise<any> {
  const res = await fetch(`${API_BASE}/models/match-columns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns })
  });
  if (!res.ok) throw new Error('Failed to match columns with AI');
  return res.json();
}

export async function executeCSVPipeline(csvContent: string, sourceName: string = "SAP_ERP_Export.csv"): Promise<any> {
  const res = await fetch(`${API_BASE}/ingest/csv-pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv_content: csvContent, source_name: sourceName })
  });
  if (!res.ok) throw new Error('Failed to execute CSV pipeline');
  return res.json();
}

export async function fetchIntegrations(): Promise<any> {
  const res = await fetch(`${API_BASE}/integrations`);
  if (!res.ok) throw new Error('Failed to fetch integrations');
  return res.json();
}

export async function triggerConnectorSync(connectorId: string, apiKey?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/integrations/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connector_id: connectorId, api_key: apiKey })
  });
  if (!res.ok) throw new Error('Failed to trigger connector sync');
  return res.json();
}

export async function sendInboundWebhook(payload: { source: string; event_type: string; data: any }): Promise<any> {
  const res = await fetch(`${API_BASE}/integrations/webhook/inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to send inbound webhook');
  return res.json();
}

export async function fetchPolicySettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/policy/settings`);
  if (!res.ok) throw new Error('Failed to fetch policy settings');
  return res.json();
}

export async function updatePolicySettings(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/policy/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update policy settings');
  return res.json();
}

export async function runWhatIfSimulation(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/policy/simulate-what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to run What-If simulation');
  return res.json();
}

export async function commitPipelineCases(cases: any[], sourceName: string = "Live Pipeline Upload"): Promise<any> {
  const res = await fetch(`${API_BASE}/ingest/commit-pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cases, source_name: sourceName })
  });
  if (!res.ok) throw new Error('Failed to commit pipeline cases');
  return res.json();
}

export async function fetchCaseAIExplanation(caseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/ai-explain`);
  if (!res.ok) throw new Error('Failed to fetch AI explanation');
  return res.json();
}

