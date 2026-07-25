# TalentOS — Enterprise AI Recruitment Platform

Production-ready, enterprise-grade AI Recruitment Platform comparable to Greenhouse, Lever, Ashby, and Workday Recruiting.

---

## Technical Stack

- **Frontend**: TanStack Start, React 19, TypeScript, Tailwind CSS
- **Backend API**: Express.js, Node.js, TypeScript, Clean Architecture
- **Database**: PostgreSQL 16 + Prisma ORM
- **Background Processing**: Redis + BullMQ
- **AI Infrastructure**: Multi-provider abstraction layer (OpenAI, Anthropic, Google Gemini)
- **Containerization**: Docker & Docker Compose
- **Testing**: Vitest & Playwright

---

## Quick Start (Local Development)

### 1. Run full stack via Docker Compose:
```bash
docker-compose up --build
```

### 2. Run backend locally:
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```

### 3. Run frontend locally:
```bash
npm install
npm run dev
```

---

## Seed Accounts

- **Admin Account**: `admin@talentos.ai` / `Password123!`
- **Recruiter Account**: `recruiter@talentos.ai` / `Password123!`

---

## Key Features

- **Candidate Pipeline**: Live Kanban drag-and-drop board with stage audit logs.
- **AI Resume Parser & Analyzer**: Structured text extraction, resume scoring, and strength evaluation.
- **Explainable AI Matching**: Weighted skill, experience, and education matching scores.
- **AI Job Description & Interview Kit Generator**: Automated requisition & question bank creation.
- **Enterprise Security**: JWT with HTTP-Only Cookies, RBAC, Pino logging, and audit tracking.
