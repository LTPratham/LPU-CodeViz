# CodeCanvas: Technical Pitch Presentation Storyboard

This document contains a slide-by-slide storyboard for the **Technical Pitch Deck** designed for judges who want to evaluate system architecture, data flow, engineering choices, security, and scalability.

---

## Slide 1: Title & Technical Overview

* **Visual Layout**: Dominant dark-mode theme. High-tech wireframe graphic representing code compiled in a browser translating to a glowing network map of data structures.
* **Slide Copy**:
  * **Title**: CodeCanvas: Visualizing Code State
  * **Subtitle**: An AI-Simulated Code Tracing and Interactive Tutoring Architecture
  * **Tech Stack**: Next.js App Router | FastAPI | Supabase PostgreSQL | Groq Llama-3.3
  * **Developer**: Prathamesh Sawarkar (Registration ID: 12509401)
* **Speaker Script**:
  > "Hello, judges. Today, I am presenting the technical architecture of CodeCanvas—an interactive code tracing platform designed to solve the visualization gap in computer science labs. Instead of running expensive, risky sandboxes to execute student code, CodeCanvas uses a dual-layer client-server architecture powered by high-throughput AI inference models to trace execution state dynamically in under two seconds."

---

## Slide 2: The Core Technical Challenge & Architecture

* **Visual Layout**: High-level block diagram showing the data lifecycle: Monaco Editor $\rightarrow$ FastAPI API Broker $\rightarrow$ Groq AI Tracing $\rightarrow$ State Snapshot Array $\rightarrow$ Framer Motion UI Canvas.
* **Slide Copy**:
  * **The Problem**: Traditional code sandbox architectures require virtualized Docker micro-containers, which present high remote code execution (RCE) risks and heavy server bills.
  * **The Architecture**: A secure client-server framework. Renders visualizations in-browser while moving heavy tracing analysis to serverless AI middleware.
* **Speaker Script**:
  > "The standard way to build a code execution platform like LeetCode is to run student code in isolated, virtualized Docker containers on your servers. However, this is expensive and poses serious security risks. CodeCanvas bypasses this by introducing AI-Simulated Tracing. Let's look at the flow: the student writes code, our FastAPI server packages the file, Groq evaluates it, and the frontend renders the state transition snapshots."

---

## Slide 3: The AI-Simulated Tracing Engine (API Broker)

* **Visual Layout**: Flow diagram showing code sent to a Groq Llama-3.3 model and the model returning a strict schema-compliant JSON array of step snapshots.
* **Slide Copy**:
  * **AI Broker**: Leverages **llama-3.3-70b-versatile** via Groq API.
  * **Output Schema**: Strict JSON array containing line numbers, variable scopes, visual states, and plain-English explanations.
  * **Execution Speed**: High-throughput inference resolves traces in under 2.0s.
* **Speaker Script**:
  > "Our tracing backend does not execute the student's code on a physical processor. Instead, the code is sent to the Llama-3.3 model via Groq. The model acts as a virtual execution engine, outputting a strict JSON array representing every execution step. This is fast, secure, and generates natural-language explanations for every variable mutation."

---

## Slide 4: Frontend State Rendering & Monaco Integration

* **Visual Layout**: Screenshot split-screen: Monaco Editor with active highlighted lines on the left; Framer Motion animated array elements on the right.
* **Slide Copy**:
  * **Editor Integration**: Monaco Editor with custom autocompletion and syntax highlights.
  * **Dynamic Canvas**: Custom SVG visualizers using Framer Motion to maintain 60 fps transitions.
  * **State Controller**: Steps through visual states ($N \leftrightarrow N+1$) dynamically while highlighting the active line of code.
* **Speaker Script**:
  > "On the client side, we embed the Monaco Editor, giving students a professional development environment. The visualizer dashboard reads the trace JSON and passes it to Framer Motion components. As the student clicks 'Next', the variables and canvas states transition smoothly at 60 frames per second, matching the exact line highlight in the editor."

---

## Slide 5: Database Models & Row-Level Security (RLS)

* **Visual Layout**: Relational database diagram (ERD) mapping the tables: `profiles`, `classrooms`, `enrollments`, `assignments`, `submissions`, and `trace_history`.
* **Slide Copy**:
  * **Database**: Supabase PostgreSQL with automated triggers.
  * **Security Isolation**: Row-Level Security (RLS) policies prevent unauthorized cross-tenant database access.
  * **Audit Trails**: Telemetry history tracks tracing counts per topic.
* **Speaker Script**:
  > "Our database is hosted on Supabase PostgreSQL. To protect student data and support B2B multi-tenancy, we enabled Row-Level Security on all tables. Students can only query their own submissions and profiles, while professors can view enrollments and progress logs linked to their class invite codes."

---

## Slide 6: Core API Contract (POST /api/trace)

* **Visual Layout**: Dual-column code block slide showing the API Request JSON (left) and the generated Visualizer Step Snapshot JSON (right).
* **Slide Copy**:
  * **Endpoint**: `/api/trace`
  * **Parameters**: `code`, `lang`, `data_structure`
  * **Snapshot Properties**:
    * `line_number`: Int (Editor line highlight)
    * `explanation`: String (Natural language detail)
    * `variables`: Key-Value Object (Active variables scope)
    * `data_structure_state`: Custom Object (Node highlights, index swaps)
* **Speaker Script**:
  > "This is our primary API contract. When calling `/api/trace`, the payload contains the code string and target topic. The engine returns a step snapshot with the line number, natural-language explanation, variable states, and data structure mutations—such as array states and indices to swap—allowing the UI to animate transitions."

---

## Slide 7: Security Posture: RCE Defense & Minimization

* **Visual Layout**: Side-by-side comparison diagram showing Docker execution security vulnerabilities versus CodeCanvas AI execution.
* **Slide Copy**:
  * **The Docker Vulnerability**: Malicious scripts can break out of container kernels to run system commands, steal environment keys, or exhaust system resources.
  * **The CodeCanvas Defense**: Code is analyzed by an AI model, not executed natively. Malicious scripts or infinite loops are interpreted, not compiled on hardware, eliminating RCE vectors.
* **Speaker Script**:
  > "Because we don't compile student code natively, we are secure against Remote Code Execution (RCE) attacks. If a student submits an infinite loop, system command execution, or a fork-bomb script, the AI model detects and describes the behavior in the JSON trace rather than compiling it on the server hardware. This saves system resources and eliminates sandbox vulnerabilities."

---

## Slide 8: Technical Performance: latency & SLAs

* **Visual Layout**: Graph showing latency distribution (most calls resolving in under 1.5s) and a system dashboard with a $99.99\%$ uptime indicator.
* **Slide Copy**:
  * **Latency SLAs**: AI Tracing response time $\le 2.0\text{s}$ (95th percentile).
  * **Caching Layer**: Caches common student templates, yielding a $\ge 45\%$ hit ratio with sub-100ms responses.
  * **Scalability**: Stateless Next.js serverless functions handle up to 5,000 concurrent user sessions.
* **Speaker Script**:
  > "Performance is key in lab environments. Our AI tracing calls average under 1.5 seconds. For standard templates pre-loaded into our syllabus module, we use a database caching layer. When a student visualizes a template code example, the system retrieves it from cache instantly, delivering a sub-100ms response."

---

## Slide 9: Gamification & Certification Architecture

* **Visual Layout**: Graphic showing the user dashboard flow: Active Coding Streaks $\rightarrow$ XP triggers `increment_xp` DB function $\rightarrow$ Certificate Cryptographic ID Verification.
* **Slide Copy**:
  * **XP Engine**: Triggers `increment_xp` RPC functions on progress, tracking active streaks.
  * **Cryptographic Verification**: Automated PDF certificate generation linked to a unique verification route: `/verify/[id]`.
  * **Telemetry Mapping**: Roster completion reports verify course outcomes attainment.
* **Speaker Script**:
  > "To keep students motivated, we integrated a database-driven gamification engine. Tracing code triggers database RPC functions to update XP and streaks. Once a topic is complete, the platform generates a cryptographically signed PDF certificate. The certificate carries a unique ID verify route, providing proof of outcome attainment for university files."

---

## Slide 10: Future Roadmap & System Integrations

* **Visual Layout**: Timeline diagram tracing integrations: LTI 1.3 LMS integration $\rightarrow$ WebAssembly/Pyodide offline compilation $\rightarrow$ Academic Bank of Credits (ABC) national portal.
* **Slide Copy**:
  * **LTI 1.3 Compliance**: Sync rosters and push back grades to Canvas, Moodle, and Google Classroom.
  * **WASM Integration**: Client-side Pyodide compilation to support offline executions.
  * **National Integrations**: Automated progress reporting linked to the Indian Academic Bank of Credits.
* **Speaker Script**:
  > "Looking ahead, we are expanding our integrations. We are implementing LTI 1.3 standards to link rosters and gradebooks with Canvas and Moodle. We are also integrating Pyodide for WebAssembly client-side tracing and syncing progress files directly with the national Academic Bank of Credits (ABC) portal."
