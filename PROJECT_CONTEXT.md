# Nasabah - Project Context & Discussion Archive

## Overview

This document archives the complete development discussion, decisions, and technical specifications for the **Nasabah** application — an Integrated Customer Complaint & Fraud Mitigation System built for the Indonesian banking sector.

---

## 1. Project Origin

### Source Documents
The application was built based on two comprehensive specification documents provided by the user:

1. **FSD.MD** (Functional Specification Document) — `docs/FSD.md`
   - 225 lines detailing functional requirements, AI/ML integration, regulatory compliance (POJK 39/2019), and feature specifications.

2. **TSD.MD** (Technical Specification Document) — `docs/TSD.md`
   - 97 lines specifying UI/UX design (Bank Indonesia style guide), database schema, menu structure, and technical implementation details.

### Core Purpose
Build a one-stop fraud detection and complaint management platform combining:
- AI-powered risk scoring
- Interactive money trail visualization
- Automated account freezing (Sandi 07 per POJK 39/2019)
- Explainable AI (XAI) for regulatory transparency

---

## 2. Technology Stack Decisions

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR/ISR support, React ecosystem, API routes |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development, BI color palette (#003366, #FFCC00) |
| **Database** | Neon PostgreSQL (Serverless) | Auto-scaling, branching for AI testing, pgvector for embeddings |
| **ORM** | Prisma 5.x | Type-safe queries, schema management |
| **Auth** | Custom JWT (jose) + cookie-based | Simple username/password, RBAC (Admin/Analyst/Investigator) |
| **Visualization** | Cytoscape.js + React Flow | Money trail graph + rule builder canvas |
| **Charts** | Recharts | Dashboard analytics |
| **Deployment** | Vercel | Edge functions, Next.js native platform |

---

## 3. Database Schema (Prisma)

### Tables
1. **`users`** — Authentication & RBAC
   - `id`, `username`, `password` (bcrypt), `name`, `role` (ADMIN/ANALYST/INVESTIGATOR)

2. **`accounts`** — Customer bank accounts
   - `accountNumber`, `accountHolder`, `balance`, `riskScore` (0-100), `status` (ACTIVE/FLAGGED/RESTRICTED/FROZEN)

3. **`transactions`** — Append-only financial ledger
   - `senderId`, `recipientId`, `amount`, `timestamp`, `channel`, `locationIp`, `deviceId`, `isAnomaly`

4. **`complaints`** — Customer complaint tickets
   - `ticketId`, `category` (PHISHING/SKIMMING/etc.), `aiPriorityScore`, `sentiment`, `status`

5. **`ai_rules`** — Visual rule engine JSON
   - `name`, `logicJson` (React Flow format), `isActive`

6. **`risk_scores`** — AI scoring history
   - `accountId`, `score`, `reasonVector`, `explanation`

7. **`freeze_logs`** — Account freeze audit trail
   - `accountId`, `reasonCode` (Sandi 07), `triggeredBy`, `freezeDuration`

8. **`audit_logs`** — Immutable activity logs
   - `userId`, `action`, `entity`, `entityId`, `details` (JSON), `ipAddress`

---

## 4. Feature Implementation Timeline

### Phase 1: Foundation ✅
- Next.js + TypeScript project initialization
- Tailwind CSS with BI color palette
- Prisma schema design & Neon database connection
- Database seeding (10 accounts, 50 transactions, 15 complaints, 3 users)
- Custom JWT authentication (jose library)
- Middleware for route protection & RBAC
- Layout: Top Bar (real-time ticker) + Sidebar navigation

### Phase 2: Dashboard & Account Management ✅
- Executive Dashboard with KPI cards
- Complaint trend charts (Recharts)
- Fraud by region visualization
- Risk distribution progress bars
- Account management with search, filter, sort, pagination
- Account detail pages with transaction history

### Phase 3: Complaint Center ✅
- Ticket inbox with AI priority scoring
- Filter by status, category, priority level
- Case detail pages with customer profile
- Mock NLP triage (rule-based sentiment)
- Case history timeline

### Phase 4: Fraud Investigation (Advanced Money Trail) ✅
- **Ledger Analysis**: Transaction table with anomaly flags
- **Money Trail Graph**: Cytoscape.js interactive visualization
  - 4-level hierarchical mock data (16 nodes, 15 edges)
  - **Hover tooltip**: Risk score + AI explainability narrative
  - **Click expand/collapse**: Recursive node expansion
  - **Color coding**: Navy → Yellow → Orange → Red → Dark Red (by risk level)
  - **Edge styling**: Dashed red for anomaly transactions
  - **Side panel**: Detailed node info + outgoing transactions

### Phase 5: AI Rules & Security ✅
- React Flow drag-and-drop rule builder
- Mock model performance metrics (Precision 87.4%, Recall 92.1%)
- Security panel: Frozen accounts (Sandi 07) listing
- Intervention protocol reference (POJK 39/2019)
- Unfreeze button (Investigator/Admin only)
- Audit trail with filter & pagination

### Phase 6: Polish & Vercel Deployment ✅
- `postinstall` + `prisma generate` for Vercel build
- `export const dynamic = "force-dynamic"` on all server pages
- GitHub repository creation
- Environment variable setup guide

---

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Simple username/password auth | User requested simplicity over OAuth complexity |
| Mock AI/LLM (no API key) | MVP focus; real AI integration deferred to Phase 2 |
| Cytoscape.js over D3.js | Better performance for large graphs, built-in interaction |
| Recursive expand/collapse | User requirement for hierarchical money trail exploration |
| English UI | Explicit user preference |
| Neon over local Postgres | Serverless scaling, branching for AI testing |

---

## 6. Mock Data Summary

### Demo Accounts (Login)
- `admin` / `admin` — Full access
- `analyst` / `analyst` — No AI Rules or Security panel
- `investigator` / `investigator` — Full access + unfreeze capability

### Money Trail Graph (Mock)
- **Level 0 (Source)**: Budi Santoso (risk 15), Ani Wijaya (25), Maya Sari (10)
- **Level 1 (Intermediate)**: Dedi Pratama (55), Ahmad Fauzi (65), Siti Aminah (78)
- **Level 2 (Mule/Collectors)**: Rudi Hartono (95/FROZEN), Joko Widodo (42), Dewi Kusuma (30), Bayu Anggara (88), Citra Lestari (72)
- **Level 3 (Terminal)**: Andi Wijaya (92/FROZEN), Rina Susanti (85), PT. Sejahtera (35), Eko Prasetyo (48)

### AI Explainability Examples
- *"Low risk: Consistent transaction behavior for 3+ years. Regular login from Jakarta IP."*
- *"CRITICAL: Identified as suspected mule account. Received funds from 5 different accounts in 6 hours. Linked to known fraud ring ID #FR-2026-0442."*
- *"High risk: Account accessed via VPN from Philippines. Previous login was from Medan 3 hours prior. Impossible travel pattern detected."*

---

## 7. Environment Variables

```env
DATABASE_URL=postgresql://neondb_owner:npg_2HRiCkLzuZ8x@ep-dark-snow-a1j0p9kt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=nasabah-super-secret-key-2026-change-in-production
```

---

## 8. Known Issues & Future Work

### Known Issues
- `react-cytoscapejs` requires custom type declaration (`src/types/react-cytoscapejs.d.ts`)
- PowerShell execution policy may block `npx` commands (use `cmd /c` workaround)

### Planned Enhancements
1. **Real AI Integration**: Connect OpenAI/Anthropic API for NLP triage & explainability
2. **Recursive CTE Queries**: Replace mock money trail with actual database recursive queries
3. **Real-time Notifications**: WebSocket/SSE for fraud alerts
4. **Export Reports**: PDF generation for audit trails
5. **Temporal Slider**: Time-based filtering on money trail graph
6. **Circular Pattern Detection**: Automated algorithm for detecting money laundering rings
7. **Multi-language Support**: Indonesian UI option

---

## 9. File Structure

```
nasabah/
├── docs/
│   ├── FSD.md                 # Functional Specification Document
│   └── TSD.md                 # Technical Specification Document
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Route group with sidebar layout
│   │   │   ├── dashboard/
│   │   │   ├── accounts/
│   │   │   ├── complaints/
│   │   │   ├── investigation/  # Money Trail + Ledger
│   │   │   ├── rules/         # AI Rule Builder
│   │   │   ├── security/      # Freeze management
│   │   │   └── audit/
│   │   ├── api/               # API routes
│   │   ├── login/
│   │   └── page.tsx           # Redirect to dashboard
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── layout/            # Sidebar, TopBar
│   │   └── dashboard/         # Charts
│   ├── lib/                   # Prisma, Auth, Session, Utils
│   ├── types/                 # Type declarations
│   └── middleware.ts          # Auth middleware + RBAC
├── .env                       # Environment variables
├── package.json
└── tailwind.config.ts         # BI color palette
```

---

## 10. How to Run

```bash
# 1. Clone repository
git clone https://github.com/inovasigpt/nasabah.git
cd nasabah

# 2. Install dependencies
npm install

# 3. Set environment variables
# Copy .env.example to .env and fill in DATABASE_URL and NEXTAUTH_SECRET

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Seed database
npx tsx prisma/seed.ts

# 7. Run development server
npm run dev

# 8. Open http://localhost:3000
# Login with: admin/admin, analyst/analyst, or investigator/investigator
```

---

*Archive created: 2026-05-15*
*Total development phases: 6*
*GitHub Repository: https://github.com/inovasigpt/nasabah*
