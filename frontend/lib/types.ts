// ─── All TypeScript types for CodeCanvas ───────────────────────

// Language
export type Language = "c" | "cpp" | "python" | "sql" | "java" | "html";

// ─── Visualizer State Types ───

export interface ArrayElement {
  value: number | string;
  index: number;
  status: "default" | "active" | "comparing" | "sorted" | "pivot" | "swapping";
}

export interface ArrayState {
  type: "array";
  elements: ArrayElement[];
}

export interface StackElement {
  value: string | number;
  status: "active" | "default" | "returning";
}

export interface StackState {
  type: "stack";
  elements: StackElement[];
  top: number;
}

export interface QueueElement {
  value: string | number;
  status: "default" | "active" | "dequeuing" | "enqueuing";
}

export interface QueueState {
  type: "queue";
  elements: QueueElement[];
  front: number;
  rear: number;
}

export interface LinkedListNode {
  id: string;
  value: string | number;
  next: string | null;
  status: "active" | "default" | "null" | "inserting" | "deleting";
}

export interface LinkedListState {
  type: "linkedlist";
  nodes: LinkedListNode[];
}

export interface TreeNode {
  id: string;
  value: string | number;
  left: string | null;
  right: string | null;
  status: "visiting" | "visited" | "default" | "inserting";
}

export interface TreeState {
  type: "binarytree";
  nodes: TreeNode[];
}

export interface RecursionFrame {
  id: string;
  funcName: string;
  args: Record<string, string | number>;
  returnValue?: string | number;
  status: "active" | "returning" | "completed";
}

export interface RecursionState {
  type: "recursion";
  frames: RecursionFrame[];
  depth: number;
}

export interface VariableEntry {
  name: string;
  value: string | number | boolean | null;
  type: string;
  status: "active" | "default" | "updated";
}

export interface VariableState {
  type: "variables";
  variables: VariableEntry[];
  output?: string[];
}

export interface SqlRow {
  values: (string | number | null)[];
  status: "default" | "inserted" | "selected" | "filtered" | "joining";
}

export interface SqlTableState {
  type: "sqltable";
  tableName: string;
  columns: string[];
  rows: SqlRow[];
  secondTable?: Omit<SqlTableState, "type">;
}

export interface GraphNode {
  id: string;
  value: string | number;
  status: "default" | "visiting" | "visited" | "highlighted" | "shortest_path";
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  status: "default" | "highlighted" | "shortest_path";
}

export interface GraphState {
  type: "graph";
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

export type VisualizationState =
  | ArrayState
  | StackState
  | QueueState
  | LinkedListState
  | TreeState
  | RecursionState
  | VariableState
  | SqlTableState
  | GraphState;

// ─── Trace / Steps ───

export type StepAction =
  | "compare" | "swap" | "push" | "pop" | "enqueue" | "dequeue"
  | "insert" | "traverse" | "assign" | "call" | "return"
  | "highlight" | "filter" | "select" | "create_table" | "sort";

export interface TraceStep {
  stepNum: number;
  line: number;
  code?: string;
  action: StepAction;
  state: VisualizationState;
  description: string;
  variables: Record<string, string | number | boolean | null>;
}

export interface TraceResponse {
  dataStructure: string;
  steps: TraceStep[];
}

// ─── Explanation ───

export type ExplainCategory = "core" | "structure" | "io" | "logic" | "db";

export interface ExplainLine {
  line: number;
  code: string;
  explain: string;
  concept: string;
  category: ExplainCategory;
  why?: string;
}

export type ExplainResponse = ExplainLine[];

// ─── Chat ───

export interface ChatMessage {
  id: string;
  role: "student" | "tutor";
  content: string;
  timestamp: Date;
}

export interface TutorAskRequest {
  code: string;
  lang: Language;
  stepNum: number;
  stepDescription: string;
  question: string;
}

export interface TutorAskResponse {
  answer: string;
}

// ─── API Request bodies ───

export interface ExplainRequest {
  lang: Language;
  code: string;
}

export interface TraceRequest {
  lang: Language;
  code: string;
}

// ─── Sample Code ───

export interface SampleCode {
  id: string;
  title: string;
  lang: Language;
  code: string;
  description: string;
  topic: string;
}

// ─── Challenge Mode ───

export interface PredictionChallenge {
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  description: string;
}


