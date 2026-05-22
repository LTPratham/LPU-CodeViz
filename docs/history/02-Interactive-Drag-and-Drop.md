# Milestone 2: Interactive Drag-and-Drop for Visual Canvas

**Dates:** May 22–23, 2026

## 1. Goal & Requirements
Enable users to interactively drag and shake visual components on the canvas to enhance educational interactivity, while maintaining layout constraints so data structure orders aren't broken.

* **Requirements**:
  * Spring-back elastic drag for grid/linear components.
  * Node translation inside the SVG workspace for tree nodes.
  * Dynamically stretch and rotate connection lines and labels so they remain attached to shifted tree nodes.
  * Clean, premium aesthetics (micro-animations, neon status glows on drag).

---

## 2. Implementation Details

### A. Spring-back Visualizers (Framer Motion)
Grid and linear collections use `dragConstraints` set to 0. When dragged, elements scale up by 5% to 15%, show status-colored glowing drop-shadows, and spring back to their default position upon release:

* **[ArrayViz.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/ArrayViz.tsx)**: Individually draggable array element value boxes.
* **[SortingViz.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/SortingViz.tsx)**: Sorting box elements.
* **[StackViz.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/StackViz.tsx)**: Draggable vertical stack cells.
* **[QueueViz.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/QueueViz.tsx)**: Draggable horizontal queue cells.
* **[VariableBoard.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/VariableBoard.tsx)**: memory board variable cards.
* **[LinkedListViz.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/LinkedListViz.tsx)**: Draggable pointer nodes.

### B. Tree Node Translation & Stretching Connectors
The binary tree visualizer utilizes absolute repositioning inside the SVG canvas:

* **File Location**: [TreeViz.tsx](file:///C:/Users/PREDATOR/.gemini/antigravity/worktrees/LPU%20CodeViz/debug-ui-file-view/frontend/components/visualizers/TreeViz.tsx)
* **Mechanics**:
  1. Tracks offsets in React state: `Record<string, {x: number, y: number}>`.
  2. Drags `<motion.g>` node groups. Updates coordinates in `onDrag` using delta movement.
  3. Restricts positions in `onDrag` so nodes cannot be dragged off-screen (minimum coordinates clamped at 30px).
  4. Dynamically expands `svgWidth` and `svgHeight` coordinates inside a `useMemo` block so dragged nodes do not get clipped.
  5. Computes lines (`<line>`) and edge labels (`L` and `R`) dynamically using `node.x + offset.x` so they stretch, contract, and center themselves in real-time.
  6. Recreates node groups with a keying scheme (`node.id + layoutHash`) that resets offsets only if the tree structure changes, preventing nodes from jumping back to defaults while tracing line executions.

---

## 3. Verification & Deployment
* **Local Checks**: Installed dependencies and completed a Next.js production compiler check (`npm run build`). The build succeeded with zero compilation or TypeScript errors.
* **Release**: Pushed visualizer updates to `origin/main` to trigger live Railway deployment.
