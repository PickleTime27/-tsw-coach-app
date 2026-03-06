# TSW Coach App

**Your companion through topical steroid withdrawal.**

Live at [tsw-coach-app.vercel.app](https://tsw-coach-app.vercel.app)

---

## About

TSW Coach is a free, AI-powered support platform for people going through topical steroid withdrawal. Built with Next.js, TypeScript, and Supabase.

## Features

- **BALM AI Companion** - 24/7 conversational support trained on TSW science
- **Symptom Tracker** - Daily logging of 10 TSW-specific symptoms with severity sliders
- **Progress Charts** - SVG line charts with trend analysis over customizable date ranges
- **Panic Button** - Breathing exercises, grounding techniques, and crisis resources
- **Safety Circle** - Trusted contacts alerted when panic button is activated
- **Community** - Connect with others via posts and direct messages using nicknames
- **TSW News Feed** - Curated research and news updates
- **Privacy Policy** - Health data privacy built in from day one

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **AI**: OpenAI API with custom TSW system prompts
- **Deployment**: Vercel (auto-deploy from GitHub)
- **Email**: Resend
- **Styling**: Inline styles with DM Sans + Lora fonts

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
src/
  app/
    chat/         # BALM AI companion
    tracker/      # Symptom tracker with 10 categories
    progress/     # Progress charts with SVG visualization
    community/    # Community board
    dm/           # Direct messages
    news/         # TSW news feed
    onboarding/   # User onboarding flow
    safety-circle/# Safety circle management
    settings/     # User settings & notifications
    privacy/      # Privacy policy
    admin/        # Admin dashboard
    auth/         # Authentication
    api/          # API routes (chat, symptoms, checkin, etc.)
  lib/
    supabase.ts   # Supabase client
    profile.ts    # Profile management (cookie-based)
    notify.ts     # Email notifications
\`\`\`

## Related

- [tsw-coach](https://github.com/PickleTime27/tsw-coach) - Documentation, product framework, advocacy materials

---

Built by Shawn Bullis in Marysville, Washington.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
