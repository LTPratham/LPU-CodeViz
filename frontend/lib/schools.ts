export interface Subject {
  code: string;
  name: string;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  badge: string;
  color: string;
}

export interface SchoolConfig {
  id: string;
  name: string;
  shortName: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroSub: string;
  badge: string;
  primaryColor: string;
  primaryLight: string;
  primaryGlow: string;
  subjects: Subject[];
  features: Feature[];
}

export const SCHOOL_CONFIGS: Record<string, SchoolConfig> = {
  cse: {
    id: "cse",
    name: "School of Computer Science & Engineering",
    shortName: "CSE Edition",
    heroTitlePrefix: "Stop memorizing code. ",
    heroTitleHighlight: "Start understanding it.",
    heroSub: "Ace your mid-terms and practicals with step-by-step animated visualizers for C, C++, Python, SQL, Java, and HTML. Includes plain-English line-by-line explanations and an AI tutor.",
    badge: "Computer Science & Engineering",
    primaryColor: "#05DF72",
    primaryLight: "#39FF14",
    primaryGlow: "rgba(5, 223, 114, 0.15)",
    subjects: [
      { code: "CSE101", name: "C Programming" },
      { code: "INT108", name: "Python" },
      { code: "INT306", name: "DBMS / SQL" },
      { code: "CSE202", name: "Data Structures" },
      { code: "CSE380", name: "Java" },
      { code: "CSE326", name: "Web / HTML" },
    ],
    features: [
      {
        icon: "▦",
        title: "Array & Sorting",
        desc: "Bubble, Selection, Insertion sort animated with swap arcs and comparison counters",
        badge: "CSE101 / CSE202",
        color: "#00F2FE",
      },
      {
        icon: "⊟",
        title: "Stack",
        desc: "LIFO push/pop with vertical tower animation — perfect for recursion understanding",
        badge: "CSE202",
        color: "#3B82F6",
      },
      {
        icon: "⊞",
        title: "Queue",
        desc: "FIFO enqueue/dequeue with sliding animation, front and rear pointers shown",
        badge: "CSE202",
        color: "#8B5CF6",
      },
      {
        icon: "⬡",
        title: "Linked List",
        desc: "Nodes with live pointer arrows — insert and delete with smooth reconnect animation",
        badge: "CSE202",
        color: "#F59E0B",
      },
      {
        icon: "⎇",
        title: "Binary Tree",
        desc: "BST with in-order, pre-order, post-order traversal animations and node highlighting",
        badge: "CSE202",
        color: "#22C55E",
      },
      {
        icon: "↩",
        title: "Recursion",
        desc: "Call stack visualization — each function call pushes a card, return pops it with value",
        badge: "CSE101 / INT108",
        color: "#EF4444",
      },
    ],
  },
  sme: {
    id: "sme",
    name: "School of Mechanical Engineering",
    shortName: "Mechanical Edition",
    heroTitlePrefix: "Visualize physics & design. ",
    heroTitleHighlight: "Build the future.",
    heroSub: "Master engineering mechanics, thermodynamic cycles, CAD logic, and manufacturing algorithms with dynamic interactive visualizers built for mechanical engineers.",
    badge: "Mechanical Engineering",
    primaryColor: "#FF8C00",
    primaryLight: "#FFB020",
    primaryGlow: "rgba(255, 140, 0, 0.25)",
    subjects: [
      { code: "MEC101", name: "Engineering Mechanics" },
      { code: "MEC201", name: "Thermodynamics" },
      { code: "MEC302", name: "Fluid Machinery" },
      { code: "CAD101", name: "AutoCAD & SolidWorks Logic" },
      { code: "MEC211", name: "Kinematics of Machines" },
    ],
    features: [
      {
        icon: "⚙",
        title: "Gear Trains & Kinematics",
        desc: "Simulate gear speed ratios, torque calculations, and planetary gear systems step-by-step",
        badge: "MEC211",
        color: "#FF8C00",
      },
      {
        icon: "♨",
        title: "Thermodynamic Cycles",
        desc: "Visualize Otto, Diesel, and Carnot cycle states with interactive P-V and T-S diagram plotters",
        badge: "MEC201",
        color: "#EF4444",
      },
      {
        icon: "🌊",
        title: "Fluid Flow Vis",
        desc: "Interactive laminar and turbulent fluid velocity distributions across pipes and nozzles",
        badge: "MEC302",
        color: "#3B82F6",
      },
      {
        icon: "📐",
        title: "Truss Load Visualizer",
        desc: "Apply loads to truss structures and view dynamic compression/tension vector forces in real time",
        badge: "MEC101",
        color: "#22C55E",
      },
    ],
  },
  lsb: {
    id: "lsb",
    name: "LPU School of Business",
    shortName: "Business & FinTech",
    heroTitlePrefix: "Understand finance logic. ",
    heroTitleHighlight: "Analyze like a Pro.",
    heroSub: "Ace your accounting, asset valuation, supply chain logistics, and quantitative business logic exams. Watch compound interest, supply-demand curves, and ledger balances animate.",
    badge: "LSB Business & Finance",
    primaryColor: "#A15DF3",
    primaryLight: "#C4B5FD",
    primaryGlow: "rgba(161, 93, 243, 0.25)",
    subjects: [
      { code: "BUS101", name: "Principles of Management" },
      { code: "FIN202", name: "Financial Accounting" },
      { code: "MGT301", name: "Supply Chain Logistics" },
      { code: "ECO101", name: "Managerial Economics" },
      { code: "FIN401", name: "Quantitative FinTech" },
    ],
    features: [
      {
        icon: "📊",
        title: "Ledger T-Accounts",
        desc: "Double-entry bookkeeping visualizer showing flow of debit and credit values between ledgers",
        badge: "FIN202",
        color: "#A15DF3",
      },
      {
        icon: "📈",
        title: "Supply & Demand",
        desc: "Watch equilibrium prices shift dynamically with sliders for supply and demand determinants",
        badge: "ECO101",
        color: "#22C55E",
      },
      {
        icon: "📦",
        title: "Inventory & Queueing",
        desc: "Visualize FIFO/LIFO valuation, EOQ models, and single-server queue systems in operations",
        badge: "MGT301",
        color: "#3B82F6",
      },
      {
        icon: "💰",
        title: "Amortization & TVM",
        desc: "Animate loan amortization schedules and the time value of money compounding paths",
        badge: "FIN401",
        color: "#FF8C00",
      },
    ],
  },
};

export function getSchoolConfig(schoolParam?: string | null, hostname?: string | null): SchoolConfig {
  if (schoolParam && SCHOOL_CONFIGS[schoolParam.toLowerCase()]) {
    return SCHOOL_CONFIGS[schoolParam.toLowerCase()];
  }
  
  if (hostname) {
    const subdomain = hostname.split(".")[0];
    if (SCHOOL_CONFIGS[subdomain.toLowerCase()]) {
      return SCHOOL_CONFIGS[subdomain.toLowerCase()];
    }
  }
  
  return SCHOOL_CONFIGS.cse; // Default
}
