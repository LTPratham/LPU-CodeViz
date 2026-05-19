import type {
  ExplainRequest,
  ExplainResponse,
  TraceRequest,
  TraceResponse,
  TutorAskRequest,
  TutorAskResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiRequest<T>(
  endpoint: string,
  body: object,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error ${response.status}`);
  }

  return response.json();
}

export const explainCode = (
  req: ExplainRequest,
  signal?: AbortSignal
): Promise<ExplainResponse> =>
  apiRequest<ExplainResponse>("/explain", req, signal);

export const traceCode = (
  req: TraceRequest,
  signal?: AbortSignal
): Promise<TraceResponse> =>
  apiRequest<TraceResponse>("/trace", req, signal);

export const askTutor = (
  req: TutorAskRequest,
  signal?: AbortSignal
): Promise<TutorAskResponse> =>
  apiRequest<TutorAskResponse>("/ask", req, signal);

