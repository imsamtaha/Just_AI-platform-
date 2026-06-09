# SAM AI — Deployment Guide

## Prerequisites

- Node.js 22+
- PostgreSQL database (Railway / Supabase / Neon)
- Clerk account
- OpenAI API key
- Stripe account
- Vercel account

---

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Railway / Supabase / Neon dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks |
| `OPENAI_API_KEY` | platform.openai.com |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `GOOGLE_AI_API_KEY` | ai.google.dev |
| `DEEPSEEK_API_KEY` | platform.deepseek.com |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| `STRIPE_PRO_PRICE_ID` | Stripe Dashboard → Products |
| `STRIPE_BUSINESS_PRICE_ID` | Stripe Dashboard → Products |
| `UPLOADTHING_SECRET` | uploadthing.com |
| `UPLOADTHING_APP_ID` | uploadthing.com |

---

## 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run migrations in production
npm run db:migrate
```

---

## 3. Clerk Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Set OAuth providers (Google, GitHub, etc.)
3. Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

---

## 4. Stripe Setup

1. Create products in Stripe Dashboard:
   - **SAM AI Pro**: $29/month recurring
   - **SAM AI Business**: $99/month recurring
2. Copy price IDs to `STRIPE_PRO_PRICE_ID` and `STRIPE_BUSINESS_PRICE_ID`
3. Set webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
# ... add all other env vars

# Deploy to production
vercel --prod
```

Or connect GitHub repo to Vercel for automatic deployments.

---

## 6. Deploy Database to Railway

1. Create Railway account at [railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copy `DATABASE_URL` from Railway dashboard
4. Run: `npm run db:push`

---

## 7. Make First User Admin

After signing up, run this in your DB:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your@email.com';
```

Or via Prisma Studio:
```bash
npm run db:studio
```

---

## 8. Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
SAM AI
├── Frontend (Next.js 15 on Vercel)
├── Database (PostgreSQL on Railway)
├── Auth (Clerk)
├── AI (OpenAI / Anthropic / Google / DeepSeek)
├── Payments (Stripe)
└── Storage (UploadThing)
```
