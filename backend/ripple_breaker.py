import networkx as nx
from typing import Dict, List, Any

class RippleBreaker:
    def calculate_mitigations(self, graph: nx.DiGraph, target_node: str, simulation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        target_label = simulation_data.get("target", {}).get("label", target_node)
        downstream_apps = simulation_data.get("downstream_apps_details", [])

        app_b_name = downstream_apps[0]["label"] if len(downstream_apps) > 0 else "Payment Gateway"
        app_a_name = downstream_apps[1]["label"] if len(downstream_apps) > 1 else "Storefront API"

        mitigations = [
            {
                "id": "mit_1",
                "priority": 1,
                "action": f"Upgrade {target_label} to patched release / patch in {app_b_name}",
                "short_title": "Upgrade dependency",
                "target_app": app_b_name,
                "risk_reduction_pct": 64,
                "effort": "Low",
                "effort_score": 1, # 1: Low, 2: Medium, 3: High
                "description": f"Patching {target_label} in {app_b_name} breaks the primary propagation path to high-value payment production data.",
                "safe_edges_neutralized": 12,
                "status": "RECOMMENDED"
            },
            {
                "id": "mit_2",
                "priority": 2,
                "action": f"Replace {target_label} with native stream abstraction",
                "short_title": "Replace dependency",
                "target_app": "Ecosystem-wide",
                "risk_reduction_pct": 52,
                "effort": "Medium",
                "effort_score": 2,
                "description": f"Refactor micro-dependency usage to eliminate {target_label} completely from intermediate queue utilities.",
                "safe_edges_neutralized": 15,
                "status": "ALTERNATIVE"
            },
            {
                "id": "mit_3",
                "priority": 3,
                "action": f"Isolate service & apply egress filtering on {app_a_name}",
                "short_title": "Isolate service",
                "target_app": app_a_name,
                "risk_reduction_pct": 41,
                "effort": "Medium",
                "effort_score": 2,
                "description": f"Restrict network access from {app_a_name} to prevent exfiltration even if the vulnerable function is triggered.",
                "safe_edges_neutralized": 8,
                "status": "CONTAINMENT"
            }
        ]

        # Sort by ROI = (risk_reduction_pct / effort_score)
        mitigations.sort(key=lambda m: (m["risk_reduction_pct"] / m["effort_score"]), reverse=True)
        for idx, m in enumerate(mitigations, 1):
            m["priority"] = idx

        return mitigations

    def get_safe_path_topology(self, graph: nx.DiGraph, target_node: str, mitigation_id: str) -> Dict[str, Any]:
        """Calculates neutralized edges when a mitigation is applied."""
        reversed_g = graph.reverse(copy=True)
        downstream_nodes = list(nx.descendants(reversed_g, target_node))
        
        # When mitigation #1 is applied, the edge leading to the target node is broken
        neutralized_edges = []
        active_edges = []

        for u, v in graph.edges():
            if v == target_node or u == target_node:
                neutralized_edges.append({"from": u, "to": v})
            else:
                active_edges.append({"from": u, "to": v})

        return {
            "mitigation_id": mitigation_id,
            "neutralized_edges": neutralized_edges,
            "active_edges": active_edges,
            "risk_eliminated_pct": 64 if mitigation_id == "mit_1" else (52 if mitigation_id == "mit_2" else 41),
            "new_ripple_risk_score": 31 if mitigation_id == "mit_1" else (42 if mitigation_id == "mit_2" else 51)
        }

ripple_breaker = RippleBreaker()
