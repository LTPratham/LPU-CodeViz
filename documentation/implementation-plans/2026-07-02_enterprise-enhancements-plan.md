# Enterprise Enhancements Implementation Plan (Pillars 2 & 3)
**Date:** 2026-07-02
**Author:** Antigravity & Prathamesh Sawarkar

## Goal Description
Transform CodeCanvas into an enterprise-ready institutional SaaS platform by building:
1. **DPDP Act & GDPR Cookie Consent Banner**: An interactive bottom banner and modal with granular toggles (Essential, Analytics, Marketing) that persists user preferences in localStorage and aligns with India's DPDP Act 2023.
2. **Public System Status & SLA Dashboard (`/status`)**: A standalone page showing 99.99% system uptime, real-time simulated health checks across AI compiler, database, and auth endpoints, latency charts, and incident history.
3. **AI Predictive "At-Risk Student" Radar**: A high-impact analytics module inside the Teacher Hub (`/dashboard/teacher`) that identifies students struggling with algorithms (e.g., recursive timeouts, memory leaks, high syntax error ratios) and provides actionable faculty intervention recommendations.

## User Review Required
> [!IMPORTANT]
> **Enterprise Trust Architecture**: The `/status` page will be publicly accessible without authentication so institutional IT buyers can inspect uptime guarantees during procurement reviews.

> [!TIP]
> **DPDP Compliance**: The Cookie Consent banner will default to non-intrusive bottom placement with a one-click "Accept All" or granular "Customize" option to ensure seamless UX without sacrificing legal compliance.

## Open Questions
- None. All requirements and design tokens match our existing dark-mode design system (`--bg`, `--text`, `--primary: #05DF72`).

## Proposed Changes

---

### Security & Legal Compliance

#### [NEW] [CookieBanner.tsx](file:///d:/projects/LPU%20CodeViz/frontend/components/CookieBanner.tsx)
- Bottom floating dark-mode glassmorphic banner (`z-index: 9999`).
- Buttons: "Accept All", "Reject Non-Essential", "Customize Preferences".
- Preferences Modal: toggles for Essential (locked on), Analytics, and Marketing cookies.
- Saves choice to `localStorage` (`codecanvas_cookie_consent`) and applies animated entrance/exit transitions.

#### [MODIFY] [layout.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/layout.tsx)
- Import and mount `<CookieBanner />` inside `RootLayout` so it appears universally across all public and authenticated routes.

---

### Enterprise SLA & Trust Signals

#### [NEW] [page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/status/page.tsx)
- Public System Status Dashboard at `/status`.
- Hero header: "All Systems Operational — 99.99% 90-Day Uptime SLA".
- Live service breakdown:
  - ⚡ **AI Algorithm Compiler & Sandbox**: Operational (142ms avg latency)
  - 🗄️ **Supabase Database & Realtime Sync**: Operational (38ms avg latency)
  - 🔐 **Authentication & RBAC Engine**: Operational (45ms avg latency)
  - 💳 **Razorpay B2B Billing Gateway**: Operational (98ms avg latency)
- 90-day interactive uptime visualizer grid (green operational squares with hover tooltips).
- Past Incident log (e.g., "June 28: Resolved minor Turbopack compiler latency").
- Top navigation bar linking back to home and documentation.

---

### Faculty Intelligence & Analytics

#### [NEW] [AtRiskRadar.tsx](file:///d:/projects/LPU%20CodeViz/frontend/components/AtRiskRadar.tsx)
- Dedicated AI Warning widget displaying a list of "Flagged At-Risk Students".
- Metrics per student:
  - **Risk Score**: e.g., `88% High Risk` (color-coded red/amber).
  - **Primary Concept Block**: e.g., `Recursion & Call Stack Overflow`.
  - **Error Ratio**: e.g., `4.2 syntax/runtime errors per compile`.
  - **Inactivity Duration**: e.g., `No sandbox traces in 5 days`.
- Action buttons: "📧 Send AI Intervention Prompt" / "📌 Assign Targeted Practice Challenge".

#### [MODIFY] [page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/dashboard/teacher/page.tsx)
- Embed the `<AtRiskRadar />` component into the Teacher Dashboard Overview tab.
- Add a dedicated "🚨 At-Risk Radar" tab to the faculty sidebar navigation for deep-dive student monitoring.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify zero TypeScript errors and successful static route generation for `/status`.
- Execute a headless verification or script to confirm HTTP 200 status on `/status`.

### Manual Verification
- Open `http://localhost:3000` to verify the Cookie Banner mounts, test modal customization, and check localStorage persistence.
- Visit `http://localhost:3000/status` to inspect uptime visualizer grids and responsive layout.
- Visit `http://localhost:3000/dashboard/teacher` and switch to the At-Risk Radar tab to verify intervention modals and student risk score formatting.
