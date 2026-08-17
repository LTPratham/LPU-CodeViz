"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      >
        <Image
          src="/loader.jpeg"
          alt="Loading CodeCanvas..."
          width={400}
          height={400}
          style={{ 
            objectFit: "contain",
            borderRadius: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}
          priority
        />
        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .7;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
