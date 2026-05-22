"use client";
import { useMemo } from "react";
import type { TraceStep } from "@/lib/types";

interface Props {
  steps: TraceStep[];
  currentStepIdx: number;
}

export default function ComplexityProfiler({ steps, currentStepIdx }: Props) {
  // 1. Calculate time and space metrics for each step
  const data = useMemo(() => {
    if (!steps || steps.length === 0) return [];

    let cumulativeOps = 0;
    return steps.map((step, idx) => {
      // Time complexity proxy: weight operations based on action type
      let opCost = 1;
      if (step.action === "compare") opCost = 1;
      else if (step.action === "swap") opCost = 2; // Swap is typically 3 assignments
      cumulativeOps += opCost;

      // Space complexity proxy: count elements in data structure and active variables
      let spaceCost = 0;
      const state = step.state;
      if (state) {
        switch (state.type) {
          case "array":
            spaceCost = Array.isArray(state.elements) ? state.elements.length : 0;
            break;
          case "stack":
            spaceCost = Array.isArray(state.elements) ? state.elements.length : 0;
            break;
          case "queue":
            spaceCost = Array.isArray(state.elements) ? state.elements.length : 0;
            break;
          case "linkedlist":
            spaceCost = Array.isArray(state.nodes) ? state.nodes.length : 0;
            break;
          case "binarytree":
            spaceCost = Array.isArray(state.nodes) ? state.nodes.length : 0;
            break;
          case "recursion":
            spaceCost = Array.isArray(state.frames) ? state.frames.length : 0;
            break;
          case "sqltable":
            spaceCost = Array.isArray(state.rows) ? state.rows.length : 0;
            break;
          case "graph":
            spaceCost = (Array.isArray(state.nodes) ? state.nodes.length : 0) + (Array.isArray(state.edges) ? state.edges.length : 0);
            break;
          case "variables":
            spaceCost = Array.isArray(state.variables) ? state.variables.length : 0;
            break;
        }
      }

      // Add active variables count
      const varCount = step.variables ? Object.keys(step.variables).length : 0;
      const totalSpace = spaceCost + varCount;

      return {
        stepNum: idx + 1,
        time: cumulativeOps,
        space: totalSpace,
        description: step.description,
      };
    });
  }, [steps]);

  // SVG parameters
  const width = 560;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute scale boundaries
  const scales = useMemo(() => {
    if (data.length === 0) return { maxTime: 1, maxSpace: 1 };
    const times = data.map((d) => d.time);
    const spaces = data.map((d) => d.space);
    return {
      maxTime: Math.max(...times, 1),
      maxSpace: Math.max(...spaces, 1),
    };
  }, [data]);

  // Points conversion helper
  const points = useMemo(() => {
    if (data.length === 0) return { timePath: "", spacePath: "", timePoints: [], spacePoints: [] };

    const getX = (index: number) => {
      if (data.length <= 1) return paddingLeft + chartWidth / 2;
      return paddingLeft + (index / (data.length - 1)) * chartWidth;
    };

    const getYTime = (val: number) => {
      return paddingTop + chartHeight - (val / scales.maxTime) * chartHeight;
    };

    const getYSpace = (val: number) => {
      return paddingTop + chartHeight - (val / scales.maxSpace) * chartHeight;
    };

    const timePoints = data.map((d, i) => ({ x: getX(i), y: getYTime(d.time), val: d.time }));
    const spacePoints = data.map((d, i) => ({ x: getX(i), y: getYSpace(d.space), val: d.space }));

    const timePath = timePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const spacePath = spacePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return {
      timePath,
      spacePath,
      timePoints,
      spacePoints,
    };
  }, [data, scales, chartWidth, chartHeight]);

  if (!steps || steps.length === 0) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>
        No complexity trace data available.
      </div>
    );
  }

  const activeData = data[currentStepIdx] || { time: 0, space: 0, stepNum: 0 };
  const activeTimePoint = points.timePoints[currentStepIdx];
  const activeSpacePoint = points.spacePoints[currentStepIdx];

  // Gridlines coordinate calculations
  const gridLinesY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ width: "100%", height: "100%", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Execution Complexity Profiler</h4>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>Dynamically tracking resource consumption curves</p>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "linear-gradient(to right, #F59E0B, #D97706)" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Time (Ops): <span style={{ color: "#F59E0B" }}>{activeData.time}</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "linear-gradient(to right, #06B6D4, #0891B2)" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Space (Units): <span style={{ color: "#06B6D4" }}>{activeData.space}</span></span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Time Graph */}
        <div style={{ background: "rgba(17,24,39,0.3)", borderRadius: 10, border: "1px solid var(--border)", padding: "12px 8px 8px", position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#F59E0B", letterSpacing: "0.05em", marginBottom: 6, paddingLeft: 6 }}>
            Time Complexity Curve (Cumulative Operations)
          </div>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Grid lines */}
            {gridLinesY.map((ratio, idx) => {
              const y = paddingTop + ratio * chartHeight;
              const val = Math.round(scales.maxTime * (1 - ratio));
              return (
                <g key={`grid-time-${idx}`}>
                  <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <text x={paddingLeft - 8} y={y} fill="var(--text-muted)" fontSize={9} textAnchor="end" dominantBaseline="middle">{val}</text>
                </g>
              );
            })}

            {/* Time Path */}
            <path
              d={points.timePath}
              fill="none"
              stroke="url(#time-gradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="time-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>

            {/* Step markers along the X axis */}
            {data.length > 1 && [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const dataIdx = Math.min(data.length - 1, Math.round(ratio * (data.length - 1)));
              const x = paddingLeft + ratio * chartWidth;
              return (
                <text key={`step-lbl-${idx}`} x={x} y={height - 6} fill="var(--text-muted)" fontSize={9} textAnchor="middle">
                  S{data[dataIdx].stepNum}
                </text>
              );
            })}

            {/* Current Step Vertical Guideline */}
            {activeTimePoint && (
              <g>
                <line
                  x1={activeTimePoint.x}
                  y1={paddingTop}
                  x2={activeTimePoint.x}
                  y2={paddingTop + chartHeight}
                  stroke="#F59E0B"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.7}
                />
                <circle
                  cx={activeTimePoint.x}
                  cy={activeTimePoint.y}
                  r={5}
                  fill="#F59E0B"
                  stroke="var(--bg)"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 0 4px #F59E0B)" }}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Space Graph */}
        <div style={{ background: "rgba(17,24,39,0.3)", borderRadius: 10, border: "1px solid var(--border)", padding: "12px 8px 8px", position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#06B6D4", letterSpacing: "0.05em", marginBottom: 6, paddingLeft: 6 }}>
            Space Complexity Curve (Active Elements in Memory)
          </div>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Grid lines */}
            {gridLinesY.map((ratio, idx) => {
              const y = paddingTop + ratio * chartHeight;
              const val = Math.round(scales.maxSpace * (1 - ratio));
              return (
                <g key={`grid-space-${idx}`}>
                  <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <text x={paddingLeft - 8} y={y} fill="var(--text-muted)" fontSize={9} textAnchor="end" dominantBaseline="middle">{val}</text>
                </g>
              );
            })}

            {/* Space Path */}
            <path
              d={points.spacePath}
              fill="none"
              stroke="url(#space-gradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="space-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {/* Step markers along the X axis */}
            {data.length > 1 && [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const dataIdx = Math.min(data.length - 1, Math.round(ratio * (data.length - 1)));
              const x = paddingLeft + ratio * chartWidth;
              return (
                <text key={`step-lbl-space-${idx}`} x={x} y={height - 6} fill="var(--text-muted)" fontSize={9} textAnchor="middle">
                  S{data[dataIdx].stepNum}
                </text>
              );
            })}

            {/* Current Step Vertical Guideline */}
            {activeSpacePoint && (
              <g>
                <line
                  x1={activeSpacePoint.x}
                  y1={paddingTop}
                  x2={activeSpacePoint.x}
                  y2={paddingTop + chartHeight}
                  stroke="#06B6D4"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.7}
                />
                <circle
                  cx={activeSpacePoint.x}
                  cy={activeSpacePoint.y}
                  r={5}
                  fill="#06B6D4"
                  stroke="var(--bg)"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 0 4px #06B6D4)" }}
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
