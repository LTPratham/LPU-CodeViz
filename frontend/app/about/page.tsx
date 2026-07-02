import Link from "next/link";

export const metadata = {
  title: "About Us — CodeCanvas",
  description: "Learn more about the team, mission, and technology behind CodeCanvas.",
};

export default function AboutPage() {
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

        <h1 style={h1Style}>About CodeCanvas</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>Empowering students to visualize and master algorithms.</p>

        <h2 style={h2Style}>Our Mission</h2>
        <p>
          At CodeCanvas, our mission is to make learning computer science intuitive, visual, and highly interactive. Traditional coding instruction relies on static code editors and blackboard diagrams. We bridge the gap between syntax and mental models by translating code step-by-step into live visual graphs, memory boards, call stacks, and animations.
        </p>

        <h2 style={h2Style}>Product Origin</h2>
        <p>
          CodeCanvas was born out of a real classroom need at <strong>Lovely Professional University (LPU)</strong>. Built by <strong>Prathamesh Sawarkar</strong>, a student who observed peers struggling with complex concepts like pointer manipulation in C, tree traversal in Java, and query layouts in SQL.
        </p>
        <p>
          By aligning our sandbox templates with LPU CSE course curriculums (CSE101, INT101, CSE205, INT301, CSE202), CodeCanvas provides immediate, contextual guidance that matches what students are learning in labs.
        </p>

        <h2 style={h2Style}>The Team</h2>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 24, padding: "20px", background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white" }}>
            PS
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Prathamesh Sawarkar</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Founder &amp; Lead Creator</div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
              Full-stack developer and student passionate about education technology. Building CodeCanvas to democratize algorithm visualization for computer science learners globally.
            </p>
          </div>
        </div>

        <h2 style={h2Style}>Technology Stack</h2>
        <p>
          CodeCanvas leverages modern web technologies to achieve fast, client-side code execution:
        </p>
        <ul>
          <li><strong>Frontend Framework:</strong> Next.js 16 (App Router), React 19, TypeScript.</li>
          <li><strong>Database and Auth:</strong> Supabase (PostgreSQL with Row Level Security).</li>
          <li><strong>Interactive Visualization:</strong> Framer Motion, @xyflow/react, custom HTML5 Canvas overlays.</li>
          <li><strong>Local Simulation:</strong> Pyodide (Python WebAssembly execution engine) to safely trace and analyze student scripts in-browser without server latency.</li>
        </ul>

        <h2 style={h2Style}>Contact Us</h2>
        <p>
          We are actively looking for pilot partners, feedback, and collaboration. Get in touch:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:codecanvas@lpu.in" style={{ color: "var(--primary)" }}>codecanvas@lpu.in</a></li>
          <li><strong>University:</strong> CSE Department, Lovely Professional University, Phagwara, Punjab, India</li>
        </ul>
      </div>
    </div>
  );
}
