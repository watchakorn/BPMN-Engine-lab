# Flowable BPMN Engine POC — Design Spec

**Date:** 2026-05-20  
**Status:** Approved (autonomous — user reviews at end)

---

## Goal

Minimal working POC: one standard approval flow wired to Flowable engine, with frontend UI to submit requests and approve/reject them.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (localhost:5173)                               │
│  React + Vite frontend                                  │
│  Pages: Dashboard | New Request | Task Inbox | Requests │
└──────────────────┬──────────────────────────────────────┘
                   │ REST (localhost:3001/api/*)
┌──────────────────▼──────────────────────────────────────┐
│  Node.js / Express backend (localhost:3001)             │
│  - Auto-deploys BPMN on startup                        │
│  - Wraps Flowable REST API with simplified routes       │
│  - Retry logic to wait for Flowable readiness          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP Basic auth (localhost:8080)
┌──────────────────▼──────────────────────────────────────┐
│  Flowable All-in-One (Docker)                           │
│  Image: flowable/all-in-one                            │
│  REST: /flowable-rest/service/                         │
│  Credentials: admin / test                             │
│  DB: H2 in-memory (POC only)                           │
└─────────────────────────────────────────────────────────┘
```

---

## BPMN Approval Flow

```
[Start Event] → [User Task: Manager Approval]
                    (candidateGroup: managers)
                         ↓
              [Exclusive Gateway: Approved?]
               /                      \
    [approved=true]              [approved=false]
         ↓                              ↓
  [End: Approved]              [End: Rejected]
```

**Process key:** `approvalProcess`  
**Process variables:**
| Variable | Type | Set by |
|---|---|---|
| requester | string | Start |
| description | string | Start |
| amount | number | Start |
| priority | string | Start |
| approved | boolean | Task completion |
| comment | string | Task completion |
| reviewer | string | Task completion |

---

## Backend API

| Method | Path | Description |
|---|---|---|
| GET | /api/health | Flowable connectivity check |
| POST | /api/requests | Start approval process |
| GET | /api/requests | List all requests (active + history) |
| GET | /api/tasks | List pending approval tasks |
| POST | /api/tasks/:id/complete | Approve or reject task |

---

## Frontend Pages

| Page | Route | Purpose |
|---|---|---|
| Dashboard | / | Stats: pending/approved/rejected counts |
| New Request | /new | Form to submit approval request |
| Task Inbox | /tasks | Manager view — approve or reject |
| All Requests | /requests | Full history with status badges |

---

## Infrastructure

- **docker-compose.yml** — Flowable all-in-one, port 8080, H2 in-memory
- **start.ps1** — Check Docker → start Flowable if missing → wait for health → start backend + frontend in separate terminals
- No production DB, auth, or multi-tenant concerns (POC scope)

---

## Out of Scope (POC)

- User authentication on frontend
- Multi-step workflows
- Email notifications
- Persistent database
- Production deployment
