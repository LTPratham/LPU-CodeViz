# Implementation Plan: Redesign CodeCanvas Landing Page (Linear/Vercel-style) - Revised Accent
Date: 2026-08-16
Summary: Redesigning the CodeCanvas landing page using a custom, debugger-centric design system. Incorporates an amber accent system, Space Grotesk display font, neutral light/dark mode color tokens, and a clean verification plan.

## Revised Design Direction

- **Sleek Amber Accent**: Move away from generic stock-blue and indigo. The accent is now **Amber**, mimicking the "active execution line" color used by real debuggers and IDEs (VS Code's debug line highlight, gdb, memory inspectors).
- **Restrained Application**: Amber is used for exactly three things: the primary CTA, the active-line indicator, and hover states — nowhere else — keeping it meaningful and functional.
- **Unified CTAs**: Fold the "Battleground orange" into this same amber family. Battleground CTAs will be styled as ghost buttons with icons, eliminating competing warm hues in the hero.
- **Typography Pairing**:
  - **Heading/Display Font**: `Space Grotesk` (Google Font) — a geometric, distinct character face that avoids the stock "Plus Jakarta Sans" default.
  - **Body/UI Font**: `Inter` — clean sans-serif for standard text.
  - **Code/Data Font**: `JetBrains Mono` — used for trace variables and code editors.

---

## Design Token System

### Dark Theme (Default)
- **Background (`--bg`)**: `#0A0B0D` (neutral near-black, no purple/blue tint)
- **Panel/Surface (`--surface-1` / `--panel`)**: `#121317` (card/container surface)
- **Border (`--border`)**: `#1E2024` (hairline dividers)
- **Text/Heading (`--text`)**: `#F2F3F5` (headings and body)
- **Muted Text (`--muted`)**: `#8B9099` (captions, secondary copy)
- **Accent Primary (`--primary`)**: `#E2A73E` (warm amber, active execution line highlight)
- **Accent Hover (`--primary-hover`)**: `#C68F2E` (darker amber for pressed/hover states)
- **Info/Secondary (`--info`)**: `#7C93B3` (desaturated slate-blue for links/tags only, never a competing CTA color)
- **Secondary Surfaces & Accents**:
  - `--surface-2`: `#1A1D24`
  - `--surface-3`: `#232730`
  - `--primary-dim`: `rgba(226, 167, 62, 0.1)`
  - `--primary-border`: `rgba(226, 167, 62, 0.25)`
  - `--primary-glow`: `rgba(226, 167, 62, 0.15)`

### Light Theme
- **Background (`--bg`)**: `#FAFAF9` (neutral off-white, not warm-cream)
- **Panel/Surface (`--panel` / `--surface-1`)**: `#FFFFFF` (pure white for cards/panels)
- **Border (`--border`)**: `#E6E5E2` (hairline border)
- **Text/Heading (`--text`)**: `#111214` (ink-black for headings and body)
- **Muted Text (`--muted`)**: `#5B5F66` (charcoal secondary copy)
- **Accent Primary (`--primary`)**: `#B9791A` (darkened amber for AA contrast on white)
- **Accent Hover (`--primary-hover`)**: `#96610F` (pressed state)
- **Info/Secondary (`--info`)**: `#4F6A93` (darkened slate-blue counterpart)
- **Secondary Surfaces & Accents**:
  - `--surface-2`: `#F2F1ED`
  - `--surface-3`: `#E6E5E2`
  - `--primary-dim`: `rgba(185, 121, 26, 0.08)`
  - `--primary-border`: `rgba(185, 121, 26, 0.2)`
  - `--primary-glow`: `rgba(185, 121, 26, 0.1)`

---

## Proposed Changes

### Component 1: Global CSS Updates
#### [MODIFY] [globals.css](file:///d:/projects/LPU%20CodeViz/frontend/app/globals.css)
- Import `Space Grotesk` (weights 500, 600, 700) along with `Inter` and `JetBrains Mono`.
- Redefine `:root` and `html.light` variables with the new neutral/amber/slate-blue design tokens.
- Add utility styling for headings (`h1, h2, h3, h4`) to use `var(--font-display)`.

### Component 2: Landing Page Layout Redesign
#### [MODIFY] [page.tsx](file:///d:/projects/LPU%20CodeViz/frontend/app/page.tsx)
- **Theme Support**: Keep the theme switcher in navigation header and mobile dropdown, updating active styles to use amber.
- **Hero Redesign**:
  - Format title with `Space Grotesk` and color highlights using amber.
  - Simplify CTAs: "Start Visualizing Free" is styled in primary amber. "Enter Battleground Arena" is styled as a secondary ghost button (no competing orange/yellow gradient).
- **Signature Trace Element (`MiniTracerPreview`)**:
  - Use amber (`var(--primary)`) specifically for the active-line highlights and active step markers.
  - In the code panel, style the current step line to have a solid amber left border and amber-tinted background.
  - Center elements and align colors.
- **Features Section**:
  - Cards style: flat-bordered containers with neutral layouts and subtle amber border hover states.
- **ROI Calculator / Pricing / FAQ / Contact**:
  - Apply new light/dark neutral tokens.
  - Pricing cards: Remove success-green borders and replace with clean border accents (primary amber for Pro, standard borders for Free/Dept).

---

## Verification Plan

### Automated Verification
- Run `npm run build` inside the `frontend` folder to ensure no compilation or Next.js build errors occur.
- Run `npm run lint` to confirm TypeScript compliance.

### Manual Verification
- Verify that light theme contrast meets accessibility requirements against the off-white background.
- Test stepping execution synchronization (Prev, Play, Next) in `MiniTracerPreview`.
