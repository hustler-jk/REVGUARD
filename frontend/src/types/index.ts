export type Role = 'CFO' | 'FINANCE_OPS' | 'REV_OPS';
export type FilterMode = 'ALL' | 'COMPANY_SIDE' | 'CUSTOMER_SIDE';

export interface RevenueCase {
  id: string;
  case_number?: number;
  title: string;
  category: string;
  status: string;
  owner: string;

  entity_ref: string;
  root_cause_id?: string;
  exposure_amt: number;
  recoverable_amt: number;
  recovery_probability: number;
  expected_recovery: number;
  confidence: number;
  escalation_score: number;
  case_aging_days: number;
  opened_at: string;
  approval_stage?: string;
  endorsed_by?: string;
  approved_by?: string;
  approval_history?: Array<Record<string, any>>;
  reason_codes: string[];
  evidence_data: Record<string, any>;
  risk_breakdown: Record<string, any>;
  suggested_immunization: {
    title?: string;
    control?: string;
    difficulty?: string;
    estimated_mitigation?: string;
  };
  graph_payload?: {
    nodes?: Array<{ id: string; label: string; status: string; type: string }>;
    edges?: Array<{ source: string; target: string }>;
    broken_link?: string;
  };
  is_hero?: boolean;
  hero_case_number?: number;
}

export interface RootCause {
  id: string;
  cause_type: string;
  cause_key: string;
  description: string;
  total_exposure: number;
  case_count: number;
  immunization_rule?: string;
  early_warning_trend?: {
    timeline?: Array<{
      week: string;
      avg_discount_pct: number;
      exposure: number;
      case_count: number;
      alert?: string;
    }>;
  };
}

export interface Customer {
  customer_id: string;
  name: string;
  segment: string;
  arr: number;
  lifetime_revenue: number;
  payment_failure_count: number;
  overdue_days: number;
  churn_probability: number;
  revenue_at_risk: number;
  status: string;
  shap_factors: Array<{
    feature: string;
    label: string;
    impact_score: number;
    direction: 'RISK_INCREASE' | 'RISK_DECREASE';
    value: string;
  }>;
}

export interface AuditLog {
  id: number;
  case_id: string;
  action: string;
  reviewer_id: string;
  previous_status?: string;
  new_status: string;
  details?: Record<string, any>;
  previous_hash: string;
  current_hash: string;
  timestamp: string;
}

export interface DashboardSummary {
  total_exposure: number;
  recoverable_amount: number;
  expected_recovery: number;
  revenue_at_risk_90d: number;
  active_cases_count: number;
  recovered_amount_to_date: number;
  funnel: {
    suspicious_value: number;
    probable_leakage: number;
    recoverable_amount: number;
    expected_recovery: number;
  };
  cost_of_inaction_projection: {
    projected_eom_exposure: number;
    velocity_pct: string;
    daily_run_rate: number;
    description: string;
  };
  heatmap_dimensions: Array<{
    dimension: string;
    channel: string;
    region: string;
    exposure: number;
    risk_level: string;
  }>;
  evaluation_metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    root_cause_clustering_accuracy: string;
  };
  monthly_trend: Array<{
    month: string;
    amount: number;
  }>;
}
