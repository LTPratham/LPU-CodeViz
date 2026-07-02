import Link from "next/link";

export const metadata = {
  title: "Terms of Service — CodeCanvas",
  description: "Terms and conditions governing the use of the CodeCanvas SaaS platform.",
};

export default function TermsPage() {
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

        <h1 style={h1Style}>Terms of Service</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>Last Updated: July 2, 2026</p>

        <p>
          Welcome to CodeCanvas. Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the CodeCanvas platform, website, and related services (collectively, the &ldquo;Service&rdquo;). By accessing or using the Service, you agree to be bound by these Terms.
        </p>

        <h2 style={h2Style}>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using the Service, you represent that you are at least 18 years of age (or have the consent of a parent or legal guardian) and possess the legal authority to enter into this agreement. If you are using the Service on behalf of a university or department, you agree to these Terms on behalf of that institution.
        </p>

        <h2 style={h2Style}>2. Account Registration and Security</h2>
        <p>
          To access certain features of the Service (such as dashboards, classes, and certificates), you must register for an account using a valid email, phone number, or third-party authentication (Google). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>

        <h2 style={h2Style}>3. Subscription Fees and Payment</h2>
        <p>
          We offer standard sandbox access for free, and upgraded Pro and Department plans. All paid plans are billed on a semester-based or annual subscription model via our payment processor, Razorpay.
        </p>
        <ul>
          <li><strong>Billing:</strong> Fees are billed in advance and are non-refundable except as provided in our Refund Policy.</li>
          <li><strong>GST:</strong> Institutional department licenses are subject to 18% Goods and Services Tax (GST) in India. GST invoices will be generated and sent automatically.</li>
          <li><strong>Price Changes:</strong> We reserve the right to modify subscription fees with at least 30 days notice to active subscribers.</li>
        </ul>

        <h2 style={h2Style}>4. Intellectual Property Rights</h2>
        <p>
          The Service, including its user interface, code visualizer structures, proprietary algorithms, logo, and design, is the intellectual property of CodeCanvas and its creators. You are granted a limited, non-exclusive, non-transferable license to access the Service for personal or educational purposes. You may not copy, reverse-engineer, modify, or distribute any part of the Service without explicit permission.
        </p>

        <h2 style={h2Style}>5. User Content and Code Submissions</h2>
        <p>
          You retain all rights to any source code, documentation, and inputs you submit to the Service. By submitting content, you grant CodeCanvas a limited, worldwide license to run, parse, compile, and visualize your code solely for the purpose of providing the visualization and AI tutoring features to you.
        </p>

        <h2 style={h2Style}>6. Prohibited Activities</h2>
        <p>
          You agree not to use the Service to:
        </p>
        <ul>
          <li>Upload malicious code, viruses, or security exploits.</li>
          <li>Circumvent rate limits, sandbox safety blocks, or subscription features.</li>
          <li>Use automated scrapers, bots, or scripts to access the Service without authorization.</li>
          <li>Transmit offensive, harassing, or illegal content via classroom assignments or chats.</li>
        </ul>

        <h2 style={h2Style}>7. Limitation of Liability</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. CodeCanvas does not guarantee that the Service will be uninterrupted, error-free, or 100% accurate. In no event shall CodeCanvas or its creators be liable for any indirect, incidental, or consequential damages resulting from the use of the Service.
        </p>

        <h2 style={h2Style}>8. Governing Law and Jurisdiction</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any legal actions or disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Jalandhar, Punjab, India.
        </p>

        <h2 style={h2Style}>9. Changes to Terms</h2>
        <p>
          We reserve the right to update or modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on the website and modifying the Last Updated date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
        </p>
      </div>
    </div>
  );
}
