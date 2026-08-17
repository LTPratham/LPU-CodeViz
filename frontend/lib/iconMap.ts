// ─── Icon Map ────────────────────────────────────────────────────────────────
// Maps string icon keys (used in dashboardUtils.ts and schools.ts) to Lucide
// React components. Import this in client components to render icons by name.

import {
  // XP tiers & achievements (dashboardUtils.ts)
  Sprout,
  Monitor,
  Settings,
  Trophy,
  Target,
  Flame,
  Map,
  BarChart2,
  GitBranch,
  Network,
  Wand2,
  Star,
  BadgeCheck,
  Zap,
  // CSE feature cards (schools.ts)
  LayoutGrid,
  Layers,
  AlignJustify,
  Link2,
  CornerDownLeft,
  // SME feature cards (schools.ts)
  Thermometer,
  Waves,
  Triangle,
  // LSB feature cards (schools.ts)
  TableProperties,
  TrendingUp,
  Package,
  Coins,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  // XP tiers & achievements
  Sprout,
  Monitor,
  Settings,
  Trophy,
  Target,
  Flame,
  Map,
  BarChart2,
  GitBranch,
  Network,
  Wand2,
  Star,
  BadgeCheck,
  Zap,
  // CSE features
  LayoutGrid,
  Layers,
  AlignJustify,
  Link2,
  CornerDownLeft,
  // SME features
  Thermometer,
  Waves,
  Triangle,
  // LSB features
  TableProperties,
  TrendingUp,
  Package,
  Coins,
};
