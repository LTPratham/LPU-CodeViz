# CodeCanvas: Market Sizing (TAM/SAM/SOM) & Financial Projections

This document details the financial model, pricing architecture, addressable market sizing, unit economics, operational costs, and 5-year growth projections for CodeCanvas (LPU CodeViz) as a B2B higher-education SaaS product.

---

## 1. B2B & B2C Pricing Model (India Focus)

CodeCanvas utilizes a hybrid commercial model, combining B2C individual upgrades with B2B departmental and institutional site licenses. All prices are structured to comply with Indian GST rules under **SAC Code 997331** (Licensing services for the right to use computer software).

| License Tier | Base Price (INR) | GST (18%) | Total Price (INR) | Capabilities & SLA Included |
| :--- | :--- | :--- | :--- | :--- |
| **Individual Student Monthly (B2C)** | Rs. 254.24 | Rs. 45.76 | **Rs. 300.00** | Visualizer sandbox, AI Tutor Chatbot sidebar, personal trace history dashboard, and streaking metrics. |
| **Standard Departmental Annual (B2B)** | Rs. 84,745.76 | Rs. 15,254.24 | **Rs. 1,00,000.00** | Up to 500 student accounts, 10 teacher licenses, multi-tenant class boards, automated AI submission grader, and standard NAAC roster reports. |
| **Institutional Enterprise Annual (B2B)** | Rs. 2,54,237.28 | Rs. 45,762.72 | **Rs. 3,00,000.00** | Unlimited student accounts, unlimited faculty licenses, LTI 1.3 LMS integrations (Canvas/Moodle), advanced NAAC telemetry logs, SSO integration, hourly DB backups, and a dedicated Customer Success manager. |

---

## 2. Market Sizing: TAM / SAM / SOM

```
+-------------------------------------------------------------+
| TAM (Global Higher-Ed CS/IT Programs)                       |
| Rs. 1,650 Crores ($200M USD)                                |
|                                                             |
|   +-----------------------------------------------------+   |
|   | SAM (Indian Higher-Ed CS/IT - 8,500 Colleges)       |   |
|   | Rs. 127.5 Crores ($15.3M USD)                       |   |
|   |                                                     |   |
|   |   +---------------------------------------------+   |   |
|   |   | SOM (B2B Tech Universities within 5 Years)  |   |   |
|   |   | Rs. 7.0 Crores ($840K USD) ARR              |   |   |
|   +---+---------------------------------------------+---+   |
+-------------------------------------------------------------+
```

### 2.1 Total Addressable Market (TAM)
- **Scope**: All higher-education institutes, universities, community colleges, and private coding academies teaching computer science and IT globally.
- **Volume**: Approximately 50,000 institutions globally.
- **Value**: Assuming a conservative B2B contract value of $4,000 USD (approx. Rs. 3,30,000) per site license annually.
- **TAM Sizing**: **$200 Million USD (approx. Rs. 1,650 Crores)**.

### 2.2 Serviceable Addressable Market (SAM)
- **Scope**: All universities, AICTE-approved engineering colleges, and technical institutes offering B.Tech (CS/IT), BCA, and MCA degrees in India.
- **Volume**: Approximately 8,500 institutions (3,500 AICTE engineering colleges + 5,000 arts/science colleges offering IT programs).
- **Value**: Assuming a standard average contract value of Rs. 1,50,000 per institution annually.
- **SAM Sizing**: **Rs. 127.5 Crores ($15.3 Million USD)**.

### 2.3 Serviceable Obtainable Market (SOM)
- **Scope**: Tier-1 and Tier-2 engineering colleges and universities in India (focusing initially on Punjab, Haryana, Karnataka, Tamil Nadu, and Maharashtra) targeted within the next 5 years.
- **Volume**: 350 institutions.
- **Value**: Assuming an average contract value (ACV) of Rs. 2,00,000 (reflecting a mix of Departmental and Enterprise licenses).
- **SOM Sizing**: **Rs. 7.0 Crores ($840,000 USD) ARR**.

---

## 3. 5-Year Revenue Projections

### 3.1 Metrics Growth Plan

| Metric Tracker | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B2B College Signups** | 5 | 25 | 75 | 180 | 350 |
| **B2C Student Upgrades** | 1,000 | 5,000 | 15,000 | 30,000 | 60,000 |
| **Total Visual Telemetry Users** | 2,500 | 15,000 | 50,000 | 1,20,000 | 2,50,000 |
| **B2B Revenue (INR)** | Rs. 10,00,000 | Rs. 50,00,000 | Rs. 1,50,00,000 | Rs. 3,66,00,000 | Rs. 7,00,00,000 |
| **B2C Revenue (INR)** | Rs. 3,00,000 | Rs. 15,00,000 | Rs. 45,00,000 | Rs. 90,00,000 | Rs. 1,80,00,000 |
| **Total ARR (INR)** | **Rs. 13,00,000** | **Rs. 65,00,000** | **Rs. 1,95,00,000** | **Rs. 4,56,00,000** | **Rs. 8,80,00,000** |

---

## 4. Operational Cost Model (OpEx)

CodeCanvas is a highly scalable software product with low overhead. The main operating expenses relate to cloud storage, API compute, and B2B sales reps.

### 4.1 Cloud Infrastructure Costs (Annual Breakdown)
- **FastAPI Application Hosting (Vercel / Railway)**:
  - Year 1: Rs. 24,000
  - Year 5: Rs. 4,80,000
- **Supabase Database (PostgreSQL storage, connection pooling, logs archiving)**:
  - Year 1: Rs. 30,000
  - Year 5: Rs. 18,00,000
- **Domain, SSL, security firewalls (Cloudflare Enterprise)**:
  - Year 1: Rs. 12,000
  - Year 5: Rs. 6,00,000

### 4.2 Groq LLM API Usage Costs (Unit Economics)
CodeCanvas completely avoids expensive GPU server hosting by using Groq's llama-3.3-70b-versatile model on a pay-per-token model:
- **Usage Model**:
  - One student averages 40 traces per month during lab classes.
  - Average token count per trace request: 8,000 prompt tokens (includes code, constraints, and instructions) + 2,000 output tokens (execution steps array) = 10,000 tokens.
  - Groq API Cost rates: \$0.59 / million input tokens, \$0.79 / million output tokens.
  - Average trace request cost: **\$0.0063 USD (approx. Rs. 0.50 INR)**.
  - Monthly cost per active student: 40 traces $\times$ Rs. 0.50 = **Rs. 20.00**.
  - **Marginal Cost**: Represents less than **7.8%** of the Rs. 254.24 individual base monthly fee, resulting in a **92.2% Gross margin** on computing.

---

## 5. B2B Unit Economics

Unit economics show a highly profitable profile, typical of institutional software sales:

- **Customer Acquisition Cost (CAC) per Institution**: **Rs. 30,000**.
  - Includes travel expenses for sales reps to campuses, brochures, and targeted LinkedIn advertising.
- **Average Contract Value (ACV) per Institution**: **Rs. 2,00,000 / year**.
- **Customer Lifetime Value (LTV)**: **Rs. 6,00,000**.
  - Calculated assuming an average institutional customer lifespan of 3 years.
- **LTV / CAC Ratio**: **20.0x**.
  - Any ratio over 3.0x is considered highly viable for B2B SaaS. This indicates excellent return on sales capital.

---

## 6. Break-Even Analysis

### 6.1 Year 1 Fixed vs. Variable Costs
- **Fixed Monthly OpEx**: Rs. 80,000 (includes domain, core hosting tiers, marketing, and essential B2B travels).
- **Variable Margins**: Average Gross Margin of $85\%$ on B2B licensing (deducting sales margins and customer success token fees).
- **Target Revenue for Monthly Break-Even**:
  $$\text{Break-Even Revenue} = \frac{\text{Fixed OpEx}}{\text{Gross Margin \%}} = \frac{\text{Rs. 80,000}}{0.85} = \text{Rs. 94,117 / month}$$
- **Institutional Scale Target**: Reaching break-even requires maintaining:
  - **6 active Departmental Annual subscriptions** (yielding Rs. 1,00,000 each per year $\approx$ Rs. 50,000/month across semesters), OR
  - **2 Institutional Enterprise Annual subscriptions** (yielding Rs. 3,00,000 each per year $\approx$ Rs. 50,000/month).
  - Break-even is projected to occur in **Month 4** of operations.
