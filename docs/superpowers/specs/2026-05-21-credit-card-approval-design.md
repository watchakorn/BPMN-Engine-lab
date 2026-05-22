# Credit Card Approval POC — Design Spec

## Overview

เปลี่ยน BPMN POC จาก generic approval เป็น credit card application approval พร้อม 3 flows เปรียบเทียบ:
1. **Hardcoded** — logic ทั้งหมดใน server.js
2. **BPMN Simple** — single approval + HTTP Task credit check
3. **BPMN Advanced** — multi-level approval + HTTP Task credit check + เกณฑ์เข้มกว่า

## Mock External API

### `GET /api/external/credit-check/:nationalId`

Response:
```json
{
  "nationalId": "1234567890123",
  "creditScore": 685,
  "riskLevel": "medium",
  "existingCards": 2,
  "monthlyDebt": 15000,
  "recommendation": "manual_review"
}
```

- ใช้ hash ของ nationalId เป็น seed เพื่อให้ ID เดิมได้ score เดิมทุกครั้ง
- Endpoint อยู่บน backend (port 3001) — Flowable Docker เรียกผ่าน `host.docker.internal:3001`

## 3 Flows

### Flow 1: Hardcoded (fixedFlow)

```
Submit → fetch credit score (mock API) → if-else routing:
  ≥ 700  → auto-approve
  400-699 → create Manager Review task → approve/reject
  < 400  → auto-reject
```

- ทุก logic อยู่ใน server.js
- In-memory store (หายเมื่อ restart)
- ไม่ผ่าน Flowable engine

### Flow 2: BPMN Simple (creditCardSimple)

```
Start → HTTP Task (credit check) → Gateway:
  ≥ 700  → Auto-Approved End
  400-699 → Manager Review UserTask → Gateway → Approved/Rejected End
  < 400  → Auto-Rejected End
```

- BPMN XML: `credit-card-simple.bpmn20.xml`
- HTTP Task เรียก mock API อัตโนมัติ
- Single level manual review

### Flow 3: BPMN Advanced (creditCardAdvanced)

```
Start → HTTP Task (credit check) → Gateway:
  ≥ 750  → Auto-Approved End
  400-749 → Manager Review → Gateway → Director Review → Gateway → End
  < 400  → Auto-Rejected End
```

- BPMN XML: `credit-card-advanced.bpmn20.xml`
- เกณฑ์ auto-approve สูงกว่า (750 vs 700)
- Manual zone ต้องผ่าน 2 คน (Manager → Director)

## Application Form (7 fields)

| Field | Type | Required |
|---|---|---|
| Applicant Name | text | yes |
| National ID | text | yes |
| Monthly Income | number | yes |
| Employment Type | select (พนักงานประจำ/ธุรกิจส่วนตัว/ฟรีแลนซ์) | no |
| Employer / Company | text | no |
| Card Type | select (Classic/Gold/Platinum) | yes |
| Credit Limit Request | number | no |

## Process Variables

### Set on start:
`applicantName`, `nationalId`, `monthlyIncome`, `employmentType`, `employer`, `cardType`, `creditLimitRequest`, `processKey`

### Set by credit check (HTTP Task / hardcoded):
`creditScore`, `riskLevel`, `existingCards`, `monthlyDebt`, `recommendation`

### Set on task complete:
`approved` (boolean), `comment`, `reviewer`

## PROCESS_CATALOG Update

```js
const PROCESS_CATALOG = [
  {
    key: 'creditCardSimple',
    name: 'Credit Card — Simple',
    description: 'Single manager approval with credit score check.',
    file: 'credit-card-simple.bpmn20.xml',
    bpmnViewer: 'bpmn1',
  },
  {
    key: 'creditCardAdvanced',
    name: 'Credit Card — Advanced',
    description: 'Manager + Director approval with stricter credit threshold.',
    file: 'credit-card-advanced.bpmn20.xml',
    bpmnViewer: 'bpmn2',
  },
];
```

fixedFlow stays hardcoded (not in PROCESS_CATALOG).

## Frontend Changes

- `NewRequest.jsx` — form fields เปลี่ยนเป็น credit card application
- `TaskInbox.jsx` — แสดง credit score, risk level ใน task card
- `WorkflowViewer.jsx` — update labels/descriptions
- `Dashboard.jsx` — update labels
- `AllRequests.jsx` — update table columns

## Technical Notes

- Flowable HTTP Task เรียก backend ผ่าน `host.docker.internal:3001` (Docker → host)
- HTTP Task response ต้อง parse JSON แล้ว set process variables
- Old approval BPMN files (`approval-flow.bpmn20.xml`, `two-level-approval.bpmn20.xml`) จะถูกแทนที่
- Frontend static BPMN files ใน `frontend/public/bpmn/` ต้องอัปเดต
