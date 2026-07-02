# System Architecture — CodeCanvas

## 1. Technical Stack Overview
CodeCanvas is structured as a modern multi-tenant Next.js web application:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion.
- **Database & Backend Services**: Supabase (PostgreSQL with Row Level Security), Vercel Serverless Functions.
- **WASM Client-side Execution**: Pyodide (Python standard library runs in-browser).
- **Payment Broker**: Razorpay Checkout (UPI, Cards, Netbanking).
- **Auth Provider**: Supabase Auth (OTP and Google OAuth).

## 2. Data Flow Map
- **Sign In / Registration**: User signs in via Supabase -> redirects to auth callback -> checks user role -> routes to dashboard.
- **Sandbox Code Tracing**: Code written in Monaco -> run button compiles/traces client-side (or server API) -> generates trace states JSON -> dispatches to visual canvas components.
- **Assignments**: Teacher publishes challenge -> stored in `assignments` -> student fetches code starter -> student submits trace JSON -> stored in `submissions` -> teacher reviews and overrides grades.
- **NAAC Analytics**: Telemetry logged to database index -> HOD requests export -> queries tables -> generates CSV download.
