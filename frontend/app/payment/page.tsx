"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "premium";
  const school = searchParams.get("school") || "cse";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const price = plan === "pro" ? "₹299" : plan === "premium" ? "₹499" : "₹0";
  const planName = plan === "pro" ? "Pro Plan" : plan === "premium" ? "Institutional Premium" : "Free Plan";

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(value.slice(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiry(value.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvv(value.slice(0, 3));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !name) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Save subscription state
      localStorage.setItem("user_subscription", plan);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#060913",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div className="glass" style={{
          maxWidth: "480px",
          width: "100%",
          borderRadius: "24px",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 0 40px rgba(0, 242, 254, 0.15)",
          border: "1px solid rgba(0, 242, 254, 0.3)"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(0, 230, 118, 0.15)",
            border: "2px solid #00E676",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            color: "#00E676",
            margin: "0 auto 24px",
            boxShadow: "0 0 20px rgba(0, 230, 118, 0.3)"
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 850, marginBottom: 12 }}>Payment Successful!</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: 32 }}>
            Thank you! Your account has been upgraded to <strong>{planName}</strong>. You now have unlimited AI trace explanations, full code history, and priority tutor response.
          </p>
          <button 
            onClick={() => router.push(`/visualize?school=${school}`)}
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "15px" }}
          >
            Go to Visualizer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060913",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "960px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "32px",
        alignItems: "start"
      }} className="responsive-grid">
        {/* Checkout Details */}
        <div className="glass" style={{ padding: "32px", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: 20 }}>Order Summary</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "var(--text-secondary)" }}>{planName}</span>
            <span style={{ fontWeight: 700 }}>{price} / semester</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ color: "var(--text-secondary)" }}>School/College</span>
            <span style={{ textTransform: "uppercase", fontWeight: 600 }}>LPU-{school}</span>
          </div>
          <div className="divider" style={{ margin: "20px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800 }}>
            <span>Total Due</span>
            <span style={{ color: "var(--primary)" }}>{price}</span>
          </div>

          <div style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "12px" }}>
              <span style={{ fontSize: "20px" }}>🛡️</span>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                <strong>Secure Payment Gateway</strong><br/>
                Industry standard 256-bit encryption. Your details are safe with us.
              </div>
            </div>
          </div>
        </div>

        {/* Card Entry Form */}
        <div className="glass" style={{ padding: "32px", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: 24 }}>Payment Information</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Cardholder Name</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Prathamesh Sawarkar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Card Number</label>
              <input 
                type="text" 
                className="input" 
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Expiry Date</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>CVV</label>
                <input 
                  type="password" 
                  className="input" 
                  placeholder="•••"
                  value={cvv}
                  onChange={handleCvvChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "15px", marginTop: "12px" }}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing Security Protocol..." : `Pay ${price}`}
            </button>
          </form>
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#060913" }} />}>
      <PaymentPageContent />
    </Suspense>
  );
}
