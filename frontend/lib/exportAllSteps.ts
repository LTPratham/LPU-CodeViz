/**
 * exportAllSteps.ts
 * Generates a single SVG file that shows every trace step stacked vertically,
 * each as a self-contained frame with: step number, description, code, and
 * a data-structure diagram (arrays, stacks, queues, trees, graphs, variables, etc.)
 */

import type { TraceStep, VisualizationState } from "./types";

// ─── colour palette (dark theme) ──────────────────────────────────────────────
const BG        = "#0F172A";
const CARD      = "#1E293B";
const BORDER    = "#334155";
const TEXT      = "#E2E8F0";
const MUTED     = "#64748B";
const PRIMARY   = "#1D9E75";
const ACCENT    = "#3B82F6";
const WARN      = "#F59E0B";
const DANGER    = "#EF4444";
const MONO      = "\"Fira Mono\", \"Consolas\", monospace";
const SANS      = "\"Inter\", system-ui, sans-serif";

const FRAME_W   = 900;
const PAD       = 24;
const HEADER_H  = 56;          // step-number + description bar
const CODE_H    = 30;          // code snippet bar
const VIZ_H     = 220;         // diagram area
const FRAME_H   = HEADER_H + CODE_H + VIZ_H + PAD * 3;
const GAP       = 20;

// ─── escape XML special chars ──────────────────────────────────────────────────
function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── truncate long text ────────────────────────────────────────────────────────
function trunc(s: string, maxLen: number): string {
  const str = String(s ?? "");
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

// ─── Status colour for elements ───────────────────────────────────────────────
function statusColor(status: string): string {
  switch (status) {
    case "active":       return PRIMARY;
    case "comparing":
    case "visiting":     return WARN;
    case "sorted":
    case "visited":      return ACCENT;
    case "swapping":
    case "pivot":        return DANGER;
    case "inserting":    return "#A78BFA";
    case "deleting":     return DANGER;
    case "enqueuing":    return "#22C55E";
    case "dequeuing":    return DANGER;
    case "updated":      return WARN;
    case "returning":    return "#F97316";
    case "shortest_path": return "#22C55E";
    case "highlighted":  return WARN;
    default:             return BORDER;
  }
}

// ─── ARRAY / SORTING diagram ───────────────────────────────────────────────────
function drawArray(state: VisualizationState, y0: number): string {
  if (state.type !== "array") return "";
  const els = Array.isArray(state.elements) ? state.elements : [];
  const cellW = Math.min(60, (FRAME_W - PAD * 2) / Math.max(els.length, 1));
  const cellH = 44;
  const startX = PAD + (FRAME_W - PAD * 2 - cellW * els.length) / 2;
  const cy = y0 + VIZ_H / 2 - cellH / 2;

  let out = "";
  els.forEach((el, i) => {
    const x = startX + i * cellW;
    const fill = statusColor(el.status ?? "default");
    out += `<rect x="${x}" y="${cy}" width="${cellW - 2}" height="${cellH}" rx="4" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`;
    out += `<text x="${x + cellW / 2 - 1}" y="${cy + cellH / 2 + 5}" font-family=${MONO} font-size="13" fill="${TEXT}" text-anchor="middle">${esc(String(el.value ?? ""))}</text>`;
    out += `<text x="${x + cellW / 2 - 1}" y="${cy + cellH + 14}" font-family=${MONO} font-size="9" fill="${MUTED}" text-anchor="middle">[${el.index}]</text>`;
  });
  return out;
}

// ─── STACK diagram ─────────────────────────────────────────────────────────────
function drawStack(state: VisualizationState, y0: number): string {
  if (state.type !== "stack") return "";
  const els = Array.isArray(state.elements) ? [...state.elements].reverse() : [];
  const cellW = 140; const cellH = 34;
  const startX = FRAME_W / 2 - cellW / 2;
  let out = "";
  els.forEach((el, i) => {
    const x = startX;
    const y = y0 + 10 + i * (cellH + 3);
    if (y + cellH > y0 + VIZ_H - 10) return;
    const fill = statusColor(el.status ?? "default");
    out += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`;
    out += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 5}" font-family=${MONO} font-size="12" fill="${TEXT}" text-anchor="middle">${esc(String(el.value ?? ""))}</text>`;
    if (i === 0) out += `<text x="${x + cellW + 6}" y="${y + cellH / 2 + 5}" font-family=${MONO} font-size="9" fill="${PRIMARY}" text-anchor="start">← top</text>`;
  });
  return out;
}

// ─── QUEUE diagram ─────────────────────────────────────────────────────────────
function drawQueue(state: VisualizationState, y0: number): string {
  if (state.type !== "queue") return "";
  const els = Array.isArray(state.elements) ? state.elements : [];
  const cellW = Math.min(90, (FRAME_W - PAD * 4) / Math.max(els.length, 1));
  const cellH = 44;
  const startX = PAD * 2;
  const cy = y0 + VIZ_H / 2 - cellH / 2;
  let out = "";
  els.forEach((el, i) => {
    const x = startX + i * (cellW + 3);
    const fill = statusColor(el.status ?? "default");
    out += `<rect x="${x}" y="${cy}" width="${cellW}" height="${cellH}" rx="4" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`;
    out += `<text x="${x + cellW / 2}" y="${cy + cellH / 2 + 5}" font-family=${MONO} font-size="12" fill="${TEXT}" text-anchor="middle">${esc(String(el.value ?? ""))}</text>`;
  });
  if (els.length > 0) {
    out += `<text x="${startX}" y="${cy - 8}" font-family=${SANS} font-size="9" fill="${WARN}">FRONT</text>`;
    const lastX = startX + (els.length - 1) * (cellW + 3);
    out += `<text x="${lastX + cellW}" y="${cy - 8}" font-family=${SANS} font-size="9" fill="${PRIMARY}" text-anchor="end">REAR</text>`;
  }
  return out;
}

// ─── LINKED LIST diagram ───────────────────────────────────────────────────────
function drawLinkedList(state: VisualizationState, y0: number): string {
  if (state.type !== "linkedlist") return "";
  const nodes = Array.isArray(state.nodes) ? state.nodes : [];
  const nodeW = 70; const nodeH = 36; const arrowW = 24;
  const total = nodes.length * nodeW + (nodes.length - 1) * arrowW;
  let startX = FRAME_W / 2 - total / 2;
  const cy = y0 + VIZ_H / 2 - nodeH / 2;
  let out = "";
  nodes.forEach((nd, i) => {
    const x = startX + i * (nodeW + arrowW);
    const fill = statusColor(nd.status ?? "default");
    out += `<rect x="${x}" y="${cy}" width="${nodeW}" height="${nodeH}" rx="4" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`;
    out += `<text x="${x + nodeW / 2}" y="${cy + nodeH / 2 + 5}" font-family=${MONO} font-size="11" fill="${TEXT}" text-anchor="middle">${esc(String(nd.value ?? ""))}</text>`;
    if (i < nodes.length - 1) {
      const ax = x + nodeW;
      const ay = cy + nodeH / 2;
      out += `<line x1="${ax}" y1="${ay}" x2="${ax + arrowW - 4}" y2="${ay}" stroke="${MUTED}" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    } else {
      out += `<text x="${x + nodeW + 4}" y="${cy + nodeH / 2 + 5}" font-family=${MONO} font-size="9" fill="${MUTED}">null</text>`;
    }
  });
  return out;
}

// ─── BINARY TREE diagram ───────────────────────────────────────────────────────
function drawTree(state: VisualizationState, y0: number): string {
  if (state.type !== "binarytree") return "";
  const nodes = Array.isArray(state.nodes) ? state.nodes : [];
  if (nodes.length === 0) return "";

  // Build adjacency for layout
  const map: Record<string, typeof nodes[0]> = {};
  nodes.forEach(n => { map[n.id] = n; });

  // BFS-based level layout
  const levels: string[][] = [];
  const root = nodes[0];
  const queue: [string, number][] = [[root.id, 0]];
  const visited = new Set<string>();
  while (queue.length) {
    const [id, lvl] = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (!levels[lvl]) levels[lvl] = [];
    levels[lvl].push(id);
    const nd = map[id];
    if (nd?.left && map[nd.left])  queue.push([nd.left,  lvl + 1]);
    if (nd?.right && map[nd.right]) queue.push([nd.right, lvl + 1]);
  }

  const r = 18;
  const levelH = 52;
  const out_parts: string[] = [];
  const positions: Record<string, { x: number; y: number }> = {};

  levels.forEach((ids, lvl) => {
    const slotW = (FRAME_W - PAD * 2) / ids.length;
    ids.forEach((id, i) => {
      const x = PAD + slotW * i + slotW / 2;
      const y = y0 + 20 + lvl * levelH + r;
      if (y + r > y0 + VIZ_H - 10) return;
      positions[id] = { x, y };
      const nd = map[id];
      const fill = statusColor(nd?.status ?? "default");
      // draw edge to parent first (will be overdrawn by circle)
      const parentId = nodes.find(n => n.left === id || n.right === id)?.id;
      if (parentId && positions[parentId]) {
        const p = positions[parentId];
        out_parts.push(`<line x1="${p.x}" y1="${p.y}" x2="${x}" y2="${y}" stroke="${BORDER}" stroke-width="1.5"/>`);
      }
      out_parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`);
      out_parts.push(`<text x="${x}" y="${y + 5}" font-family=${MONO} font-size="11" fill="${TEXT}" text-anchor="middle">${esc(String(nd?.value ?? ""))}</text>`);
    });
  });

  return out_parts.join("");
}

// ─── RECURSION diagram ─────────────────────────────────────────────────────────
function drawRecursion(state: VisualizationState, y0: number): string {
  if (state.type !== "recursion") return "";
  const frames = Array.isArray(state.frames) ? state.frames : [];
  const fW = Math.min(200, (FRAME_W - PAD * 2) / Math.max(frames.length, 1));
  const fH = 50;
  const startX = FRAME_W / 2 - (frames.length * fW) / 2;
  const cy = y0 + VIZ_H / 2 - fH / 2;
  let out = "";
  frames.forEach((fr, i) => {
    const x = startX + i * fW;
    const fill = statusColor(fr.status ?? "default");
    out += `<rect x="${x + 2}" y="${cy}" width="${fW - 4}" height="${fH}" rx="4" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`;
    out += `<text x="${x + fW / 2}" y="${cy + 16}" font-family=${MONO} font-size="10" fill="${PRIMARY}" text-anchor="middle">${esc(fr.funcName ?? "")}</text>`;
    const argsStr = Object.entries(fr.args ?? {}).map(([k, v]) => `${k}=${v}`).join(", ");
    out += `<text x="${x + fW / 2}" y="${cy + 30}" font-family=${MONO} font-size="9" fill="${TEXT}" text-anchor="middle">${esc(trunc(argsStr, 20))}</text>`;
    if (fr.returnValue !== undefined) {
      out += `<text x="${x + fW / 2}" y="${cy + 44}" font-family=${MONO} font-size="9" fill="${WARN}" text-anchor="middle">→ ${esc(String(fr.returnValue))}</text>`;
    }
  });
  return out;
}

// ─── SQL TABLE diagram ─────────────────────────────────────────────────────────
function drawSQL(state: VisualizationState, y0: number): string {
  if (state.type !== "sqltable") return "";
  const cols = Array.isArray(state.columns) ? state.columns : [];
  const rows = Array.isArray(state.rows) ? state.rows : [];
  const cellW = Math.min(120, (FRAME_W - PAD * 2) / Math.max(cols.length, 1));
  const cellH = 22;
  const startX = FRAME_W / 2 - (cols.length * cellW) / 2;
  const headerY = y0 + 10;
  let out = "";
  // header
  cols.forEach((col, i) => {
    const x = startX + i * cellW;
    out += `<rect x="${x}" y="${headerY}" width="${cellW - 2}" height="${cellH}" rx="2" fill="${ACCENT}33" stroke="${ACCENT}" stroke-width="1"/>`;
    out += `<text x="${x + cellW / 2}" y="${headerY + 15}" font-family=${MONO} font-size="10" fill="${ACCENT}" text-anchor="middle" font-weight="bold">${esc(String(col))}</text>`;
  });
  // rows
  rows.slice(0, 6).forEach((row, ri) => {
    const y = headerY + (ri + 1) * (cellH + 2);
    if (y + cellH > y0 + VIZ_H - 4) return;
    const fill = statusColor(row.status ?? "default");
    (row.values ?? []).forEach((val, ci) => {
      const x = startX + ci * cellW;
      out += `<rect x="${x}" y="${y}" width="${cellW - 2}" height="${cellH}" rx="2" fill="${fill}22" stroke="${fill}66" stroke-width="1"/>`;
      out += `<text x="${x + cellW / 2}" y="${y + 15}" font-family=${MONO} font-size="9" fill="${TEXT}" text-anchor="middle">${esc(String(val ?? ""))}</text>`;
    });
  });
  return out;
}

// ─── VARIABLES diagram ─────────────────────────────────────────────────────────
function drawVariables(state: VisualizationState, y0: number): string {
  if (state.type !== "variables") return "";
  const vars = Array.isArray(state.variables) ? state.variables : [];
  const colW = 180; const rowH = 28;
  const cols = Math.floor((FRAME_W - PAD * 2) / colW);
  let out = "";
  vars.slice(0, 18).forEach((v, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAD + col * colW;
    const y = y0 + 14 + row * (rowH + 4);
    if (y + rowH > y0 + VIZ_H - 4) return;
    const fill = statusColor(v.status ?? "default");
    out += `<rect x="${x}" y="${y}" width="${colW - 8}" height="${rowH}" rx="4" fill="${fill}22" stroke="${fill}66" stroke-width="1"/>`;
    out += `<text x="${x + 8}" y="${y + 18}" font-family=${MONO} font-size="10" fill="${PRIMARY}">${esc(v.name ?? "")}</text>`;
    out += `<text x="${x + 8 + (v.name?.length ?? 4) * 7 + 4}" y="${y + 18}" font-family=${MONO} font-size="10" fill="${MUTED}"> = </text>`;
    out += `<text x="${x + 8 + (v.name?.length ?? 4) * 7 + 24}" y="${y + 18}" font-family=${MONO} font-size="10" fill="${TEXT}">${esc(trunc(String(v.value ?? ""), 18))}</text>`;
  });
  if (Array.isArray(state.output) && state.output.length > 0) {
    const oy = y0 + VIZ_H - 22;
    out += `<text x="${PAD}" y="${oy}" font-family=${MONO} font-size="9" fill="${WARN}">Output: ${esc(state.output.join("  "))}</text>`;
  }
  return out;
}

// ─── GRAPH diagram ─────────────────────────────────────────────────────────────
function drawGraph(state: VisualizationState, y0: number): string {
  if (state.type !== "graph") return "";
  const gnodes = Array.isArray(state.nodes) ? state.nodes : [];
  const edges  = Array.isArray(state.edges)  ? state.edges  : [];
  const r = 20;
  const cx = FRAME_W / 2;
  const cy = y0 + VIZ_H / 2;
  const radius = Math.min(VIZ_H / 2 - r - 10, 80);

  const posMap: Record<string, { x: number; y: number }> = {};
  gnodes.forEach((nd, i) => {
    const angle = (2 * Math.PI * i) / Math.max(gnodes.length, 1) - Math.PI / 2;
    posMap[nd.id] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  let out = "";
  edges.forEach(e => {
    const a = posMap[e.from]; const b = posMap[e.to];
    if (!a || !b) return;
    const fill = statusColor(e.status ?? "default");
    out += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${fill}" stroke-width="1.5" ${state.directed ? `marker-end="url(#arrow)"` : ""}/>`;
    if (e.weight !== undefined) {
      const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2;
      out += `<text x="${mx}" y="${my - 4}" font-family=${MONO} font-size="9" fill="${MUTED}" text-anchor="middle">${esc(String(e.weight))}</text>`;
    }
  });
  gnodes.forEach(nd => {
    const p = posMap[nd.id]; if (!p) return;
    const fill = statusColor(nd.status ?? "default");
    out += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}33" stroke="${fill}" stroke-width="1.5"/>`;
    out += `<text x="${p.x}" y="${p.y + 5}" font-family=${MONO} font-size="11" fill="${TEXT}" text-anchor="middle">${esc(String(nd.value ?? ""))}</text>`;
  });
  return out;
}

// ─── Route to correct diagram function ────────────────────────────────────────
function drawDiagram(state: VisualizationState, y0: number): string {
  if (!state) return `<text x="${PAD}" y="${y0 + VIZ_H / 2}" font-family=${SANS} font-size="12" fill="${MUTED}">No state data</text>`;
  switch (state.type) {
    case "array":      return drawArray(state, y0);
    case "stack":      return drawStack(state, y0);
    case "queue":      return drawQueue(state, y0);
    case "linkedlist": return drawLinkedList(state, y0);
    case "binarytree": return drawTree(state, y0);
    case "recursion":  return drawRecursion(state, y0);
    case "sqltable":   return drawSQL(state, y0);
    case "variables":  return drawVariables(state, y0);
    case "graph":      return drawGraph(state, y0);
    default:           return `<text x="${PAD}" y="${y0 + VIZ_H / 2}" font-family=${SANS} font-size="12" fill="${MUTED}">State type: ${esc((state as any).type)}</text>`;
  }
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function exportAllStepsAsSVG(
  steps: TraceStep[],
  dataStructure: string,
  code?: string,
  language?: string
): void {
  if (!steps || steps.length === 0) {
    alert("No execution steps to export.");
    return;
  }

  const totalH = steps.length * (FRAME_H + GAP) + GAP + 80; // +80 for title bar

  const defs = `
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="${MUTED}"/>
      </marker>
    </defs>`;

  // ── Title bar ──
  const titleText = esc(`${language?.toUpperCase() ?? "CODE"} Execution Trace — ${dataStructure} — ${steps.length} steps`);
  let titleBar = `
    <rect x="0" y="0" width="${FRAME_W}" height="64" fill="${CARD}"/>
    <text x="${PAD}" y="26" font-family=${SANS} font-size="16" font-weight="bold" fill="${TEXT}">${titleText}</text>`;
  if (code) {
    const firstLine = esc(trunc(code.split("\n")[0] ?? "", 80));
    titleBar += `<text x="${PAD}" y="50" font-family=${MONO} font-size="10" fill="${MUTED}">${firstLine}</text>`;
  }
  titleBar += `<line x1="0" y1="64" x2="${FRAME_W}" y2="64" stroke="${BORDER}" stroke-width="1"/>`;

  // ── Step frames ──
  let frames = "";
  steps.forEach((step, idx) => {
    const fy = 80 + idx * (FRAME_H + GAP);

    // Frame card background
    frames += `<rect x="${PAD / 2}" y="${fy}" width="${FRAME_W - PAD}" height="${FRAME_H}" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>`;

    // Step header strip
    const stepColor = PRIMARY;
    frames += `<rect x="${PAD / 2}" y="${fy}" width="${FRAME_W - PAD}" height="${HEADER_H}" rx="8" fill="${stepColor}18"/>`;
    frames += `<rect x="${PAD / 2}" y="${fy + HEADER_H - 4}" width="${FRAME_W - PAD}" height="4" fill="${stepColor}18"/>`;

    // Step number badge
    frames += `<rect x="${PAD}" y="${fy + 12}" width="54" height="22" rx="4" fill="${stepColor}33" stroke="${stepColor}" stroke-width="1"/>`;
    frames += `<text x="${PAD + 27}" y="${fy + 27}" font-family=${MONO} font-size="10" font-weight="bold" fill="${stepColor}" text-anchor="middle">STEP ${step.stepNum}</text>`;

    // Line badge
    frames += `<text x="${PAD + 62}" y="${fy + 27}" font-family=${MONO} font-size="10" fill="${MUTED}">Line ${step.line}</text>`;

    // Action badge
    const actionColor = ACCENT;
    frames += `<rect x="${FRAME_W - PAD - 80}" y="${fy + 12}" width="70" height="22" rx="4" fill="${actionColor}22" stroke="${actionColor}55" stroke-width="1"/>`;
    frames += `<text x="${FRAME_W - PAD - 45}" y="${fy + 27}" font-family=${MONO} font-size="9" fill="${actionColor}" text-anchor="middle">${esc(step.action ?? "")}</text>`;

    // Description
    const desc = typeof step.description === "string" ? step.description : JSON.stringify(step.description ?? "");
    frames += `<text x="${PAD}" y="${fy + HEADER_H - 10}" font-family=${SANS} font-size="11" fill="${TEXT}">${esc(trunc(desc, 100))}</text>`;

    // Code snippet bar
    const codeY = fy + HEADER_H + 6;
    frames += `<rect x="${PAD}" y="${codeY}" width="${FRAME_W - PAD * 2}" height="${CODE_H - 4}" rx="4" fill="#000000AA"/>`;
    frames += `<text x="${PAD + 8}" y="${codeY + 18}" font-family=${MONO} font-size="11" fill="${PRIMARY}">${esc(trunc(step.code ?? "", 110))}</text>`;

    // Variables quick bar (top right of frame)
    const varY = codeY + CODE_H;
    const vars = step.variables ?? {};
    const varEntries = Object.entries(vars).slice(0, 6);
    let varX = PAD;
    varEntries.forEach(([k, v]) => {
      const label = `${k} = ${trunc(String(v ?? ""), 10)}`;
      const bw = label.length * 6.5 + 16;
      if (varX + bw > FRAME_W - PAD) return;
      frames += `<rect x="${varX}" y="${varY + 3}" width="${bw}" height="18" rx="3" fill="${ACCENT}18" stroke="${ACCENT}33" stroke-width="1"/>`;
      frames += `<text x="${varX + 8}" y="${varY + 15}" font-family=${MONO} font-size="9" fill="${ACCENT}">${esc(label)}</text>`;
      varX += bw + 6;
    });

    // Diagram area
    const diagY = fy + HEADER_H + CODE_H + PAD;
    frames += drawDiagram(step.state as VisualizationState, diagY);
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${FRAME_W}"
     height="${totalH}"
     viewBox="0 0 ${FRAME_W} ${totalH}">
  ${defs}
  <!-- Background -->
  <rect width="${FRAME_W}" height="${totalH}" fill="${BG}"/>
  ${titleBar}
  ${frames}
</svg>`;

  try {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `codeviz_${dataStructure}_all_${steps.length}_steps.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to export SVG:", err);
    alert("Export failed. Check the browser console for details.");
  }
}
