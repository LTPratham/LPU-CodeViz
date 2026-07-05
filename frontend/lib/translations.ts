export type SupportedLang = "en" | "hi" | "ta" | "te" | "mr";

export interface TranslationDictionary {
  sandbox: string;
  facultyHub: string;
  battleground: string;
  statusSla: string;
  aiTutor: string;
  stepTrace: string;
  timeComplexity: string;
  nepBadge: string;
  welcomeHero: string;
  loginBtn: string;
}

export const TRANSLATIONS: Record<SupportedLang, TranslationDictionary> = {
  en: {
    sandbox: "Sandbox Visualizer",
    facultyHub: "Faculty Hub",
    battleground: "Algorithm Battleground",
    statusSla: "SLA Status",
    aiTutor: "AI Tutor Chat",
    stepTrace: "Step-by-Step Trace",
    timeComplexity: "Time Complexity",
    nepBadge: "🇮🇳 NEP 2020 VERNACULAR COMPLIANT",
    welcomeHero: "AI Algorithm Visualizer & Tutor",
    loginBtn: "Login / Register",
  },
  hi: {
    sandbox: "सैंडबॉक्स विज़ुअलाइज़र",
    facultyHub: "शिक्षक केंद्र (Faculty Hub)",
    battleground: "एल्गोरिदम मुकाबला (Battleground)",
    statusSla: "सिस्टम स्थिति (SLA)",
    aiTutor: "एआई शिक्षक चैट",
    stepTrace: "चरण-दर-चरण विश्लेषण",
    timeComplexity: "समय जटिलता (Big-O)",
    nepBadge: "🇮🇳 NEP 2020 भारतीय भाषा समर्थित",
    welcomeHero: "एआई एल्गोरिदम विज़ुअलाइज़र और शिक्षक",
    loginBtn: "लॉग इन / रजिस्टर",
  },
  ta: {
    sandbox: "மணல்பெட்டி காட்சிப்படுத்தி",
    facultyHub: "பேராசிரியர் மையம்",
    battleground: "வழிமுறை போர்க்களம்",
    statusSla: "SLA நிலை",
    aiTutor: "AI ஆசிரியர் அரட்டை",
    stepTrace: "படி-படியாக தடமறிதல்",
    timeComplexity: "நேர சிக்கலான தன்மை",
    nepBadge: "🇮🇳 NEP 2020 தமிழ் மொழி ஆதரவு",
    welcomeHero: "AI வழிமுறை காட்சிப்படுத்தி",
    loginBtn: "உள்நுழை / பதிவு செய்",
  },
  te: {
    sandbox: "శాండ్‌బాక్స్ విజువలైజర్",
    facultyHub: "ఫ్యాకల్టీ హబ్",
    battleground: "అల్గారిథమ్ యుద్దభూమి",
    statusSla: "SLA స్థితి",
    aiTutor: "AI ట్యూటర్ చాట్",
    stepTrace: "దశలవారీ విశ్లేషణ",
    timeComplexity: "సమయ సంక్లిష్టత",
    nepBadge: "🇮🇳 NEP 2020 తెలుగు భాషా మద్దతు",
    welcomeHero: "AI అల్గారిథమ్ విజువలైజర్ & ట్యూటర్",
    loginBtn: "లాగిన్ / రిజిస్టర్",
  },
  mr: {
    sandbox: "सँडबॉक्स व्हिज्युअलायझर",
    facultyHub: "प्राध्यापक केंद्र",
    battleground: "अल्गोरिदम युद्धभूमी",
    statusSla: "SLA स्थिती",
    aiTutor: "AI शिक्षक संवाद",
    stepTrace: "टप्प्याटप्प्याने विश्लेषण",
    timeComplexity: "वेळेची गुंतागुंत",
    nepBadge: "🇮🇳 NEP 2020 मराठी भाषा समर्थित",
    welcomeHero: "AI अल्गोरिदम व्हिज्युअलायझर आणि शिक्षक",
    loginBtn: "लॉगिन / नोंदणी",
  },
};

export function getTranslation(lang: SupportedLang = "en"): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
