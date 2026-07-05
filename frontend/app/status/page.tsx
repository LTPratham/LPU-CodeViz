import React from "react";
import type { Metadata } from "next";
import StatusDashboard from "@/components/StatusDashboard";

export const metadata: Metadata = {
  title: "System Status & SLA Dashboard — CodeCanvas Enterprise",
  description: "Real-time institutional service telemetry, 99.99% uptime SLA guarantees, and incident reports for CodeCanvas B2B infrastructure.",
};

export default function StatusPage() {
  return <StatusDashboard />;
}
