# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **ภาษา:** ตอบผู้ใช้เป็นภาษาไทยเสมอ

---

## คำสั่งที่ใช้บ่อย

### เริ่มทุก service พร้อมกัน (Windows)
```powershell
.\start.ps1
```

### เริ่มแยกทีละ service (manual)
```powershell
# Terminal 1 — Flowable engine
docker-compose up -d

# Terminal 2 — Backend (รอ Flowable อัตโนมัติ)
cd backend
node server.js
# หรือ dev mode พร้อม auto-reload
npm run dev

# Terminal 3 — Frontend
cd frontend
npm run dev
```

### URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| Flowable REST | http://localhost:9000/flowable-ui/process-api |

### ทดสอบ API โดยตรง
```bash
# health check
curl http://localhost:3001/api/health

# ส่ง request ใหม่
curl -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -d '{"requester":"Alice","description":"Budget Q3","processKey":"approvalProcess"}'

# ดู tasks ที่รออนุมัติ
curl http://localhost:3001/api/tasks
```

### Kill backend ที่ค้างอยู่ (port 3001)
```powershell
$procId = (Get-NetTCPConnection -LocalPort 3001).OwningProcess
Stop-Process -Id $procId -Force
```

---

## สถาปัตยกรรม

```
Browser (5173)
  └─ React + Vite
       └─ /api/* proxy → Express backend (3001)
            └─ HTTP Basic auth (admin/test) → Flowable UI Docker (9000→8080)
                  └─ H2 file-based DB (persists ระหว่าง restart แต่หายถ้าลบ container)
```

**ไม่มี** auth บน frontend หรือ backend — POC เท่านั้น

---

## Flowable REST — สิ่งสำคัญที่ต้องรู้

- **Base URL จริง:** `http://localhost:9000/flowable-ui/process-api`
  (ไม่ใช่ `/flowable-rest/service/` — WAR นั้นไม่มีใน `flowable/flowable-ui`)
- **Credentials:** `admin` / `test` (Basic auth)
- **Flowable Modeler/Admin UI ใช้ไม่ได้** — redirect ไป port 8080 ซึ่ง AgentService.exe ยึดอยู่ ใช้ Workflow Viewer page แทน

---

## Backend — Pattern หลัก (`backend/server.js`)

### PROCESS_CATALOG
Array ที่ควบคุมทุก workflow ใน POC นี้:

```js
const PROCESS_CATALOG = [
  {
    key: 'approvalProcess',          // processDefinitionKey ใน Flowable
    name: 'Standard Approval',       // ชื่อแสดงใน UI
    description: '...',
    file: 'approval-flow.bpmn20.xml', // ไฟล์ใน backend/bpmn/
    bpmnViewer: 'bpmn1',             // tab ใน WorkflowViewer ('fixed'|'bpmn1'|'bpmn2')
  },
  // ...
];
```

**เพิ่ม workflow ใหม่:** เพิ่ม entry ใน `PROCESS_CATALOG` + วาง BPMN XML ใน `backend/bpmn/` → restart backend (จะ deploy อัตโนมัติ)

### Startup flow
`waitForFlowable()` → `deployAll()` (skip ถ้า deploy แล้ว) → `app.listen()`

### Process variables มาตรฐาน
ทุก workflow ใช้ตัวแปรเหมือนกัน:
- **set on start:** `requester`, `description`, `amount`, `priority`, `processKey`
- **set on complete:** `approved` (boolean), `comment`, `reviewer`
- **gateway condition:** `${approved == true}`

---

## Frontend — โครงสร้าง

```
src/
  api.js          — fetch wrapper ทุก endpoint (proxy ผ่าน Vite → :3001)
  App.jsx         — route definitions
  components/
    Layout.jsx    — sidebar nav + Outlet
    StatusBadge.jsx
  pages/
    Dashboard.jsx      — stats cards + recent requests
    NewRequest.jsx     — radio picker (ดึงจาก GET /api/processes) + form
    TaskInbox.jsx      — expand card → Approve/Reject
    AllRequests.jsx    — table พร้อม filter tabs
    WorkflowViewer.jsx — bpmn-js NavigatedViewer, 3 tabs
    UserManual.jsx     — static guide
```

- `NewRequest.jsx` ดึง `/api/processes` มาสร้าง radio buttons — workflow ที่ `deployed: false` ถูก filter ออก
- `processBadgeColor` map ใน `NewRequest.jsx` ต้องอัปเดตถ้าเพิ่ม process key ใหม่
- BPMN static files สำหรับ viewer อยู่ที่ `frontend/public/bpmn/`

---

## Workflows

### Fixed Flow (Hardcoded — ไม่ใช้ BPMN engine)
- Logic อยู่ใน `backend/server.js` ทั้งหมด (in-memory store + if-else)
- ไม่ผ่าน Flowable — submit สร้าง task ใน memory, complete อัปเดต status โดยตรง
- ใช้เป็น baseline เปรียบเทียบกับ BPMN workflows

### BPMN Workflows (deploy ลง Flowable engine)

| Key | ชื่อ | Flow |
|---|---|---|
| `approvalProcess` | Standard Approval | Start → Manager Approval → Gateway → End |
| `twoLevelApprovalProcess` | Two-Level Approval | Manager → Gateway → Director (directors) → Gateway → End |

BPMN workflows ใช้ตัวแปร `approved` เดียวกัน — gateway อ่าน `${approved == true}`

