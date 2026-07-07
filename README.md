# JUST AI — All-in-One AI Productivity Ecosystem

Premium SaaS platform combining AI Assistant, Planner, Writer, Business Consultant, CRM, Automations, Knowledge Base, Project Manager, and Analytics.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Clerk
- **AI**: OpenAI (GPT-4o), Anthropic (Claude), Google (Gemini), DeepSeek
- **Payments**: Stripe
- **Storage**: UploadThing / AWS S3
- **Deployment**: Vercel + Railway

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Configure your .env.local with API keys

# 4. Set up database
npm run db:push

# 5. Run development server
npm run dev
```

## Modules
1. **AI Assistant** — Multi-model chat (GPT-4o, Claude, Gemini, DeepSeek)
2. **AI Planner** — Goal tracking, milestones, AI-generated plans
3. **AI Writer** — 10+ content types, tone/length control
4. **Business Consultant** — SWOT, market analysis, revenue planning
5. **Project Manager** — Kanban boards, tasks, sprints
6. **Knowledge Base** — RAG search across PDFs, websites, videos
7. **Automations** — Visual workflow builder
8. **CRM** — Contacts, leads, deals, AI scoring
9. **Document Center** — Upload, search, version control
10. **Analytics** — Productivity scores, AI usage, revenue

## Pricing
- **Free**: Limited features
- **Pro**: $29/month — Unlimited AI + all modules
- **Business**: $99/month — Teams + CRM + API
- **Enterprise**: Custom pricing

## Design
Premium futuristic interface with black background (#050505), neon orange accents (#FF7A00), glassmorphism effects, and 3D illuminated cards.
