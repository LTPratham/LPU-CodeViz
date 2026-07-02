# Product Requirements Document (PRD) — CodeCanvas

## 1. Product Vision
CodeCanvas is an AI-powered code visualization and tutoring SaaS product designed specifically for Indian universities. It bridges the gap between theoretical data structures/algorithms and concrete execution state, improving classroom comprehension and student lab outcomes while automating administrative compliance reports (such as NAAC accreditation records).

## 2. Key Stakeholders & Personas
- **Student**: Wants intuitive, interactive coding labs, step-by-step traces, gamified rewards, and voice AI tutoring to pass CSE/IT exams.
- **Teacher / HOD**: Wants a unified panel to manage lab groups, assign coding challenges, grade traces, and pull data for NBA/NAAC evaluations.
- **University Administrator / Dean**: Wants to increase college placement rates, modernise EdTech tooling, and guarantee full DPDP Act compliance.

## 3. Product Architecture & Modules
- **Visualizer Engine**: WebAssembly execution (Pyodide for Python) + serverless parsing for C/C++/Java/SQL. Renders live arrays, linked structures, recursion call stacks, and tables.
- **AI Tutor Module**: LLM-generated line-by-line trace annotations and a slide-out chat window supporting contextual code questions.
- **Institutional Admin Panel**: Multi-tenant class management, student progression logs, and one-click NAAC engagement exports.
- **SaaS Core**: Supabase Auth (SSO, role selection), Razorpay billing, sitemap routes, legal pages, and robust security headers.

## 4. Compliance & Invoicing (India Target)
- **DPDP Act 2023**: Granular consent tracking, clear Data Principal rights, and permanent data deletion support in user profiles.
- **NAAC/NBA Reporting**: Tracking and exporting student trace telemetry and progression metrics per class.
- **GST Invoicing**: Integration readiness for generating GST invoices (18% rate) with PO matching.
