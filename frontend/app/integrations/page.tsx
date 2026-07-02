import Link from "next/link";

export const metadata = {
  title: "LMS & SSO Integrations — CodeCanvas",
  description: "Learn how to connect CodeCanvas with Moodle, Blackboard, Canvas, and Google Classroom via LTI 1.3 Advantage.",
};

export default function IntegrationsPage() {
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

        <h1 style={h1Style}>LMS &amp; SSO Integrations</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>
          Deploy CodeCanvas across your entire university campus in minutes.
        </p>

        <p>
          For modern universities, educational tools cannot exist in isolation. CodeCanvas is built on open standards that integrate seamlessly with your existing **Learning Management Systems (LMS)** and **Single Sign-On (SSO)** directories, eliminating student account creation overhead and automating grade bookkeeping.
        </p>

        <h2 style={h2Style}>1. LTI 1.3 Advantage Integration (Moodle, Canvas, Blackboard)</h2>
        <p>
          CodeCanvas conforms to the **1EdTech Learning Tools Interoperability (LTI) 1.3** and **LTI Advantage** standards. This allows for deep, secure integrations with Moodle, Canvas, D2L Brightspace, and Blackboard:
        </p>
        <ul>
          <li><strong>SSO Launch:</strong> Students launch the visualizer sandbox directly from their Moodle/Canvas course page without needing to remember a separate password.</li>
          <li><strong>Deep Linking:</strong> Teachers can search and select specific algorithm challenges from our catalog and embed them directly as course assignments.</li>
          <li><strong>Assignment &amp; Grade Services (AGS):</strong> Student scores, completion telemetry, and trace submissions are passed back automatically to the university gradebook.</li>
        </ul>

        <h2 style={h2Style}>2. Google Classroom Adapter</h2>
        <p>
          For departments using Google Workspace for Education, CodeCanvas integrates via the **Google Classroom API**:
        </p>
        <ul>
          <li>Import class rosters with one click.</li>
          <li>Post coding visual challenges directly to the student Classroom Stream.</li>
          <li>Sync grades and trace records back to Google Sheets and Classroom portfolios.</li>
        </ul>

        <h2 style={h2Style}>3. Campus Single Sign-On (SSO)</h2>
        <p>
          We support standard federation protocols to connect with your university Identity Provider (IdP):
        </p>
        <ul>
          <li><strong>SAML 2.0 &amp; OIDC:</strong> Integration with Microsoft Entra ID (Active Directory), Okta, Shibboleth, and custom university OAuth portals.</li>
          <li><strong>Role Mapping:</strong> Automap users to student, teaching assistant (TA), faculty, or administrator privileges based on university database attributes.</li>
        </ul>

        <h2 style={h2Style}>4. Getting Started with Integration</h2>
        <p>
          LMS integration is available for all customers on the **Department License** tier. To schedule an integration workshop with our technical deployment team, please contact us at <a href="mailto:codecanvas@lpu.in" style={{ color: "var(--primary)" }}>codecanvas@lpu.in</a> or fill out the demo request form on the homepage.
        </p>
      </div>
    </div>
  );
}
