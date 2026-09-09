import networkx as nx
from typing import Dict, Any

class RiskEngine:
    def calculate_ripple_risk(self, graph: nx.DiGraph, simulation_data: Dict[str, Any]) -> Dict[str, Any]:
        target_info = simulation_data.get("target", {})
        cvss = target_info.get("cvss", 9.8)
        
        # Sub-signal 1: Vulnerability Severity (0-100)
        s_vuln = min(100.0, cvss * 10.0)

        # Sub-signal 2: Ecosystem Exposure (0-100)
        downstream_pkgs = simulation_data.get("downstream_packages_count", 0)
        s_exposure = min(100.0, (downstream_pkgs / 20.0) * 100.0) if downstream_pkgs > 0 else 40.0

        # Sub-signal 3: Structural Centrality (0-100)
        s_centrality = min(100.0, simulation_data.get("propagation_paths_count", 1) * 12.0)

        # Sub-signal 4: Execution Reachability (0-100)
        # 100 if reachable from production entry points, 30 if unreachable
        s_reachability = 100.0 if simulation_data.get("reachable_applications_count", 0) > 0 else 30.0

        # Sub-signal 5: Propagation Potential (0-100)
        depth = simulation_data.get("maximum_depth_hops", 1)
        s_propagation = min(100.0, (depth / 6.0) * 100.0)

        # Sub-signal 6: Business Criticality (0-100)
        apps = simulation_data.get("downstream_apps_details", [])
        max_biz_crit = max([a.get("business_criticality", 50) for a in apps]) if apps else 75.0
        s_biz_crit = float(max_biz_crit)

        # Sub-signal 7: Maintenance Posture Risk (0-100)
        # Low hygiene / abandoned package = high risk contribution
        target_node = target_info.get("id")
        hygiene = graph.nodes[target_node].get("maintainer_hygiene", 20) if target_node in graph else 20
        s_maintenance = float(100 - hygiene)

        # Weighted formula for Ripple Risk Score
        weights = {
            "vuln": 0.20,
            "exposure": 0.15,
            "centrality": 0.15,
            "reachability": 0.20,
            "propagation": 0.10,
            "biz_crit": 0.10,
            "maintenance": 0.10
        }

        weighted_score = (
            s_vuln * weights["vuln"] +
            s_exposure * weights["exposure"] +
            s_centrality * weights["centrality"] +
            s_reachability * weights["reachability"] +
            s_propagation * weights["propagation"] +
            s_biz_crit * weights["biz_crit"] +
            s_maintenance * weights["maintenance"]
        )

        final_score = int(round(weighted_score))

        # Risk Classification
        if final_score >= 80:
            classification = "CRITICAL"
            color = "#EF4444"
        elif final_score >= 60:
            classification = "HIGH"
            color = "#F97316"
        elif final_score >= 40:
            classification = "MEDIUM"
            color = "#EAB308"
        else:
            classification = "LOW"
            color = "#10B981"

        return {
            "score": final_score,
            "classification": classification,
            "color": color,
            "factors": {
                "vulnerability_severity": round(s_vuln, 1),
                "ecosystem_exposure": round(s_exposure, 1),
                "structural_centrality": round(s_centrality, 1),
                "execution_reachability": round(s_reachability, 1),
                "propagation_potential": round(s_propagation, 1),
                "business_criticality": round(s_biz_crit, 1),
                "maintenance_risk": round(s_maintenance, 1)
            },
            "formula_explanation": "Ripple Risk = 20% Vuln + 20% Reachability + 15% Exposure + 15% Centrality + 10% Propagation + 10% Business Impact + 10% Maintenance"
        }

risk_engine = RiskEngine()
