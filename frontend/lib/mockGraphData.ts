// Mock graph data for the workspace demo
// Represents a realistic Next.js project dependency graph

export interface GraphNode {
  id: string;
  type: "page" | "component" | "hook" | "service" | "util" | "config";
  label: string;
  path: string;
  linesOfCode: number;
  complexity: number; // 1-10
  imports: string[];  // node ids this node imports
  exports: string[];  // what it exports
  isDeadCode?: boolean;
  hasCycle?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "import" | "export" | "dependency";
}

export const MOCK_NODES: GraphNode[] = [
  // Pages
  {
    id: "page-home",
    type: "page",
    label: "page.tsx",
    path: "app/page.tsx",
    linesOfCode: 284,
    complexity: 6,
    imports: ["comp-navbar", "comp-hero", "comp-features", "comp-footer"],
    exports: ["default: HomePage"],
  },
  {
    id: "page-visualize",
    type: "page",
    label: "visualize/page.tsx",
    path: "app/visualize/page.tsx",
    linesOfCode: 985,
    complexity: 9,
    imports: ["comp-code-editor", "comp-visual-canvas", "comp-explain-sidebar", "comp-step-controller", "hook-auth", "svc-api", "util-types"],
    exports: ["default: VisualizePage"],
  },
  {
    id: "page-workspace",
    type: "page",
    label: "workspace/page.tsx",
    path: "app/workspace/page.tsx",
    linesOfCode: 142,
    complexity: 5,
    imports: ["comp-toolbar", "comp-left-panel", "comp-graph-canvas", "comp-right-panel", "comp-statusbar", "lib-mockdata"],
    exports: ["default: WorkspacePage"],
  },
  {
    id: "page-login",
    type: "page",
    label: "login/page.tsx",
    path: "app/login/page.tsx",
    linesOfCode: 186,
    complexity: 4,
    imports: ["svc-supabase", "util-types"],
    exports: ["default: LoginPage"],
  },
  // Components
  {
    id: "comp-navbar",
    type: "component",
    label: "Navbar.tsx",
    path: "components/Navbar.tsx",
    linesOfCode: 98,
    complexity: 3,
    imports: ["svc-supabase", "util-schools"],
    exports: ["Navbar"],
  },
  {
    id: "comp-hero",
    type: "component",
    label: "Hero.tsx",
    path: "components/Hero.tsx",
    linesOfCode: 176,
    complexity: 5,
    imports: ["util-schools"],
    exports: ["Hero"],
  },
  {
    id: "comp-features",
    type: "component",
    label: "Features.tsx",
    path: "components/Features.tsx",
    linesOfCode: 124,
    complexity: 3,
    imports: ["util-schools"],
    exports: ["Features"],
  },
  {
    id: "comp-footer",
    type: "component",
    label: "Footer.tsx",
    path: "components/Footer.tsx",
    linesOfCode: 44,
    complexity: 1,
    imports: [],
    exports: ["Footer"],
  },
  {
    id: "comp-code-editor",
    type: "component",
    label: "CodeEditor.tsx",
    path: "components/CodeEditor.tsx",
    linesOfCode: 344,
    complexity: 8,
    imports: ["util-types", "util-sample-codes"],
    exports: ["CodeEditor"],
  },
  {
    id: "comp-visual-canvas",
    type: "component",
    label: "VisualCanvas.tsx",
    path: "components/VisualCanvas.tsx",
    linesOfCode: 421,
    complexity: 9,
    imports: ["util-types", "hook-visualizer"],
    exports: ["VisualCanvas"],
  },
  {
    id: "comp-explain-sidebar",
    type: "component",
    label: "ExplainSidebar.tsx",
    path: "components/ExplainSidebar.tsx",
    linesOfCode: 273,
    complexity: 6,
    imports: ["util-types"],
    exports: ["ExplainSidebar"],
  },
  {
    id: "comp-step-controller",
    type: "component",
    label: "StepController.tsx",
    path: "components/StepController.tsx",
    linesOfCode: 212,
    complexity: 5,
    imports: ["util-types"],
    exports: ["StepController"],
  },
  {
    id: "comp-toolbar",
    type: "component",
    label: "TopToolbar.tsx",
    path: "components/workspace/TopToolbar.tsx",
    linesOfCode: 88,
    complexity: 3,
    imports: [],
    exports: ["TopToolbar"],
  },
  {
    id: "comp-left-panel",
    type: "component",
    label: "LeftPanel.tsx",
    path: "components/workspace/LeftPanel.tsx",
    linesOfCode: 134,
    complexity: 4,
    imports: ["lib-mockdata"],
    exports: ["LeftPanel"],
  },
  {
    id: "comp-graph-canvas",
    type: "component",
    label: "GraphCanvas.tsx",
    path: "components/workspace/GraphCanvas.tsx",
    linesOfCode: 246,
    complexity: 7,
    imports: ["lib-mockdata"],
    exports: ["GraphCanvas"],
  },
  {
    id: "comp-right-panel",
    type: "component",
    label: "RightPanel.tsx",
    path: "components/workspace/RightPanel.tsx",
    linesOfCode: 198,
    complexity: 5,
    imports: ["lib-mockdata"],
    exports: ["RightPanel"],
  },
  {
    id: "comp-statusbar",
    type: "component",
    label: "StatusBar.tsx",
    path: "components/workspace/StatusBar.tsx",
    linesOfCode: 52,
    complexity: 2,
    imports: [],
    exports: ["StatusBar"],
  },
  {
    id: "comp-tutor-chat",
    type: "component",
    label: "TutorChat.tsx",
    path: "components/TutorChat.tsx",
    linesOfCode: 233,
    complexity: 7,
    imports: ["svc-api", "util-types"],
    exports: ["TutorChat"],
  },
  {
    id: "comp-algo-catalog",
    type: "component",
    label: "AlgorithmCatalog.tsx",
    path: "components/AlgorithmCatalog.tsx",
    linesOfCode: 452,
    complexity: 6,
    imports: ["util-sample-codes", "util-types"],
    exports: ["AlgorithmCatalog"],
  },
  // Hooks
  {
    id: "hook-auth",
    type: "hook",
    label: "useAuth.ts",
    path: "hooks/useAuth.ts",
    linesOfCode: 76,
    complexity: 4,
    imports: ["svc-supabase"],
    exports: ["useAuth"],
  },
  {
    id: "hook-visualizer",
    type: "hook",
    label: "useVisualizer.ts",
    path: "hooks/useVisualizer.ts",
    linesOfCode: 184,
    complexity: 8,
    imports: ["util-types", "svc-api"],
    exports: ["useVisualizer"],
    hasCycle: true,
  },
  // Services
  {
    id: "svc-api",
    type: "service",
    label: "api.ts",
    path: "lib/api.ts",
    linesOfCode: 48,
    complexity: 3,
    imports: ["util-types"],
    exports: ["traceCode", "explainCode"],
  },
  {
    id: "svc-supabase",
    type: "service",
    label: "supabase.ts",
    path: "utils/supabase/client.ts",
    linesOfCode: 22,
    complexity: 2,
    imports: [],
    exports: ["createClient"],
  },
  // Utils
  {
    id: "util-types",
    type: "util",
    label: "types.ts",
    path: "lib/types.ts",
    linesOfCode: 128,
    complexity: 2,
    imports: [],
    exports: ["Language", "TraceStep", "ExplainLine"],
  },
  {
    id: "util-schools",
    type: "util",
    label: "schools.ts",
    path: "lib/schools.ts",
    linesOfCode: 212,
    complexity: 3,
    imports: [],
    exports: ["getSchoolConfig", "SchoolConfig"],
  },
  {
    id: "util-sample-codes",
    type: "util",
    label: "sampleCodes.ts",
    path: "lib/sampleCodes.ts",
    linesOfCode: 638,
    complexity: 2,
    imports: [],
    exports: ["getDefaultSample"],
  },
  {
    id: "lib-mockdata",
    type: "util",
    label: "mockGraphData.ts",
    path: "lib/mockGraphData.ts",
    linesOfCode: 98,
    complexity: 1,
    imports: [],
    exports: ["MOCK_NODES", "MOCK_EDGES"],
  },
  // Config
  {
    id: "cfg-middleware",
    type: "config",
    label: "middleware.ts",
    path: "middleware.ts",
    linesOfCode: 71,
    complexity: 4,
    imports: ["svc-supabase"],
    exports: ["middleware"],
  },
  {
    id: "cfg-next",
    type: "config",
    label: "next.config.ts",
    path: "next.config.ts",
    linesOfCode: 12,
    complexity: 1,
    imports: [],
    exports: ["config"],
  },
  // Dead code example
  {
    id: "util-legacy-tracer",
    type: "util",
    label: "legacyTracer.ts",
    path: "lib/legacyTracer.ts",
    linesOfCode: 312,
    complexity: 7,
    imports: [],
    exports: ["runLegacyTrace"],
    isDeadCode: true,
  },
];

// Build edges from node imports
export const MOCK_EDGES: GraphEdge[] = (() => {
  const edges: GraphEdge[] = [];
  MOCK_NODES.forEach((node) => {
    node.imports.forEach((targetId) => {
      edges.push({
        id: `${node.id}→${targetId}`,
        source: node.id,
        target: targetId,
        type: "import",
      });
    });
  });
  return edges;
})();

// Node type metadata
export const NODE_TYPE_META: Record<GraphNode["type"], { color: string; bg: string; label: string }> = {
  page:      { color: "#3B82F6", bg: "rgba(59,130,246,0.10)",  label: "Page" },
  component: { color: "#8B5CF6", bg: "rgba(139,92,246,0.10)", label: "Component" },
  hook:      { color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  label: "Hook" },
  service:   { color: "#10B981", bg: "rgba(16,185,129,0.10)",  label: "Service" },
  util:      { color: "#6B7280", bg: "rgba(107,114,128,0.10)", label: "Util" },
  config:    { color: "#EC4899", bg: "rgba(236,72,153,0.10)",  label: "Config" },
};

// Grid layout positions for initial render
export const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = {
  // Pages — top row
  "page-home":         { x: 80,   y: 60 },
  "page-visualize":    { x: 340,  y: 60 },
  "page-workspace":    { x: 600,  y: 60 },
  "page-login":        { x: 860,  y: 60 },
  // Components — second row
  "comp-navbar":       { x: 60,   y: 260 },
  "comp-hero":         { x: 220,  y: 260 },
  "comp-features":     { x: 380,  y: 260 },
  "comp-footer":       { x: 540,  y: 260 },
  "comp-code-editor":  { x: 700,  y: 260 },
  "comp-visual-canvas":{ x: 900,  y: 260 },
  "comp-explain-sidebar":{ x: 1100,y: 260 },
  "comp-step-controller":{ x: 1300,y: 260 },
  // Workspace components
  "comp-toolbar":      { x: 480,  y: 420 },
  "comp-left-panel":   { x: 640,  y: 420 },
  "comp-graph-canvas": { x: 800,  y: 420 },
  "comp-right-panel":  { x: 960,  y: 420 },
  "comp-statusbar":    { x: 1120, y: 420 },
  // Others
  "comp-tutor-chat":   { x: 200,  y: 420 },
  "comp-algo-catalog": { x: 360,  y: 420 },
  // Hooks
  "hook-auth":         { x: 100,  y: 580 },
  "hook-visualizer":   { x: 300,  y: 580 },
  // Services
  "svc-api":           { x: 560,  y: 580 },
  "svc-supabase":      { x: 740,  y: 580 },
  // Utils
  "util-types":        { x: 940,  y: 580 },
  "util-schools":      { x: 1100, y: 580 },
  "util-sample-codes": { x: 1260, y: 580 },
  "lib-mockdata":      { x: 700,  y: 680 },
  // Config
  "cfg-middleware":    { x: 100,  y: 760 },
  "cfg-next":          { x: 260,  y: 760 },
  // Dead code
  "util-legacy-tracer":{ x: 460,  y: 760 },
};
