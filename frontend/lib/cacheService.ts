import { createClient } from "@/utils/supabase/client";
import type { Language, TraceResponse, ExplainResponse } from "./types";

// Helper to normalize numeric/string literals to make structural matching possible
export function normalizeCode(code: string): string {
  // Replace numbers with placeholders
  let normalized = code.replace(/\b\d+\b/g, "_NUM_");
  // Replace single quoted string literals
  normalized = normalized.replace(/'[^']*'/g, "'_STR_'");
  // Replace double quoted string literals
  normalized = normalized.replace(/"[^"]*"/g, '"_STR_"');
  return normalized.trim();
}

// Simple SHA-256 hash helper
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface CachedItem {
  trace_data: TraceResponse;
  explain_data: ExplainResponse;
}

/**
 * Maps the literal values from the original cached code to the new code and replaces them in the JSON data.
 */
function adaptCachedData(
  cached: { original_code: string; trace_data: any; explain_data: any },
  newCode: string
): CachedItem {
  const origCode = cached.original_code;
  
  // Extract number arrays to map them
  const origNumbers = origCode.match(/\b\d+\b/g) || [];
  const newNumbers = newCode.match(/\b\d+\b/g) || [];

  if (origNumbers.length !== newNumbers.length) {
    // If the number of literals differs, we cannot map them one-to-one.
    // Return cached directly as fallback to avoid breaking.
    return {
      trace_data: cached.trace_data,
      explain_data: cached.explain_data
    };
  }

  // Create mapping: original string key -> new string key
  const numberMap: Record<string, string> = {};
  for (let i = 0; i < origNumbers.length; i++) {
    numberMap[origNumbers[i]] = newNumbers[i];
  }

  // Helper to replace values recursively in string or object structures
  const replaceValues = (val: any): any => {
    if (typeof val === "string") {
      let replaced = val;
      // Sort keys descending by length so "100" is replaced before "10"
      const keys = Object.keys(numberMap).sort((a, b) => b.length - a.length);
      for (const k of keys) {
        // Regex word boundary search for literal numbers in strings
        const regex = new RegExp(`\\b${k}\\b`, "g");
        replaced = replaced.replace(regex, numberMap[k]);
      }
      return replaced;
    }
    if (typeof val === "number") {
      const strVal = val.toString();
      if (numberMap[strVal] !== undefined) {
        return Number(numberMap[strVal]);
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(replaceValues);
    }
    if (val !== null && typeof val === "object") {
      const copy: Record<string, any> = {};
      for (const k in val) {
        copy[k] = replaceValues(val[k]);
      }
      return copy;
    }
    return val;
  };

  return {
    trace_data: replaceValues(cached.trace_data),
    explain_data: replaceValues(cached.explain_data)
  };
}

/**
 * Checks the Supabase cache for an exact match or a structural match.
 */
export async function checkCache(lang: Language, code: string): Promise<CachedItem | null> {
  const supabase = createClient();
  // Check if supabase keys are missing (auth is mocked/null)
  if (!supabase || !supabase.auth) return null;

  const trimmed = code.trim();
  const hash = await sha256(trimmed);

  try {
    // 1. Try to find an exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from("visualizer_cache")
      .select("trace_data, explain_data")
      .eq("language", lang)
      .eq("code_hash", hash)
      .maybeSingle();

    if (exactMatch && !exactError) {
      console.log("Visualizer Cache: Exact match found!");
      return exactMatch as CachedItem;
    }

    // 2. Try to find a structural match
    const normalized = normalizeCode(trimmed);
    const { data: structuralMatch, error: structError } = await supabase
      .from("visualizer_cache")
      .select("original_code, trace_data, explain_data")
      .eq("language", lang)
      .eq("normalized_code", normalized)
      .limit(1)
      .maybeSingle();

    if (structuralMatch && !structError) {
      console.log("Visualizer Cache: Structural match found! Adapting values...");
      return adaptCachedData(structuralMatch, trimmed);
    }
  } catch (err) {
    console.warn("Visualizer Cache lookup failed:", err);
  }

  return null;
}

/**
 * Saves a code trace and explanation run into Supabase.
 */
export async function saveToCache(
  lang: Language,
  code: string,
  trace_data: TraceResponse,
  explain_data: ExplainResponse
): Promise<void> {
  const supabase = createClient();
  if (!supabase || !supabase.auth) return;

  const trimmed = code.trim();
  const hash = await sha256(trimmed);
  const normalized = normalizeCode(trimmed);

  try {
    const { error } = await supabase.from("visualizer_cache").upsert({
      language: lang,
      code_hash: hash,
      normalized_code: normalized,
      original_code: trimmed,
      trace_data,
      explain_data,
      created_at: new Date().toISOString()
    }, { onConflict: "code_hash" });

    if (error) {
      console.warn("Failed to upsert into visualizer_cache:", error.message);
    } else {
      console.log("Visualizer Cache: Successfully saved explanation & trace.");
    }
  } catch (err) {
    console.warn("Failed to save to Supabase cache:", err);
  }
}
