# TalentOS — Enterprise AI Recruitment Platform

Production-ready AI Recruitment Platform featuring AI-powered candidate matching, resume parsing, and job description generation.

## Technical Stack
- **Frontend**: React 19, TypeScript, Vite, TanStack Router, Tailwind CSS
- **Backend API**: Node.js, Express.js, TypeScript, PostgreSQL (Supabase), Prisma ORM
- **AI Integration**: Gemini / OpenAI models for candidate parsing and evaluation.

---

## Environment Variables

To run the platform locally or in production, ensure the following environment variables are configured. 

### Backend `.env`
```env
PORT=4000
DATABASE_URL="postgresql://[tenant-id]:[password]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?schema=public"
JWT_SECRET="your-super-secret-key"
```

---

## Deployment URLs
- **Backend (Render)**: https://talentos-backend-lfkp.onrender.com
- **Frontend (Vercel)**: Pointed to the backend URL.

---

## Role-Based Access Control (Seed Accounts)

The system supports granular RBAC with the following roles: `SUPER_ADMIN`, `ADMIN`, `RECRUITER`, `HIRING_MANAGER`, `INTERVIEWER`, `VIEWER`. 

For local testing, the following accounts are pre-seeded:
- **Admin Account (SUPER_ADMIN)**: `admin@talentos.ai` / `Password123!`
- **Recruiter Account (RECRUITER)**: `recruiter@talentos.ai` / `Password123!`
