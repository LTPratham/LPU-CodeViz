# Implementation Plan: Extend the Design System to Interior App Pages
Date: 2026-08-16
Summary: Plan to extend the landing-page design token system (Amber brand accent, Space Grotesk display headings, and desaturated status indicators) to all interior pages of CodeCanvas, including Battleground, dashboards, At-Risk radar, and topbars.

---

## Proposed Changes

### Component 1: Semantic Status Tokens in Global CSS
#### [MODIFY] [globals.css](file:///d:/projects/LPU%20CodeViz/frontend/app/globals.css)
Add desaturated semantic status variables to `:root` (dark mode) and `html.light` (light mode) to replace raw neon colors with balanced, accessible tones:
- **Dark Mode**:
  - `--danger`: `#C24444` (high risk, error states)
  - `--danger-dim`: `rgba(194, 68, 68, 0.12)`
  - `--success`: `#4C9A6A` (completed, low risk, positive states)
  - `--success-dim`: `rgba(76, 154, 106, 0.12)`
- **Light Mode**:
  - `--danger`: `#B23B3B`
  - `--danger-dim`: `rgba(178, 59, 59, 0.08)`
  - `--success`: `#3D7D56`
  - `--success-dim`: `rgba(61, 125, 86, 0.08)`

---

### Component 2: Battleground Lobby Page Redesign
#### [MODIFY] [page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/battleground/page.tsx)
- **Background Reskin**: Replace the standalone indigo-navy radial gradient background with `var(--bg)` to match the landing page theme.
- **Card Accents Refactor**:
  - Remove purple (`#8B5CF6`) and green (`#10B981`) CTA buttons.
  - Set the primary "Student Combat Arena" card to be outlined with `2px solid var(--primary)` (amber) and its button to `className="btn btn-primary"`.
  - Style the other two cards (Faculty Host & 1v1 Duels) as neutral cards with `1px solid var(--border)` and ghost-style outline buttons (`className="btn btn-ghost"`).
  - Restyle the "MOST POPULAR" badge on Card 2 with `background: var(--primary-dim)` and `color: var(--primary)`.
- **Top Nav & Text Refactor**: Replace all hardcoded whites/slates/ambers with `var(--text)`, `var(--muted)`, and `var(--primary)`.

---

### Component 3: Battleground Host & Play Pages
#### [MODIFY] [host/page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/battleground/host/page.tsx)
#### [MODIFY] [play/page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/battleground/play/page.tsx)
- **Neutral Backgrounds**: Replace hardcoded dark backgrounds (`#020617`, `#020617`) with `var(--bg)`.
- **Component Tokenization**: Update select containers, inputs, labels, and borders to use `var(--panel)` (or `var(--surface-1)`), `var(--border)`, and `var(--muted)`.
- **Accent Unification**: Convert gameplay-related buttons, active room highlights, and leaderboard components to refer to `var(--primary)` (amber), `var(--success)`, and `var(--danger)`.

---

### Component 4: At-Risk Student Radar Polish
#### [MODIFY] [AtRiskRadar.tsx](file:///d:/projects/LPU%20CodeViz/frontend/components/AtRiskRadar.tsx)
- **Alert Banner Styling**: Replace the full-width saturated gradient banner with a flat `var(--surface-1)` card, a `1px solid var(--border)` outline, and a small `var(--danger)` count badge.
- **Copy Simplification**:
  - Change "AI Telemetry Diagnosis" to "Diagnosis".
  - Change "dispatch automated interventions" / "dispatched intervention" to "send check-in" / "sent check-in".
- **Risk Badges**: Use `var(--danger)` / `var(--danger-dim)` for High Risk, and `var(--warning)` / `var(--warning-dim)` (amber) for Moderate Risk. No third ad-hoc colors.
- **General Clean Up**: Replace all occurrences of `#05DF72` (neon green) and `#F43F5E` (neon rose) with `--success` and `--danger`.

---

### Component 5: Teacher & Student Dashboards
#### [MODIFY] [teacher/page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/dashboard/teacher/page.tsx)
#### [MODIFY] [student/page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/dashboard/student/page.tsx)
- **Stat Cards Unification**:
  - Restyle stat card icon containers (e.g., `Total Traces Run`, `Daily Streak`, `XP Earned`) to use a unified neutral theme: `var(--surface-2)` background, `var(--muted)` icon color, and `1px solid var(--border)` boundaries.
  - Highlight only specific values in amber: the `Daily Streak` count for students to incentivize daily engagement, and `Active Classrooms` for teachers. All other numbers will render in default `var(--text)`.
- **Risk Indicator Alerts**: Refactor risk alerts in the Teacher Dashboard list to use the new desaturated `--danger` / `--warning` system.

---

### Component 6: Dashboard Top Navigation Bar
#### [MODIFY] [DashboardTopBar.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/dashboard/DashboardTopBar.tsx)
- **Tokenize Arena Button**: Replace the hardcoded orange styles (`#F59E0B` and rgba equivalents) on the "⚔️ Arena" link with the primary amber variables: `var(--primary)`, `var(--primary-dim)`, and `var(--primary-border)`.

---

## Verification Plan

### Automated Verification
- Run production build `npm run build` in the `frontend` folder to guarantee typescript and bundler compilation.
- Run a grep check: `grep -rn "#[0-9A-Fa-f]\{6\}" app/battleground components/AtRiskRadar.tsx app/dashboard` to verify that no raw hex codes remain in component files outside of `globals.css`.

### Manual Audit
- Run `npm run dev` and visually verify that the interior pages match the brand-centric Amber accent and Space Grotesk headings in both light and dark modes.
