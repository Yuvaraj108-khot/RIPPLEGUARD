import networkx as nx
from typing import Dict, List, Any

class SimulationEngine:
    def simulate_compromise(self, graph: nx.DiGraph, target_node: str, scenario_type: str = "malicious_release") -> Dict[str, Any]:
        """
        Simulates the downstream propagation of a compromised package.
        Uses reversed graph traversal because if A depends on B (A -> B), 
        a compromise in B propagates downstream to A.
        """
        if target_node not in graph:
            return {"error": f"Target node {target_node} not found in graph"}

        target_data = graph.nodes[target_node]
        reversed_g = graph.reverse(copy=True)

        # Find all reachable downstream nodes from target in the reversed graph
        downstream_nodes = list(nx.descendants(reversed_g, target_node))
        
        # Categorize downstream nodes
        downstream_packages = [
            n for n in downstream_nodes 
            if graph.nodes[n].get("type") in ["library", "micro_dependency"]
        ]
        
        downstream_apps = [
            n for n in downstream_nodes 
            if graph.nodes[n].get("type") in ["application", "service"]
        ]
        
        critical_apps = [
            n for n in downstream_apps 
            if graph.nodes[n].get("business_criticality", 0) >= 80
        ]

        # Calculate all propagation paths from vulnerable target to root applications
        all_paths = []
        max_depth = 0
        
        for app in downstream_apps:
            try:
                # Find paths from target_node to app in reversed_g (which corresponds to app -> target_node in original)
                paths = list(nx.all_simple_paths(reversed_g, target_node, app))
                for path in paths:
                    # Reverse path so it shows app -> ... -> target_node
                    human_path = [graph.nodes[node_id].get("label", node_id) for node_id in reversed(path)]
                    all_paths.append({
                        "node_ids": list(reversed(path)),
                        "labels": human_path,
                        "hops": len(path) - 1
                    })
                    if len(path) - 1 > max_depth:
                        max_depth = len(path) - 1
            except Exception:
                pass

        # Sort paths by business criticality of the root app
        all_paths.sort(key=lambda p: graph.nodes[p["node_ids"][0]].get("business_criticality", 0), reverse=True)
        top_path = all_paths[0]["labels"] if all_paths else [target_data.get("label", target_node)]

        # Highlighted nodes and edges for animation in frontend canvas
        affected_nodes_set = set([target_node] + downstream_nodes)
        propagation_edges = []
        for u, v in graph.edges():
            if u in affected_nodes_set and v in affected_nodes_set:
                propagation_edges.append({"from": u, "to": v})

        return {
            "target": {
                "id": target_node,
                "label": target_data.get("label", target_node),
                "version": target_data.get("version", "1.0.0"),
                "cve": target_data.get("cve", "CVE-2018-3721"),
                "cvss": target_data.get("cvss", 9.8),
                "scenario_type": scenario_type
            },
            "downstream_packages_count": len(downstream_packages),
            "reachable_applications_count": len(downstream_apps),
            "critical_applications_count": len(critical_apps),
            "propagation_paths_count": max(len(all_paths), 1),
            "maximum_depth_hops": max(max_depth, 1),
            "top_path": top_path,
            "all_paths": all_paths,
            "downstream_apps_details": [
                {
                    "id": app,
                    "label": graph.nodes[app].get("label", app),
                    "business_criticality": graph.nodes[app].get("business_criticality", 50),
                    "entry_point": graph.nodes[app].get("entry_point", "N/A")
                }
                for app in downstream_apps
            ],
            "propagation_edges": propagation_edges,
            "affected_node_ids": list(affected_nodes_set)
        }

simulation_engine = SimulationEngine()
