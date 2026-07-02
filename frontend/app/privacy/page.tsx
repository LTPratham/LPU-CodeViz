import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — CodeCanvas",
  description: "Privacy policy outlining data collection, storage, and processing practices in compliance with the DPDP Act 2023.",
};

export default function PrivacyPage() {
  const containerStyle: React.CSSProperties = {
    maxWidth: 800,
    margin: "0 auto",
    padding: "40px 24px 80px",
    color: "var(--text)",
    lineHeight: 1.7,
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 0",
    borderBottom: "1px solid var(--border)",
    marginBottom: 40,
  };

  const h1Style: React.CSSProperties = {
    fontSize: "clamp(24px, 4vw, 36px)",
    fontWeight: 800,
    letterSpacing: "-1px",
    marginBottom: 8,
  };

  const h2Style: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 36,
    marginBottom: 16,
    color: "var(--primary)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={containerStyle}>
        <nav style={navStyle}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--text)", fontWeight: 700 }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ margin: "auto" }}>
                <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
              </svg>
            </div>
            <span>CodeCanvas</span>
          </Link>
          <Link href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
            Back to Home
          </Link>
        </nav>

        <h1 style={h1Style}>Privacy Policy</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>Last Updated: July 2, 2026</p>

        <p>
          At CodeCanvas, we are committed to protecting the privacy and personal data of our users (students, faculty, and administrators). This Privacy Policy explains how we collect, store, use, disclose, and safeguard your information when you use our Service.
        </p>
        <p>
          This policy is structured in compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong> and other applicable global data privacy regulations. Under the DPDP Act, your university acts as the &ldquo;Data Fiduciary&rdquo; and CodeCanvas acts as the &ldquo;Data Processor&rdquo;.
        </p>

        <h2 style={h2Style}>1. Data We Collect</h2>
        <p>
          We only collect personal data that is necessary for providing the educational visualizer features and tracking classroom progress. This includes:
        </p>
        <ul>
          <li><strong>Identity and Contact Data:</strong> Name, institutional email, phone number, and account profile picture (if authenticated via Google).</li>
          <li><strong>Academic and Progression Data:</strong> Enrolled classes, assignment submissions, code snippets, visualizer trace histories, completed challenges, and XP/progress indicators.</li>
          <li><strong>Usage Data:</strong> Technical logs, browser user-agent strings, IP address, and cookie details collected solely for security, authentication, and platform performance monitoring.</li>
        </ul>

        <h2 style={h2Style}>2. Consent and Purpose of Collection</h2>
        <p>
          We collect and process your personal data under the following conditions:
        </p>
        <ul>
          <li><strong>With Your Consent:</strong> When you register an account, you consent to our collection of profile details to identify you in classrooms and track your accomplishments. Consent is unconditional, granular, and can be withdrawn.</li>
          <li><strong>Legitimate Purposes:</strong> To facilitate assignments created by your university teachers, export NAAC engagement reports, and verify grading submissions.</li>
        </ul>

        <h2 style={h2Style}>3. Data Storage and Retention</h2>
        <p>
          All personal and academic data is stored securely in our databases hosted on **Supabase** (PostgreSQL databases with Row Level Security).
        </p>
        <ul>
          <li><strong>Data Residency:</strong> Data is hosted primarily on secure cloud servers. In accordance with Indian regulations, billing and identity details are managed securely.</li>
          <li><strong>Data Retention:</strong> We retain your personal data for as long as your account is active or as needed to provide the Service to your university department. Upon graduation or classroom deletion, data can be requested to be archived or deleted.</li>
        </ul>

        <h2 style={h2Style}>4. Sharing of Personal Data</h2>
        <p>
          We do not sell, rent, or trade your personal data. We only share data with third parties under the following strict circumstances:
        </p>
        <ul>
          <li><strong>With Your Teachers:</strong> Your classroom enrollment, code submissions, trace activity, and assignment performance are visible to classroom instructors.</li>
          <li><strong>Service Providers:</strong> We use trusted subprocessors (Supabase for databases/auth, Razorpay for payment processing, Resend for email notifications) who adhere to strict data protection agreements.</li>
          <li><strong>Legal Mandates:</strong> If required by law, court order, or regulatory authorities in India.</li>
        </ul>

        <h2 style={h2Style}>5. Data Principal Rights (Your Rights)</h2>
        <p>
          Under the DPDP Act 2023, you have the following rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Right to Access:</strong> Request a summary of the personal data we hold about you and the processing activities.</li>
          <li><strong>Right to Correction and Erasure:</strong> Correct inaccurate details or request deletion of your account and personal history. You can initiate this by emailing us or visiting the Profile settings.</li>
          <li><strong>Right to Grievance Redressal:</strong> Submit inquiries or complaints about our data handling practices to our Grievance Officer at <a href="mailto:codecanvas@lpu.in" style={{ color: "var(--primary)" }}>codecanvas@lpu.in</a>.</li>
        </ul>

        <h2 style={h2Style}>6. Cookies and Tracking</h2>
        <p>
          We use functional cookies to keep you signed in, persist visualizer editor settings, and track guided product tour completions. You can manage cookie preferences in your browser settings, though disabling them may affect core platform authentication.
        </p>
      </div>
    </div>
  );
}
