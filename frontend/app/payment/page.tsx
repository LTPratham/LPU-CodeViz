"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "pro";
  const school = searchParams.get("school") || "cse";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Prices in INR
  const basePrice = plan === "pro" ? 299 : plan === "premium" ? 499 : 0;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gstAmount;

  const planName = plan === "pro" ? "Pro Student Plan" : plan === "premium" ? "Institutional Premium" : "Free Plan";

  useEffect(() => {
    // Dynamically load Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert("Please fill in all billing details.");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay payment gateway is loading. Please try again in a moment.");
      return;
    }

    setIsProcessing(true);

    const options = {
      key: "rzp_test_demoLPU", // Sandbox key for demo purposes
      amount: totalPrice * 100, // Amount in paise
      currency: "INR",
      name: "CodeCanvas",
      description: `${planName} - Semester Subscription`,
      image: "https://codecanvas-lpu.vercel.app/logo.png",
      prefill: {
        name: name,
        email: email,
        contact: phone,
      },
      theme: {
        color: "#3B82F6",
      },
      handler: function (response: any) {
        setIsProcessing(false);
        setIsSuccess(true);
        // Save subscription state
        localStorage.setItem("user_subscription", JSON.stringify(planName));
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (isSuccess) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          borderRadius: "24px",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          padding: "48px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.12)",
            border: "2px solid var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            color: "var(--success)",
            margin: "0 auto 24px",
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: 12, color: "var(--text)" }}>Payment Successful!</h1>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.6, marginBottom: 32 }}>
            Thank you! Your account has been upgraded to <strong>{planName}</strong>. You now have unlimited AI trace explanations, full code history, and priority tutor response.
          </p>
          <button 
            onClick={() => router.push(`/visualize?school=${school}`)}
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: 700 }}
          >
            Go to Visualizer
          </button>
        </div>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--muted)",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={containerStyle}>
      <div style={{
        maxWidth: "960px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "32px",
        alignItems: "start"
      }}>
        {/* Checkout Details */}
        <div style={{ padding: "32px", borderRadius: "20px", background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>Order Summary</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: "14px" }}>
            <span style={{ color: "var(--muted)" }}>{planName}</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>₹{basePrice}.00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: "14px" }}>
            <span style={{ color: "var(--muted)" }}>GST (18%)</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>₹{gstAmount}.00</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: "14px" }}>
            <span style={{ color: "var(--muted)" }}>School/College</span>
            <span style={{ textTransform: "uppercase", fontWeight: 600, color: "var(--text)" }}>LPU-{school}</span>
          </div>
          <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800 }}>
            <span style={{ color: "var(--text)" }}>Total Due</span>
            <span style={{ color: "var(--primary)" }}>₹{totalPrice}.00</span>
          </div>

          <div style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "var(--surface-2)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "12px" }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--primary-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
                <strong>Secure Payment via Razorpay</strong><br/>
                UPI, Credit/Debit Card, Netbanking, and Wallet payment options supported.
              </div>
            </div>
          </div>
        </div>

        {/* Razorpay Billing Details Form */}
        <div style={{ padding: "32px", borderRadius: "20px", background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>Billing Information</h2>
          <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                style={inputStyle}
                placeholder="Prathamesh Sawarkar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                style={inputStyle}
                placeholder="prathamesh@lpu.co.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number (for UPI/verification)</label>
              <input 
                type="tel" 
                style={inputStyle}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "15px", marginTop: "12px", fontWeight: 700 }}
              disabled={isProcessing || !razorpayLoaded}
            >
              {isProcessing ? "Opening Secure Checkout..." : `Pay ₹${totalPrice}.00`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <PaymentPageContent />
    </Suspense>
  );
}
