# GRC PC Repair Shop

Student-run PC repair intake system for Green River College. All services are free; donations welcome.

## Quick start (Docker)

```bash
# 1. Build and run
docker compose up --build

# 2. Open http://localhost:3001
```

The app starts with a default staff account:
- **Email:** `staff@greenriver.edu`
- **Password:** `grcstaff2026`

Change these via environment variables before going live (see Configuration below).

---

## Development (no Docker)

**Requirements:** Node.js 20+

```bash
# Terminal 1 — API server
cd server
npm install
node index.js          # runs on :3001

# Terminal 2 — React client
cd client
npm install
npm run dev            # runs on :5173, proxies /api → :3001
```

---

## Configuration

Create a `.env` file in the project root (next to `docker-compose.yml`):

```env
JWT_SECRET=replace-with-a-long-random-string
STAFF_EMAIL=staff@greenriver.edu
STAFF_PASSWORD=a-strong-password
```

The default staff account is only seeded when no staff account exists in the database. To change credentials after first run, update the database directly or create a new staff user.

---

## Structure

```
├── server/             Express API + SQLite
│   ├── index.js        Entry point
│   ├── db.js           Database init + schema
│   ├── middleware/
│   │   └── auth.js     JWT middleware
│   └── routes/
│       ├── auth.js     Register / login
│       ├── tickets.js  Customer ticket API
│       └── staff.js    Staff-only API
├── client/             Vite + React 18
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── AuthPage.jsx        Sign in / register
│       │   ├── IntakeWizard.jsx    3-step new client intake
│       │   ├── Portal.jsx          Customer ticket portal
│       │   ├── StaffDashboard.jsx  Staff ticket queue
│       │   └── StaffTicket.jsx     Individual ticket management
│       └── components/
│           └── shared/             Icon, Header, Footer, form primitives
├── Dockerfile
└── docker-compose.yml
```

---

## Roles

| Role     | Access |
|----------|--------|
| Customer | Sign up, complete intake wizard (F01–F03), view own tickets and updates |
| Staff    | View all tickets, update status, assign technician, add notes, complete F04 (Equipment Ledger) and F05 (Pickup Receipt) |

Staff accounts must be created manually in the database. The default seed creates one on first run.

---

## Forms

| Form | Who fills it out | When |
|------|-----------------|------|
| F01 Issue Description | Customer | During online intake |
| F02 Shop Policies | Customer | During online intake |
| F03 Work Order / Release | Customer | During online intake |
| F04 Equipment Ledger | Staff + Customer, jointly | At device drop-off in TC-104 |
| F05 Pickup Receipt | Staff + Customer, jointly | At device pickup in TC-104 |

---

## API

All endpoints under `/api`.

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | `{email, name, password, phone?, studentId?}` | Create customer account |
| POST | `/auth/login` | `{email, password}` | Returns JWT + user |

### Customer tickets (requires `Authorization: Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/tickets/intake` | Submit intake forms, creates ticket |
| GET | `/tickets` | List my tickets |
| GET | `/tickets/:id` | Single ticket detail |

### Staff (requires staff role)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/staff/tickets` | All tickets (filter by `?status=&search=`) |
| GET | `/staff/tickets/:id` | Full ticket + forms |
| PATCH | `/staff/tickets/:id` | Update status, tech, priority, add note |
| POST | `/staff/tickets/:id/forms` | Submit equipment or pickup form |
