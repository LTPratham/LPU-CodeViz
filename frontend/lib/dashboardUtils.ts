// ─── CodeCanvas Dashboard Utilities ─────────────────────────────────────────
// Full utility library: XP levels, time ago, achievements, NAAC CSV, deadlines

// ─── UserStats Interface ─────────────────────────────────────────────────────

export interface UserStats {
  traceCount: number;
  streakDays: number;
  algorithmTypes: string[];
  submissionCount: number;
  sortingCount: number;
  treeCount: number;
  graphCount: number;
  sqlCount: number;
}

// ─── XP Level System ─────────────────────────────────────────────────────────

export interface XpLevel {
  level: string;
  color: string;
  emoji: string;
  nextXP: number;
  progress: number; // 0-100 percentage to next level
}

const XP_TIERS: Array<{
  label: string;
  emoji: string;
  color: string;
  min: number;
  max: number;
}> = [
  { label: "Beginner",          emoji: "🌱", color: "#6B7280", min: 0,   max: 99   },
  { label: "Developer",         emoji: "💻", color: "#3B82F6", min: 100, max: 299  },
  { label: "Engineer",          emoji: "⚙️", color: "#8B5CF6", min: 300, max: 699  },
  { label: "Algorithm Master",  emoji: "🏆", color: "#F59E0B", min: 700, max: Infinity },
];

export function getLevel(xp: number): XpLevel {
  const clampedXP = Math.max(0, xp);
  for (let i = 0; i < XP_TIERS.length; i++) {
    const tier = XP_TIERS[i];
    if (clampedXP <= tier.max) {
      const nextTier = XP_TIERS[i + 1];
      if (!nextTier) {
        return { level: tier.label, color: tier.color, emoji: tier.emoji, nextXP: tier.max, progress: 100 };
      }
      const rangeSize = tier.max - tier.min + 1;
      const earned    = clampedXP - tier.min;
      const progress  = Math.min(100, Math.round((earned / rangeSize) * 100));
      return { level: tier.label, color: tier.color, emoji: tier.emoji, nextXP: nextTier.min, progress };
    }
  }
  const last = XP_TIERS[XP_TIERS.length - 1];
  return { level: last.label, color: last.color, emoji: last.emoji, nextXP: last.max, progress: 100 };
}

// ─── Time Ago ────────────────────────────────────────────────────────────────

export function timeAgo(date: string | Date): string {
  const now    = new Date();
  const then   = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  if (isNaN(then.getTime())) return "unknown";
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours   = Math.floor(diffMinutes / 60);
  const diffDays    = Math.floor(diffHours   / 24);
  if (diffSeconds < 60)  return "just now";
  if (diffMinutes < 60)  return diffMinutes === 1 ? "1 minute ago"  : `${diffMinutes} minutes ago`;
  if (diffHours   < 24)  return diffHours   === 1 ? "1 hour ago"    : `${diffHours} hours ago`;
  if (diffDays    === 1) return "yesterday";
  if (diffDays    < 30)  return `${diffDays} days ago`;
  if (diffDays    < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

// ─── Achievement Definitions ─────────────────────────────────────────────────

export interface AchievementDefinition {
  label:       string;
  icon:        string;
  description: string;
  color:       string;
  check:       (stats: UserStats) => boolean;
}

export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  first_trace: {
    label: "First Trace", icon: "🎯",
    description: "Run your very first code trace",
    color: "#3B82F6",
    check: (s) => s.traceCount >= 1,
  },
  streak_7: {
    label: "Week Warrior", icon: "🔥",
    description: "Maintain a 7-day learning streak",
    color: "#F59E0B",
    check: (s) => s.streakDays >= 7,
  },
  algo_10: {
    label: "Algorithm Explorer", icon: "🗺️",
    description: "Trace 10 different algorithms",
    color: "#8B5CF6",
    check: (s) => s.traceCount >= 10,
  },
  sorting_master: {
    label: "Sorting Master", icon: "📊",
    description: "Trace 5 sorting algorithms",
    color: "#06B6D4",
    check: (s) => s.sortingCount >= 5,
  },
  tree_explorer: {
    label: "Tree Explorer", icon: "🌳",
    description: "Visualize 3 tree algorithms",
    color: "#22C55E",
    check: (s) => s.treeCount >= 3,
  },
  graph_navigator: {
    label: "Graph Navigator", icon: "🕸️",
    description: "Navigate through 3 graph algorithms",
    color: "#A78BFA",
    check: (s) => s.graphCount >= 3,
  },
  sql_wizard: {
    label: "SQL Wizard", icon: "🧙",
    description: "Run 3 SQL query traces",
    color: "#F97316",
    check: (s) => s.sqlCount >= 3,
  },
  assignment_star: {
    label: "Assignment Star", icon: "⭐",
    description: "Submit your first classroom assignment",
    color: "#EAB308",
    check: (s) => s.submissionCount >= 1,
  },
  century: {
    label: "Centurion", icon: "💯",
    description: "Complete 100 total traces",
    color: "#EC4899",
    check: (s) => s.traceCount >= 100,
  },
  speed_runner: {
    label: "Speed Runner", icon: "⚡",
    description: "Use all algorithm types in a single week",
    color: "#14B8A6",
    check: (s) => s.algorithmTypes.length >= 5,
  },
};

export function getEarnedAchievements(stats: UserStats): string[] {
  return Object.entries(ACHIEVEMENTS)
    .filter(([, def]) => def.check(stats))
    .map(([key]) => key);
}

// ─── NAAC CSV Generator ───────────────────────────────────────────────────────

export interface NaacRow {
  name:              string;
  email:             string;
  traceCount:        number;
  algorithmsLearned: string;
  lastActive:        string;
  xp:                number;
}

export function generateNaacCsv(
  rows:       NaacRow[],
  className:  string,
  courseCode: string
): string {
  const now     = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const esc = (v: string | number): string => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const lines: string[] = [];
  lines.push("NAAC Student Learning Report — CodeCanvas");
  lines.push(`Course:,${esc(courseCode)},Class:,${esc(className)},Generated:,${dateStr} at ${timeStr}`);
  lines.push("");
  lines.push(["S.No.", "Student Name", "Email", "Total Traces", "Algorithms Learned", "Last Active", "XP Earned", "Level"].map(esc).join(","));
  rows.forEach((row, idx) => {
    const lvl = getLevel(row.xp);
    lines.push([idx + 1, row.name, row.email, row.traceCount, row.algorithmsLearned, row.lastActive, row.xp, `${lvl.emoji} ${lvl.level}`].map(esc).join(","));
  });
  lines.push("");
  const totalXP     = rows.reduce((s, r) => s + r.xp, 0);
  const totalTraces = rows.reduce((s, r) => s + r.traceCount, 0);
  const avgXP       = rows.length > 0 ? Math.round(totalXP / rows.length) : 0;
  const avgTraces   = rows.length > 0 ? Math.round(totalTraces / rows.length) : 0;
  lines.push("Summary");
  lines.push(`Total Students,${rows.length}`);
  lines.push(`Total XP Awarded,${totalXP}`);
  lines.push(`Total Traces Completed,${totalTraces}`);
  lines.push(`Average XP per Student,${avgXP}`);
  lines.push(`Average Traces per Student,${avgTraces}`);
  return "\uFEFF" + lines.join("\r\n");
}

// ─── Deadline Formatter ───────────────────────────────────────────────────────

export interface DeadlineInfo {
  text:    string;
  urgency: "normal" | "soon" | "overdue";
}

export function formatDeadline(deadline: string): DeadlineInfo {
  const now   = new Date();
  const due   = new Date(deadline);
  if (isNaN(due.getTime())) return { text: "No deadline", urgency: "normal" };
  const diffMs      = due.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours   = Math.floor(diffMs / 3_600_000);
  const diffDays    = Math.floor(diffMs / 86_400_000);
  if (diffMs < 0) {
    const absHours = Math.abs(diffHours);
    const absDays  = Math.abs(diffDays);
    if (absHours < 1)  return { text: "Overdue (just now)", urgency: "overdue" };
    if (absHours < 24) return { text: `Overdue by ${absHours}h`, urgency: "overdue" };
    if (absDays === 1) return { text: "Overdue by 1 day", urgency: "overdue" };
    return { text: `Overdue by ${absDays} days`, urgency: "overdue" };
  }
  if (diffMinutes < 60)  return { text: `Due in ${diffMinutes}m`, urgency: "soon" };
  if (diffHours   < 24)  return { text: `Due in ${diffHours}h ${diffMinutes % 60}m`, urgency: "soon" };
  if (diffDays    === 1) return { text: "Due tomorrow", urgency: "normal" };
  if (diffDays    < 7)   return { text: `Due in ${diffDays} days`, urgency: "normal" };
  const formatted = due.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return { text: `Due ${formatted}`, urgency: "normal" };
}
