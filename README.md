# BPMN Engine POC — Flowable Approval Flow

Standard approval flow POC built on [Flowable](https://www.flowable.com/) BPMN engine.

## Stack

| Layer | Tech | Port |
|---|---|---|
| Engine | Flowable UI (Docker) | 9000 -> 8080 |
| Backend | Node.js / Express | 3001 |
| Frontend | React + Vite | 5173 |

## Quick Start

> Requires: Docker Desktop, Node.js 18+

```powershell
.\start.ps1
```

That's it. The script will:
1. Check Docker is running
2. Pull and start `flowable/flowable-ui:6.8.0` if not already running
3. Install npm dependencies
4. Launch backend + frontend in separate terminals
5. Open browser at `http://localhost:5173`

## Manual Start

```powershell
# Terminal 1 — Flowable
docker-compose up -d

# Terminal 2 — Backend (waits for Flowable automatically)
cd backend
npm install
node server.js

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

## Approval Flow

```
[Start] → [Manager Approval Task] → [Gateway]
                                      ├── approved=true  → [End: Approved]
                                      └── approved=false → [End: Rejected]
```

## Using the POC

1. **New Request** — Submit an approval request (requester name, description, amount, priority)
2. **Task Inbox** — Click a task to expand, optionally add reviewer name + comment, then Approve or Reject
3. **All Requests** — View full history with status filters

## Flowable Admin UI

Access at `http://localhost:9000/flowable-ui` - credentials: `admin` / `test`

REST base URL: `http://localhost:9000/flowable-ui/process-api`
- **Flowable Task** — view process instances and tasks
- **Flowable Admin** — monitor engine, manage deployments
- **Flowable Modeler** — visual BPMN editor

## Backend API

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Engine health check |
| POST | /api/requests | Start approval process |
| GET | /api/requests | List all requests |
| GET | /api/tasks | List pending tasks |
| POST | /api/tasks/:id/complete | Approve or reject |

### Start a request (curl)
```bash
curl -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -d '{"requester":"Alice","description":"Budget approval for Q3","amount":5000,"priority":"high"}'
```

### Complete a task (curl)
```bash
curl -X POST http://localhost:3001/api/tasks/{taskId}/complete \
  -H "Content-Type: application/json" \
  -d '{"approved":true,"comment":"Looks good","reviewer":"Bob"}'
```

