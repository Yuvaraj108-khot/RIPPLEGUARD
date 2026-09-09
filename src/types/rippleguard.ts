export type NodeType = 'application' | 'service' | 'library' | 'micro_dependency';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  version: string;
  vulnerable?: boolean;
  cve?: string;
  cvss?: number;
  epss?: number;
  reachable?: boolean;
  business_criticality?: number;
  direct_fan_in?: number;
  transitive_fan_in?: number;
  betweenness_centrality?: number;
  reachable_apps_count?: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  target_node: string;
}

export interface GraphHealth {
  node_count: number;
  edge_count: number;
  orphan_nodes: string[];
  sbom_confidence: number;
  status: 'HEALTHY' | 'DEGRADED';
}

export interface SimulationResult {
  target: {
    id: string;
    label: string;
    version: string;
    cve: string;
    cvss: number;
    scenario_type: string;
  };
  downstream_packages_count: number;
  reachable_applications_count: number;
  critical_applications_count: number;
  propagation_paths_count: number;
  maximum_depth_hops: number;
  top_path: string[];
  all_paths: Array<{
    node_ids: string[];
    labels: string[];
    hops: number;
  }>;
  downstream_apps_details: Array<{
    id: string;
    label: string;
    business_criticality: number;
    entry_point: string;
  }>;
  propagation_edges: Array<{ from: string; to: string }>;
  affected_node_ids: string[];
}

export interface RiskResult {
  score: number;
  classification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  color: string;
  factors: {
    vulnerability_severity: number;
    ecosystem_exposure: number;
    structural_centrality: number;
    execution_reachability: number;
    propagation_potential: number;
    business_criticality: number;
    maintenance_risk: number;
  };
  formula_explanation: string;
}

export interface MitigationOption {
  id: string;
  priority: number;
  action: string;
  short_title: string;
  target_app: string;
  risk_reduction_pct: number;
  effort: 'Low' | 'Medium' | 'High';
  effort_score: number;
  description: string;
  safe_edges_neutralized: number;
  status: string;
}

export interface GroundedAIExplanation {
  evidence: any;
  developer_view: string;
  executive_view: string;
  key_takeaway: string;
}
