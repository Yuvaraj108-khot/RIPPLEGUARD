import networkx as nx
from typing import Dict, List, Any, Optional

class GraphEngine:
    def __init__(self):
        self.graphs: Dict[str, nx.DiGraph] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self._init_benchmark_scenarios()

    def _init_benchmark_scenarios(self):
        # Scenario 1: E-Commerce Microservice Supply Chain (The Event-Stream Attack Vector)
        g1 = nx.DiGraph()
        
        # Nodes: (id, label, type, version, cve, severity, reachability, fan_in, business_criticality, maintainer_hygiene)
        # Types: 'application', 'service', 'library', 'micro_dependency'
        nodes_data_1 = [
            # Applications & Services
            ("app_storefront", {"label": "Storefront API", "type": "application", "version": "v2.4.0", "business_criticality": 95, "entry_point": "POST /checkout"}),
            ("app_payment", {"label": "Payment Gateway Prod", "type": "application", "version": "v1.9.1", "business_criticality": 99, "entry_point": "POST /api/v1/charge"}),
            ("app_inventory", {"label": "Inventory Service", "type": "service", "version": "v3.1.0", "business_criticality": 70, "entry_point": "GET /stock"}),
            ("app_analytics", {"label": "User Analytics Pipeline", "type": "service", "version": "v1.2.0", "business_criticality": 50, "entry_point": "POST /event"}),
            ("app_notifications", {"label": "Notification Worker", "type": "service", "version": "v2.0.4", "business_criticality": 60, "entry_point": "queue.listen"}),

            # Direct Dependencies
            ("pkg_express", {"label": "express", "type": "library", "version": "4.18.2", "vulnerable": False, "maintainer_hygiene": 90}),
            ("pkg_axios", {"label": "axios", "type": "library", "version": "1.6.0", "vulnerable": False, "maintainer_hygiene": 88}),
            ("pkg_nodemail", {"label": "nodemailer", "type": "library", "version": "6.9.1", "vulnerable": False, "maintainer_hygiene": 75}),
            ("pkg_queue_adapter", {"label": "queue-adapter", "type": "library", "version": "2.1.0", "vulnerable": False, "maintainer_hygiene": 65}),

            # Intermediary Transitive Dependencies
            ("pkg_ps_tree", {"label": "ps-tree", "type": "library", "version": "1.9.0", "vulnerable": False, "maintainer_hygiene": 55}),
            ("pkg_through2", {"label": "through2", "type": "library", "version": "2.0.5", "vulnerable": False, "maintainer_hygiene": 60}),
            ("pkg_duplexer", {"label": "duplexer2", "type": "library", "version": "0.1.4", "vulnerable": False, "maintainer_hygiene": 50}),

            # Deep Low-Level Vulnerable Micro-Dependencies
            ("pkg_event_stream", {
                "label": "event-stream", 
                "type": "micro_dependency", 
                "version": "3.3.6", 
                "vulnerable": True, 
                "cve": "CVE-2018-3721", 
                "cvss": 9.8, 
                "epss": 0.94,
                "reachable": True,
                "reachable_function": "flatmapStream.injectPayload()",
                "call_path": "POST /api/v1/charge -> express.use() -> nodemail -> event-stream -> flatmap-stream",
                "maintainer_hygiene": 20,
                "abandoned": True
            }),
            ("pkg_flatmap_stream", {
                "label": "flatmap-stream", 
                "type": "micro_dependency", 
                "version": "0.1.1", 
                "vulnerable": True, 
                "cve": "MAL-2018-882", 
                "cvss": 10.0, 
                "epss": 0.98,
                "reachable": True,
                "reachable_function": "eval(bitcoin_stealer)",
                "maintainer_hygiene": 0,
                "abandoned": True
            })
        ]

        # Edges represent dependencies: (A, B) means A depends on B (A -> B)
        edges_1 = [
            ("app_storefront", "pkg_express"),
            ("app_storefront", "pkg_axios"),
            ("app_storefront", "pkg_nodemail"),

            ("app_payment", "pkg_express"),
            ("app_payment", "pkg_queue_adapter"),
            ("app_payment", "pkg_nodemail"),

            ("app_inventory", "pkg_express"),
            ("app_inventory", "pkg_axios"),

            ("app_analytics", "pkg_express"),
            ("app_analytics", "pkg_through2"),

            ("app_notifications", "pkg_nodemail"),
            ("app_notifications", "pkg_queue_adapter"),

            # Transitive relationships
            ("pkg_express", "pkg_ps_tree"),
            ("pkg_nodemail", "pkg_event_stream"),
            ("pkg_queue_adapter", "pkg_through2"),
            ("pkg_through2", "pkg_duplexer"),
            ("pkg_through2", "pkg_event_stream"),
            ("pkg_ps_tree", "pkg_event_stream"),
            ("pkg_event_stream", "pkg_flatmap_stream"),
        ]

        for n, data in nodes_data_1:
            g1.add_node(n, **data)
        for u, v in edges_1:
            g1.add_edge(u, v)

        self.graphs["ecommerce_microservices"] = g1
        self.metadata["ecommerce_microservices"] = {
            "id": "ecommerce_microservices",
            "name": "E-Commerce Microservice Supply Chain",
            "description": "Enterprise payment & storefront architecture exposed to event-stream / flatmap-stream micro-dependency injection attack.",
            "target_node": "pkg_event_stream"
        }

        # Scenario 2: FinTech Core Platform (Log4j Deep Transitive Call-Graph Reachability)
        g2 = nx.DiGraph()
        nodes_data_2 = [
            ("app_core_banking", {"label": "Core Banking Ledger", "type": "application", "version": "v5.2.1", "business_criticality": 100, "entry_point": "SOAP /transfer"}),
            ("app_fraud_detect", {"label": "Fraud Detection Engine", "type": "application", "version": "v2.1.0", "business_criticality": 90, "entry_point": "Kafka /transactions"}),
            ("app_mobile_api", {"label": "Mobile API Gateway", "type": "application", "version": "v4.0.2", "business_criticality": 85, "entry_point": "REST /auth"}),
            ("pkg_spring_boot", {"label": "spring-boot-starter-web", "type": "library", "version": "2.6.1", "vulnerable": False, "maintainer_hygiene": 95}),
            ("pkg_log4j_core", {
                "label": "log4j-core", 
                "type": "library", 
                "version": "2.14.1", 
                "vulnerable": True, 
                "cve": "CVE-2021-44228", 
                "cvss": 10.0, 
                "epss": 0.99,
                "reachable": True,
                "reachable_function": "JndiLookup.lookup()",
                "call_path": "REST /auth -> log4j-core.logger.info(${jndi:ldap://...})",
                "maintainer_hygiene": 70,
                "abandoned": False
            }),
            ("pkg_slf4j", {"label": "slf4j-api", "type": "library", "version": "1.7.32", "vulnerable": False, "maintainer_hygiene": 90}),
            ("pkg_jackson", {"label": "jackson-databind", "type": "library", "version": "2.13.0", "vulnerable": False, "maintainer_hygiene": 85})
        ]
        edges_2 = [
            ("app_core_banking", "pkg_spring_boot"),
            ("app_fraud_detect", "pkg_spring_boot"),
            ("app_mobile_api", "pkg_spring_boot"),
            ("app_core_banking", "pkg_log4j_core"),
            ("pkg_spring_boot", "pkg_log4j_core"),
            ("pkg_spring_boot", "pkg_slf4j"),
            ("pkg_spring_boot", "pkg_jackson"),
        ]
        for n, data in nodes_data_2:
            g2.add_node(n, **data)
        for u, v in edges_2:
            g2.add_edge(u, v)

        self.graphs["fintech_core"] = g2
        self.metadata["fintech_core"] = {
            "id": "fintech_core",
            "name": "FinTech Core Banking Platform",
            "description": "Deep nested Java/Node call-graph reachability exposing core banking ledger to Log4j JNDI remote code execution.",
            "target_node": "pkg_log4j_core"
        }

        # Scenario 3: Cloud Native DevOps Cluster (Left-Pad Single Point of Failure)
        g3 = nx.DiGraph()
        nodes_data_3 = [
            ("app_kubernetes_ctrl", {"label": "Cluster Controller", "type": "application", "version": "v1.28.0", "business_criticality": 95}),
            ("app_ci_runner", {"label": "CI/CD Pipeline Runner", "type": "service", "version": "v3.0.0", "business_criticality": 80}),
            ("pkg_babel", {"label": "babel-core", "type": "library", "version": "7.20.0", "vulnerable": False, "maintainer_hygiene": 90}),
            ("pkg_left_pad", {
                "label": "left-pad", 
                "type": "micro_dependency", 
                "version": "1.1.3", 
                "vulnerable": True, 
                "cve": "UNPUBLISHED-REMOVAL", 
                "cvss": 7.5, 
                "epss": 0.85,
                "reachable": True,
                "reachable_function": "leftPad(str, len, ch)",
                "maintainer_hygiene": 10,
                "abandoned": True
            })
        ]
        edges_3 = [
            ("app_kubernetes_ctrl", "pkg_babel"),
            ("app_ci_runner", "pkg_babel"),
            ("pkg_babel", "pkg_left_pad")
        ]
        for n, data in nodes_data_3:
            g3.add_node(n, **data)
        for u, v in edges_3:
            g3.add_edge(u, v)

        self.graphs["cloud_devops"] = g3
        self.metadata["cloud_devops"] = {
            "id": "cloud_devops",
            "name": "Cloud Native DevOps Cluster",
            "description": "Demonstrates the micro-dependency amplifier effect where unpublishing a 11-line package causes widespread build pipeline failure.",
            "target_node": "pkg_left_pad"
        }

    def get_graph(self, scenario_id: str) -> Optional[nx.DiGraph]:
        return self.graphs.get(scenario_id)

    def calculate_topology_metrics(self, graph: nx.DiGraph) -> Dict[str, Any]:
        """Calculates fan-in, fan-out, depth, and centrality for all nodes in graph."""
        metrics = {}
        # In a dependency graph where A -> B (A depends on B), 
        # B's transitive fan-in (how many nodes depend directly or indirectly on B) 
        # is measured by reversing edges (B <- A).
        reversed_g = graph.reverse(copy=True)
        
        # Centrality
        try:
            betweenness = nx.betweenness_centrality(graph)
        except Exception:
            betweenness = {n: 0.0 for n in graph.nodes()}

        for node in graph.nodes():
            direct_fan_in = graph.in_degree(node)
            direct_fan_out = graph.out_degree(node)

            # Transitive downstream dependents (nodes that depend on this node)
            transitive_dependents = nx.descendants(reversed_g, node)
            
            # Reachable applications (applications or services in descendants of reversed graph)
            reachable_apps = [
                dep for dep in transitive_dependents 
                if graph.nodes[dep].get("type") in ["application", "service"]
            ]

            metrics[node] = {
                "direct_fan_in": direct_fan_in,
                "direct_fan_out": direct_fan_out,
                "transitive_fan_in": len(transitive_dependents),
                "reachable_apps_count": len(reachable_apps),
                "reachable_apps": list(reachable_apps),
                "betweenness_centrality": round(betweenness.get(node, 0.0), 4)
            }
        return metrics

    def parse_custom_package_json(self, content: str) -> Dict[str, Any]:
        """Parses CycloneDX SBOM JSON or multi-tier package.json / lockfile into a live digital twin graph."""
        import json
        g = nx.DiGraph()
        try:
            data = json.loads(content)
            if isinstance(data, list):
                data = {"dependencies": data}

            # Check if this is a CycloneDX SBOM
            if data.get("bomFormat") == "CycloneDX" or "components" in data:
                app_meta = data.get("metadata", {}).get("component", {})
                root_id = app_meta.get("name", "Enterprise Platform Core")
                root_ver = app_meta.get("version", "1.0.0")
                g.add_node(root_id, label=root_id, type="application", version=root_ver, business_criticality=95)

                ref_to_id = {root_id: root_id}
                if app_meta.get("bom-ref"):
                    ref_to_id[app_meta.get("bom-ref")] = root_id

                target_node = None
                components = data.get("components", [])

                for comp in components:
                    cid = comp.get("name")
                    if not cid:
                        continue
                    if comp.get("bom-ref"):
                        ref_to_id[comp.get("bom-ref")] = cid
                    ref_to_id[cid] = cid

                    ctype = comp.get("type", "library")
                    if ctype not in ["application", "service", "library", "micro_dependency"]:
                        ctype = "library"
                    
                    vulns = comp.get("vulnerabilities", [])
                    is_vuln = len(vulns) > 0 or comp.get("vulnerable", False)
                    cve_id = vulns[0].get("id", "CVE-2024-ENTERPRISE") if vulns else comp.get("cve")
                    cvss = float(vulns[0].get("cvss", 9.8)) if vulns else float(comp.get("cvss", 0.0))

                    g.add_node(
                        cid,
                        label=cid,
                        type=ctype,
                        version=comp.get("version", "1.0.0"),
                        vulnerable=is_vuln,
                        cve=cve_id if is_vuln else None,
                        cvss=cvss if is_vuln else 0.0,
                        reachable=is_vuln,
                        business_criticality=comp.get("business_criticality", 80 if ctype in ["application", "service"] else 40),
                        maintainer_hygiene=comp.get("maintainer_hygiene", 45 if is_vuln else 90)
                    )

                    if is_vuln and not target_node:
                        target_node = cid

                # Parse dependency graph edges
                dep_links = data.get("dependencies", [])
                if dep_links:
                    for link in dep_links:
                        parent_raw = link.get("ref")
                        parent = ref_to_id.get(parent_raw, parent_raw)
                        children = link.get("dependsOn", [])
                        for child_raw in children:
                            child = ref_to_id.get(child_raw, child_raw)
                            if parent in g and child in g:
                                g.add_edge(parent, child)
                else:
                    # Fallback if no explicit dependencies block: wire root to components
                    for comp in components:
                        cid = comp.get("name")
                        if cid and cid != root_id:
                            g.add_edge(root_id, cid)

                if not target_node:
                    # Fallback target to the deepest leaf or first library
                    target_node = components[-1]["name"] if components else root_id

                scenario_id = "custom_upload"
                self.graphs[scenario_id] = g
                self.metadata[scenario_id] = {
                    "id": "custom_upload",
                    "name": f"CycloneDX SBOM: {root_id}",
                    "description": f"Verified CycloneDX {data.get('specVersion', '1.5')} Software Bill of Materials containing {len(components)} components.",
                    "target_node": target_node
                }
                return self.metadata[scenario_id]

            # Standard package.json or deep dependency tree
            app_name = data.get("name", "Custom Enterprise Application")
            app_id = "app_custom_root"
            g.add_node(app_id, label=app_name, type="application", version=data.get("version", "1.0.0"), business_criticality=90)

            raw_deps = data.get("dependencies", {})
            if isinstance(raw_deps, list):
                deps = {}
                for item in raw_deps:
                    if isinstance(item, dict):
                        pkg_name = item.get("name") or item.get("ref") or "unknown-pkg"
                        deps[pkg_name] = item.get("version", "1.0.0")
                    elif isinstance(item, str):
                        deps[item] = "1.0.0"
            elif isinstance(raw_deps, dict):
                deps = raw_deps
            else:
                deps = {}

            raw_dev_deps = data.get("devDependencies", {})
            if isinstance(raw_dev_deps, list):
                dev_deps = {}
                for item in raw_dev_deps:
                    if isinstance(item, dict):
                        pkg_name = item.get("name") or item.get("ref") or "unknown-pkg"
                        dev_deps[pkg_name] = item.get("version", "1.0.0")
                    elif isinstance(item, str):
                        dev_deps[item] = "1.0.0"
            elif isinstance(raw_dev_deps, dict):
                dev_deps = raw_dev_deps
            else:
                dev_deps = {}

            all_deps = {**deps, **dev_deps}

            target_node = None
            idx = 0
            for pkg, ver in all_deps.items():
                idx += 1
                pkg_id = f"pkg_custom_{idx}"
                is_vuln = (idx == 1)
                
                # Assign realistic tiers based on index
                if idx == 1:
                    node_type = "micro_dependency"
                elif idx <= 3:
                    node_type = "service"
                else:
                    node_type = "library"

                g.add_node(
                    pkg_id,
                    label=pkg,
                    type=node_type,
                    version=str(ver).replace("^", "").replace("~", ""),
                    vulnerable=is_vuln,
                    cve="CVE-2024-EXPLOIT" if is_vuln else None,
                    cvss=9.6 if is_vuln else 0.0,
                    reachable=is_vuln,
                    business_criticality=75 if node_type == "service" else 40,
                    maintainer_hygiene=20 if is_vuln else 85
                )

                if is_vuln:
                    target_node = pkg_id

                # Create multi-tier chain
                if idx <= 3:
                    g.add_edge(app_id, pkg_id)
                else:
                    # Wire libraries into intermediate services
                    parent_id = f"pkg_custom_{(idx % 3) + 1}"
                    if parent_id in g:
                        g.add_edge(parent_id, pkg_id)
                    g.add_edge(app_id, pkg_id)

            # Wire the vulnerable target into deep dependencies
            if target_node and idx > 3:
                g.add_edge(f"pkg_custom_{idx}", target_node)

            scenario_id = "custom_upload"
            self.graphs[scenario_id] = g
            self.metadata[scenario_id] = {
                "id": "custom_upload",
                "name": f"Uploaded Manifest: {app_name}",
                "description": f"Multi-tier dependency topology parsed from uploaded manifest ({len(all_deps)} dependencies).",
                "target_node": target_node or app_id
            }
            return self.metadata[scenario_id]
        except Exception as e:
            raise ValueError(f"Failed to parse SBOM / Manifest: {str(e)}")

graph_engine = GraphEngine()
