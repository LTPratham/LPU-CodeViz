import Link from "next/link";

export const metadata = {
  title: "Refund Policy — CodeCanvas",
  description: "Refund and cancellation policy for CodeCanvas subscriptions and licenses.",
};

export default function RefundPolicyPage() {
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

        <h1 style={h1Style}>Refund and Cancellation Policy</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>Last Updated: July 2, 2026</p>

        <p>
          Thank you for subscribing to CodeCanvas. We want to ensure that our users (students and departments) have a positive experience while improving their coding capabilities. This page outlines our policy for cancellations, refunds, and plan modifications.
        </p>

        <h2 style={h2Style}>1. Student Pro Subscriptions</h2>
        <p>
          For individual Student Pro subscriptions (₹299/semester):
        </p>
        <ul>
          <li><strong>30-Day Satisfaction Guarantee:</strong> If you are not satisfied with the visualizer or AI tutor, you can request a full refund within 30 days of subscription purchase.</li>
          <li><strong>No Questions Asked:</strong> We will process your refund via Razorpay to the original payment source within 5-7 working days.</li>
          <li><strong>Exclusions:</strong> After the first 30 days of the semester plan, no refunds will be issued for that semester's plan.</li>
        </ul>

        <h2 style={h2Style}>2. Department / Institutional Licenses</h2>
        <p>
          For institutional department licenses (₹20,000/year):
        </p>
        <ul>
          <li><strong>Pilot Program:</strong> We offer a 4-week free pilot program for departments. We encourage institutions to evaluate the platform during this pilot prior to formal purchase orders.</li>
          <li><strong>Cancellations:</strong> Department subscriptions can be cancelled before the start of any academic term.</li>
          <li><strong>Pro-Rata Refunds:</strong> Under special circumstances (such as curriculum restructuring or course cancellations), departments can request a pro-rata refund for unused months, subject to review by our account managers.</li>
        </ul>

        <h2 style={h2Style}>3. How to Request a Refund</h2>
        <p>
          To request a refund or cancellation:
        </p>
        <ol>
          <li>Send an email to <a href="mailto:codecanvas@lpu.in" style={{ color: "var(--primary)" }}>codecanvas@lpu.in</a> from your registered institutional email address.</li>
          <li>Include your Name, Registered Email/Phone, Payment Receipt ID, and date of transaction.</li>
          <li>State the reason for the refund request (optional, but helpful for improving our platform).</li>
        </ol>
        <p>
          Once approved, the refund will be processed and credited to your original payment method (bank account, card, or UPI wallet) within 5 to 7 business days, depending on your bank's processing cycles.
        </p>
      </div>
    </div>
  );
}
