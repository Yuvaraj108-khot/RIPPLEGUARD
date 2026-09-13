<div align="center">

# 🛡️ RippleGuard

**Explainable Software Supply-Chain Digital Twin & Ripple Breaker Engine**

[![Vite](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205%20%7C%20TailwindCSS-blue)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20NetworkX%20%7C%20Python%203.11-009688)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Ready-2496ED)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

*Simulate downstream transitive compromises, quantify true ripple risk across production applications, and execute minimal-effort Ripple Breaker interventions with auditable, evidence-grounded AI.*

---

</div>

## 📌 Executive Overview

Modern enterprise applications rely on thousands of direct and transitive open-source dependencies. Traditional Software Composition Analysis (SCA) scanners generate thousands of flat alerts that treat an isolated test dependency the same as a deep, critical micro-dependency like `event-stream` or `log4j-core`.

**RippleGuard** replaces flat vulnerability alert fatigue with an **active Software Supply-Chain Digital Twin**:
1. **Directional Blast Radius Simulation**: Models dependencies as a directional call-graph and calculates which production applications are reachable when a deep micro-dependency is hijacked.
2. **Deterministic Ripple Risk Score**: Quantifies multi-factor risk combining CVSS, ecosystem fan-in, structural betweenness centrality, call-path reachability, and root business criticality.
3. **Ripple Breaker Optimization**: Identifies minimal-effort, high-impact intervention points (e.g., patching 1 intermediate package to eliminate 64% of downstream risk across 5 tier-1 services).
4. **Evidence-Grounded AI Analyst**: Formulates technical and executive narratives grounded strictly in deterministic graph metrics—with **zero invented statistics or hallucinations**.
5. **Zero-Downtime Resilience**: Designed with client-side fallback simulation datasets and manifest parsers so live demos and deployments never fail.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          RippleGuard Web UI                            │
│   (React 18 + Vite 5 + TailwindCSS + Canvas Directional Engine)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ REST / JSON (or Autonomous Fallback)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Digital Twin API                        │
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │ Graph Topology      │   │ Simulation Engine                    │   │
│   │ (NetworkX DiGraph)  │──▶│ (Downstream BFS/DFS Propagation)     │   │
│   └─────────────────────┘   └──────────────────┬───────────────────┘   │
│                                                │                       │
│                                                ▼                       │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │ Ripple Breaker      │   │ Multi-Signal Risk Engine             │   │
│   │ (Cut-Vertex ROI)    │◀──│ (Vuln + Reach + Centrality + Biz)    │   │
│   └──────────┬──────────┘   └──────────────────┬───────────────────┘   │
│              │                                 │                       │
│              └────────────────┬────────────────┘                       │
│                               ▼                                        │
│                 ┌───────────────────────────┐                          │
│                 │ Evidence-Grounded AI      │                          │
│                 │ (Audited Dual Narratives) │                          │
│                 └───────────────────────────┘                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Flagship Capabilities

- **Interactive Digital Twin Canvas**: Physics-smoothed canvas rendering hierarchical topologies (Applications ➔ Services ➔ Libraries ➔ Micro-dependencies) with pan, cursor-centered zoom, and active compromise propagation streams.
- **2-Minute Butterfly Effect Guided Demo**: Step-by-step executive tour highlighting:
  1. *The 11-Line Micro-Dependency*: Unassuming root targets.
  2. *Hidden Transitive Infiltration*: Deep nested dependency paths.
  3. *Critical Blast Radius*: Downstream production services compromised.
  4. *Surgical Ripple Breaker Intervention*: Single-point remediation restoring integrity.
- **Auditable AI Analyst**: One-click toggling between a technical **Developer View** (execution paths, hop depths, remediation commands) and an executive **CISO/Business View** (blast radius, revenue impact, ROI).
- **SBOM Health & Confidence Auditor**: Inspects CycloneDX 1.5 SBOMs, discovers orphaned nodes, and calculates an auditable confidence percentage.
- **Supply-Chain Time Machine**: Sliders simulating pre-attack baseline, injection disclosure, exploit propagation, and post-mitigation state.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Clone & Setup
```bash
git clone https://github.com/Yuvaraj108-khot/RIPPLEGUARD.git
cd RIPPLEGUARD
```

### 2. Run Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
# API running at http://localhost:8000
```

### 3. Run Frontend (Vite)
In a new terminal:
```bash
npm install
npm run dev
# App running at http://localhost:5173
```
*Note: The Vite development server automatically proxies `/api` requests to `http://127.0.0.1:8000`.*

---

## 🐳 Docker Deployment (All-in-One)

You can run both the frontend and backend in a single optimized container using the provided multi-stage `Dockerfile`:

```bash
docker-compose up --build
```
Open **http://localhost:8000** in your browser.

---

## ☁️ Cloud Deployment Guide

### Option 1: Split Deployment (Vercel + Render / Railway)

#### Frontend on Vercel:
1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Set the Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://rippleguard-backend.onrender.com`)
4. Deploy! (`vercel.json` ensures all SPA routes resolve correctly).

#### Backend on Render:
1. In Render, create a new **Web Service** pointing to your repository.
2. Build command: `pip install -r backend/requirements.txt`
3. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variable: `CORS_ORIGINS=*` (or your Vercel URL).

*(Alternatively, use `render.yaml` for 1-click blueprint deployment on Render).*

### Option 2: Single-Server Container (Render, Railway, Fly.io, Cloud Run)
- Deploy using the root `Dockerfile`.
- The container builds the static frontend and serves both the API endpoints and the React SPA on port 8000 with zero CORS configuration required.

---

## ⚙️ Environment Variables

| Variable | Target | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend | `""` (proxied) | Remote FastAPI URL when frontend is hosted separately (e.g. Vercel). |
| `PORT` | Backend | `8000` | Port for FastAPI / Uvicorn server. |
| `HOST` | Backend | `0.0.0.0` | Binding host address. |
| `CORS_ORIGINS` | Backend | `*` | Comma-separated list of allowed browser origins or `*`. |

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` or `/api/health` | `GET` | Health check probe for cloud load balancers. |
| `/api/scenarios` | `GET` | Lists available supply-chain benchmark scenarios. |
| `/api/graph/{id}` | `GET` | Retrieves nodes, edges, topology metrics, and SBOM health score. |
| `/api/simulate` | `POST` | Executes downstream compromise simulation and returns risk factors. |
| `/api/ripple-breaker/replay` | `POST` | Replays a mitigation and returns neutralized graph edges. |
| `/api/ai-explain` | `POST` | Generates evidence-grounded Developer and Executive narratives. |
| `/api/upload` | `POST` | Ingests CycloneDX SBOM JSON or `package.json` manifest. |

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.