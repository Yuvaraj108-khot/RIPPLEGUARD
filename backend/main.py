from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from graph_engine import graph_engine
from simulation_engine import simulation_engine
from risk_engine import risk_engine
from ripple_breaker import ripple_breaker
from ai_analyst import ai_analyst

app = FastAPI(
    title="RippleGuard API",
    description="Explainable Software Supply-Chain Digital Twin API Engine",
    version="1.0.0"
)

# Enable CORS with flexible production origins
cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    allow_origins = ["*"]
    allow_credentials = False
else:
    allow_origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    scenario_id: str = "ecommerce_microservices"
    target_node: Optional[str] = "pkg_event_stream"
    scenario_type: str = "malicious_release"

class MitigationRequest(BaseModel):
    scenario_id: str = "ecommerce_microservices"
    target_node: str = "pkg_event_stream"
    mitigation_id: str = "mit_1"

class AIExplainRequest(BaseModel):
    target: str = "event-stream"
    risk: int = 87
    fanIn: int = 9
    reachableApplications: int = 18
    criticalApplications: int = 5
    propagationDepth: int = 6
    topPath: List[str] = ["Storefront API", "express", "event-stream", "queue-adapter", "payments-prod"]
    recommendedMitigation: Dict[str, Any] = {
        "action": "Upgrade dependency",
        "riskReduction": 64,
        "effort": "Low"
    }

@app.get("/api")
def api_info():

    return {
        "name": "RippleGuard API",
        "description": "Explainable Software Supply-Chain Digital Twin API Engine",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": [
            "/api/health",
            "/api/scenarios",
            "/api/graph/{scenario_id}",
            "/api/simulate",
            "/api/ripple-breaker/replay",
            "/api/ai-explain",
            "/api/upload"
        ]
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "RippleGuard Digital Twin Engine", "version": "1.0.0"}


@app.get("/api/scenarios")
def get_scenarios():
    return [
        {
            "id": meta["id"],
            "name": meta["name"],
            "description": meta["description"],
            "target_node": meta["target_node"]
        }
        for meta in graph_engine.metadata.values()
    ]

@app.get("/api/graph/{scenario_id}")
def get_graph(scenario_id: str):
    graph = graph_engine.get_graph(scenario_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found")

    metrics = graph_engine.calculate_topology_metrics(graph)

    nodes = []
    for n, data in graph.nodes(data=True):
        m = metrics.get(n, {})
        nodes.append({
            "id": n,
            "label": data.get("label", n),
            "type": data.get("type", "library"),
            "version": data.get("version", "1.0.0"),
            "vulnerable": data.get("vulnerable", False),
            "cve": data.get("cve"),
            "cvss": data.get("cvss", 0.0),
            "epss": data.get("epss", 0.0),
            "reachable": data.get("reachable", False),
            "business_criticality": data.get("business_criticality", 50),
            "direct_fan_in": m.get("direct_fan_in", 0),
            "transitive_fan_in": m.get("transitive_fan_in", 0),
            "betweenness_centrality": m.get("betweenness_centrality", 0.0),
            "reachable_apps_count": m.get("reachable_apps_count", 0)
        })

    edges = [{"from": u, "to": v} for u, v in graph.edges()]

    # Graph Health & SBOM Confidence Audit
    total_nodes = len(nodes)
    total_edges = len(edges)
    orphan_nodes = [n["label"] for n in nodes if n["direct_fan_in"] == 0 and graph.out_degree(n["id"]) == 0]
    sbom_confidence = max(40, min(98, 100 - (len(orphan_nodes) * 15)))

    return {
        "scenario": graph_engine.metadata.get(scenario_id, {}),
        "nodes": nodes,
        "edges": edges,
        "graph_health": {
            "node_count": total_nodes,
            "edge_count": total_edges,
            "orphan_nodes": orphan_nodes,
            "sbom_confidence": sbom_confidence,
            "status": "HEALTHY" if sbom_confidence >= 80 else "DEGRADED"
        }
    }

@app.post("/api/simulate")
def simulate(req: SimulationRequest):
    graph = graph_engine.get_graph(req.scenario_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Scenario {req.scenario_id} not found")

    target = req.target_node or graph_engine.metadata[req.scenario_id]["target_node"]
    
    sim_data = simulation_engine.simulate_compromise(graph, target, req.scenario_type)
    risk_data = risk_engine.calculate_ripple_risk(graph, sim_data)
    mitigations = ripple_breaker.calculate_mitigations(graph, target, sim_data)

    # Form evidence payload
    top_rec = mitigations[0] if mitigations else {"action": "Upgrade dependency", "risk_reduction_pct": 64, "effort": "Low"}
    evidence = {
        "target": sim_data["target"]["label"],
        "target_id": target,
        "risk": risk_data["score"],
        "classification": risk_data["classification"],
        "color": risk_data["color"],
        "fanIn": sim_data["downstream_packages_count"],
        "reachableApplications": sim_data["reachable_applications_count"],
        "criticalApplications": sim_data["critical_applications_count"],
        "propagationDepth": sim_data["maximum_depth_hops"],
        "propagationPathsCount": sim_data["propagation_paths_count"],
        "topPath": sim_data["top_path"],
        "recommendedMitigation": {
            "action": top_rec["short_title"],
            "riskReduction": top_rec["risk_reduction_pct"],
            "effort": top_rec["effort"]
        }
    }

    ai_explanations = ai_analyst.explain_evidence(evidence)

    return {
        "simulation": sim_data,
        "risk": risk_data,
        "mitigations": mitigations,
        "evidence": evidence,
        "ai_explanations": ai_explanations
    }

@app.post("/api/ripple-breaker/replay")
def replay_mitigation(req: MitigationRequest):
    graph = graph_engine.get_graph(req.scenario_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Scenario {req.scenario_id} not found")

    safe_topology = ripple_breaker.get_safe_path_topology(graph, req.target_node, req.mitigation_id)
    return safe_topology

@app.post("/api/ai-explain")
def generate_ai_explanation(req: AIExplainRequest):
    evidence_dict = req.dict()
    return ai_analyst.explain_evidence(evidence_dict)

@app.post("/api/upload")
async def upload_manifest(file: UploadFile = File(...)):
    try:
        content = await file.read()
        metadata = graph_engine.parse_custom_package_json(content.decode("utf-8"))
        return {"status": "success", "scenario": metadata}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Optional static file serving for all-in-one container deployment
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
assets_dir = os.path.join(dist_dir, "assets")
if os.path.isdir(assets_dir):
    from starlette.staticfiles import StaticFiles
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

if os.path.isdir(dist_dir) and os.path.isfile(os.path.join(dist_dir, "index.html")):
    from fastapi.responses import FileResponse

    @app.get("/")
    async def serve_spa_root():
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path == "api" or full_path == "health":
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def fallback_root():
        return api_info()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[INFO] Starting RippleGuard Digital Twin Backend on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)


