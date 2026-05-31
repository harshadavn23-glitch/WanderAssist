// LanguageTranslator.tsx
// R5: Real voice input (Web Speech API SpeechRecognition) + speech output (SpeechSynthesis).
// Mic button to speak in source language, Volume2 button speaks translation aloud.
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronRight,
  Copy,
  Languages,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface Language {
  code: string;
  name: string;
  flag: string;
  speechCode: string; // BCP-47 code for Web Speech API
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧", speechCode: "en-US" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", speechCode: "hi-IN" },
  { code: "fr", name: "French", flag: "🇫🇷", speechCode: "fr-FR" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", speechCode: "ja-JP" },
  { code: "ar", name: "Arabic", flag: "🇦🇪", speechCode: "ar-SA" },
  { code: "es", name: "Spanish", flag: "🇪🇸", speechCode: "es-ES" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", speechCode: "zh-CN" },
  { code: "de", name: "German", flag: "🇩🇪", speechCode: "de-DE" },
  { code: "it", name: "Italian", flag: "🇮🇹", speechCode: "it-IT" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", speechCode: "pt-BR" },
];

type LangCode =
  | "en"
  | "hi"
  | "fr"
  | "ja"
  | "ar"
  | "es"
  | "zh"
  | "de"
  | "it"
  | "pt";
type PhraseMap = Partial<Record<LangCode, string>>;

const PHRASE_BANK: Record<string, PhraseMap> = {
  Hello: {
    en: "Hello",
    hi: "नमस्ते",
    fr: "Bonjour",
    ja: "こんにちは",
    ar: "مرحبا",
    es: "Hola",
    zh: "你好",
    de: "Hallo",
    it: "Ciao",
    pt: "Olá",
  },
  "Thank you": {
    en: "Thank you",
    hi: "धन्यवाद",
    fr: "Merci",
    ja: "ありがとう",
    ar: "شكرًا",
    es: "Gracias",
    zh: "谢谢",
    de: "Danke",
    it: "Grazie",
    pt: "Obrigado",
  },
  "Good morning": {
    en: "Good morning",
    hi: "सुप्रभात",
    fr: "Bonjour",
    ja: "おはようございます",
    ar: "صباح الخير",
    es: "Buenos días",
    zh: "早上好",
    de: "Guten Morgen",
    it: "Buongiorno",
    pt: "Bom dia",
  },
  Goodbye: {
    en: "Goodbye",
    hi: "अलविदा",
    fr: "Au revoir",
    ja: "さようなら",
    ar: "وداعًا",
    es: "Adiós",
    zh: "再见",
    de: "Auf Wiedersehen",
    it: "Arrivederci",
    pt: "Adeus",
  },
  "I don't understand": {
    en: "I don't understand",
    hi: "मुझे समझ नहीं आया",
    fr: "Je ne comprends pas",
    ja: "わかりません",
    ar: "لا أفهم",
    es: "No entiendo",
    zh: "我不明白",
    de: "Ich verstehe nicht",
    it: "Non capisco",
    pt: "Não entendo",
  },
  "Where is the hotel?": {
    en: "Where is the hotel?",
    hi: "होटल कहाँ है?",
    fr: "Où est l'hôtel?",
    ja: "ホテルはどこですか?",
    ar: "أين الفندق؟",
    es: "¿Dónde está el hotel?",
    zh: "酒店在哪里？",
    de: "Wo ist das Hotel?",
    it: "Dove è l'hotel?",
    pt: "Onde fica o hotel?",
  },
  "How much does it cost?": {
    en: "How much does it cost?",
    hi: "इसका दाम क्या है?",
    fr: "Combien ça coûte?",
    ja: "いくらですか?",
    ar: "كم يكلف؟",
    es: "¿Cuánto cuesta?",
    zh: "多少钱？",
    de: "Wie viel kostet das?",
    it: "Quanto costa?",
    pt: "Quanto custa?",
  },
  "Help!": {
    en: "Help!",
    hi: "मदद!",
    fr: "Au secours!",
    ja: "助けて!",
    ar: "مساعدة!",
    es: "¡Ayuda!",
    zh: "救命！",
    de: "Hilfe!",
    it: "Aiuto!",
    pt: "Socorro!",
  },
  "Emergency!": {
    en: "Emergency!",
    hi: "आपातकाल!",
    fr: "Urgence!",
    ja: "緊急事態!",
    ar: "طارئ!",
    es: "¡Emergencia!",
    zh: "紧急！",
    de: "Notfall!",
    it: "Emergenza!",
    pt: "Emergência!",
  },
  "Where is the toilet?": {
    en: "Where is the toilet?",
    hi: "शौचालय कहाँ है?",
    fr: "Où sont les toilettes?",
    ja: "トイレはどこですか?",
    ar: "أين الحمام؟",
    es: "¿Dónde está el baño?",
    zh: "厕所在哪里？",
    de: "Wo ist die Toilette?",
    it: "Dov'è il bagno?",
    pt: "Onde fica o banheiro?",
  },
  "Where is the restaurant?": {
    en: "Where is the restaurant?",
    hi: "रेस्तरां कहाँ है?",
    fr: "Où est le restaurant?",
    ja: "レストランはどこですか?",
    ar: "أين المطعم؟",
    es: "¿Dónde está el restaurante?",
    zh: "餐厅在哪里？",
    de: "Wo ist das Restaurant?",
    it: "Dov'è il ristorante?",
    pt: "Onde fica o restaurante?",
  },
  "Where is the airport?": {
    en: "Where is the airport?",
    hi: "हवाई अड्डा कहाँ है?",
    fr: "Où est l'aéroport?",
    ja: "空港はどこですか?",
    ar: "أين المطار؟",
    es: "¿Dónde está el aeropuerto?",
    zh: "机场在哪里？",
    de: "Wo ist der Flughafen?",
    it: "Dov'è l'aeroporto?",
    pt: "Onde fica o aeroporto?",
  },
  One: {
    en: "One",
    hi: "एक",
    fr: "Un",
    ja: "一 (ichi)",
    ar: "واحد",
    es: "Uno",
    zh: "一 (yī)",
    de: "Eins",
    it: "Uno",
    pt: "Um",
  },
  Two: {
    en: "Two",
    hi: "दो",
    fr: "Deux",
    ja: "二 (ni)",
    ar: "اثنان",
    es: "Dos",
    zh: "二 (èr)",
    de: "Zwei",
    it: "Due",
    pt: "Dois",
  },
  Five: {
    en: "Five",
    hi: "पाँच",
    fr: "Cinq",
    ja: "五 (go)",
    ar: "خمسة",
    es: "Cinco",
    zh: "五 (wǔ)",
    de: "Fünf",
    it: "Cinque",
    pt: "Cinco",
  },
  Ten: {
    en: "Ten",
    hi: "दस",
    fr: "Dix",
    ja: "十 (jū)",
    ar: "عشرة",
    es: "Diez",
    zh: "十 (shí)",
    de: "Zehn",
    it: "Dieci",
    pt: "Dez",
  },
  "Turn left": {
    en: "Turn left",
    hi: "बाईं ओर मुड़ें",
    fr: "Tournez à gauche",
    ja: "左に曲がってください",
    ar: "انعطف يسارًا",
    es: "Gire a la izquierda",
    zh: "向左转",
    de: "Links abbiegen",
    it: "Gira a sinistra",
    pt: "Vire à esquerda",
  },
  "Turn right": {
    en: "Turn right",
    hi: "दाईं ओर मुड़ें",
    fr: "Tournez à droite",
    ja: "右に曲がってください",
    ar: "انعطف يمينًا",
    es: "Gire a la derecha",
    zh: "向右转",
    de: "Rechts abbiegen",
    it: "Gira a destra",
    pt: "Vire à direita",
  },
  "Straight ahead": {
    en: "Straight ahead",
    hi: "सीधे आगे",
    fr: "Tout droit",
    ja: "まっすぐ進んでください",
    ar: "اذهب مباشرة",
    es: "Todo recto",
    zh: "一直走",
    de: "Geradeaus",
    it: "Dritto avanti",
    pt: "Em frente",
  },
  Water: {
    en: "Water",
    hi: "पानी",
    fr: "Eau",
    ja: "水 (mizu)",
    ar: "ماء",
    es: "Agua",
    zh: "水 (shuǐ)",
    de: "Wasser",
    it: "Acqua",
    pt: "Água",
  },
  "I am vegetarian": {
    en: "I am vegetarian",
    hi: "मैं शाकाहारी हूँ",
    fr: "Je suis végétarien",
    ja: "私はベジタリアンです",
    ar: "أنا نباتي",
    es: "Soy vegetariano",
    zh: "我是素食者",
    de: "Ich bin Vegetarier",
    it: "Sono vegetariano",
    pt: "Sou vegetariano",
  },
  "The bill, please": {
    en: "The bill, please",
    hi: "बिल लाइए",
    fr: "L'addition, s'il vous plaît",
    ja: "お勘定をお願いします",
    ar: "الفاتورة من فضلك",
    es: "La cuenta, por favor",
    zh: "请买单",
    de: "Die Rechnung, bitte",
    it: "Il conto, per favore",
    pt: "A conta, por favor",
  },
  "Call the police!": {
    en: "Call the police!",
    hi: "पुलिस को बुलाओ!",
    fr: "Appelez la police!",
    ja: "警察を呼んで!",
    ar: "اتصل بالشرطة!",
    es: "¡Llame a la policía!",
    zh: "叫警察！",
    de: "Rufen Sie die Polizei!",
    it: "Chiama la polizia!",
    pt: "Chame a polícia!",
  },
  "I need a doctor": {
    en: "I need a doctor",
    hi: "मुझे डॉक्टर चाहिए",
    fr: "J'ai besoin d'un médecin",
    ja: "医者が必要です",
    ar: "أحتاج إلى طبيب",
    es: "Necesito un médico",
    zh: "我需要医生",
    de: "Ich brauche einen Arzt",
    it: "Ho bisogno di un medico",
    pt: "Preciso de um médico",
  },
};

const VOCAB_TABS = [
  {
    id: "greetings",
    label: "Greetings",
    phrases: [
      "Hello",
      "Good morning",
      "Goodbye",
      "Thank you",
      "I don't understand",
    ],
  },
  { id: "numbers", label: "Numbers", phrases: ["One", "Two", "Five", "Ten"] },
  {
    id: "directions",
    label: "Directions",
    phrases: [
      "Turn left",
      "Turn right",
      "Straight ahead",
      "Where is the hotel?",
      "Where is the airport?",
    ],
  },
  {
    id: "food",
    label: "Food",
    phrases: [
      "Water",
      "I am vegetarian",
      "Where is the restaurant?",
      "How much does it cost?",
      "The bill, please",
    ],
  },
  {
    id: "emergency",
    label: "Emergency",
    phrases: [
      "Help!",
      "Emergency!",
      "Call the police!",
      "I need a doctor",
      "Where is the toilet?",
    ],
  },
];

const COMMON_PHRASES = [
  "Hello",
  "Thank you",
  "Where is the hotel?",
  "How much does it cost?",
  "Help!",
  "Emergency!",
  "Where is the toilet?",
  "Where is the restaurant?",
  "Where is the airport?",
  "I need a doctor",
];

function getPhrase(key: string, lang: LangCode): string {
  return PHRASE_BANK[key]?.[lang] ?? key;
}

function simulateTranslate(text: string, target: LangCode): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const exact = PHRASE_BANK[trimmed];
  if (exact?.[target]) return exact[target] as string;
  const found = Object.keys(PHRASE_BANK).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase(),
  );
  if (found) return PHRASE_BANK[found][target] ?? trimmed;
  return `[Translated: ${trimmed}]`;
}

// Check if SpeechRecognition is available
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult:
    | ((event: {
        results: { [k: number]: { [k: number]: { transcript: string } } };
      }) => void)
    | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => ISpeechRecognition;

const SpeechRecognitionAPI: SpeechRecognitionCtor | null =
  typeof window !== "undefined"
    ? (((window as unknown as Record<string, unknown>).SpeechRecognition as
        | SpeechRecognitionCtor
        | undefined) ??
      ((window as unknown as Record<string, unknown>).webkitSpeechRecognition as
        | SpeechRecognitionCtor
        | undefined) ??
      null)
    : null;

export default function LanguageTranslator() {
  const [sourceLang, setSourceLang] = useState<LangCode>("en");
  const [targetLang, setTargetLang] = useState<LangCode>("hi");
  const [inputText, setInputText] = useState<string>("");
  const [translated, setTranslated] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("greetings");

  // Validation state
  const [attemptedTranslate, setAttemptedTranslate] = useState(false);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string>("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Spoken translation display
  const [spokenResult, setSpokenResult] = useState<string>("");

  const srcLang = LANGUAGES.find((l) => l.code === sourceLang);
  const tgtLang = LANGUAGES.find((l) => l.code === targetLang);

  const commonPhrasePairs = useMemo(
    () =>
      COMMON_PHRASES.map((phrase) => ({
        key: phrase,
        source: getPhrase(phrase, sourceLang),
        target: getPhrase(phrase, targetLang),
      })),
    [sourceLang, targetLang],
  );

  // Stop recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  function handleTranslate() {
    setAttemptedTranslate(true);
    if (!inputText.trim()) return;
    setTranslated(simulateTranslate(inputText, targetLang));
  }

  function handleCopy() {
    if (!translated) return;
    navigator.clipboard.writeText(translated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Translation copied to clipboard!");
    });
  }

  function swapLanguages() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translated);
    setTranslated(inputText);
  }

  /** Speak text via SpeechSynthesis */
  function speakText(text: string, langCode: string) {
    if (
      !text.trim() ||
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      toast.info("Text-to-speech is not available in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  /** Start microphone / speech recognition */
  const startListening = useCallback(
    (lang: LangCode, onResult: (text: string) => void) => {
      setMicError("");

      if (!SpeechRecognitionAPI) {
        setMicError(
          "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
        );
        return;
      }

      // Stop any existing session
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognitionAPI();
      const srcLangObj = LANGUAGES.find((l) => l.code === lang);
      recognition.lang = srcLangObj?.speechCode ?? "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "denied") {
          setMicError(
            "Microphone permission denied. Please allow mic access in your browser settings.",
          );
        } else if (event.error === "no-speech") {
          setMicError("No speech detected. Please try again.");
        } else {
          setMicError(`Speech recognition error: ${event.error}`);
        }
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [],
  );

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }

  /** Mic button in the translator card — fills input then auto-translates */
  function handleMicInput() {
    if (isListening) {
      stopListening();
      return;
    }
    startListening(sourceLang, (text) => {
      setInputText(text);
      const result = simulateTranslate(text, targetLang);
      setTranslated(result);
    });
  }

  /** Standalone "Tap to Speak" button at top — speaks result aloud too */
  function handleTapToSpeak() {
    if (isListening) {
      stopListening();
      return;
    }
    startListening(sourceLang, (text) => {
      setInputText(text);
      const result = simulateTranslate(text, targetLang);
      setTranslated(result);
      setSpokenResult(result);
      // Speak translation
      const tgtLangObj = LANGUAGES.find((l) => l.code === targetLang);
      if (tgtLangObj) speakText(result, tgtLangObj.speechCode);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-card border-b shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Travel Tool
              </Badge>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Language Translator
            </h1>
            <p className="text-muted-foreground mt-1">
              Communicate confidently in 10 languages. Speak, translate, and
              listen.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Standalone Tap to Speak ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h2 className="font-display font-semibold text-base text-foreground mb-0.5">
                  🎙 Speak & Translate Instantly
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tap the mic, speak in {srcLang?.name}, get translation in{" "}
                  {tgtLang?.name} + spoken aloud.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTapToSpeak}
                className={`relative flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                  isListening
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                }`}
                aria-label={isListening ? "Stop listening" : "Tap to speak"}
                data-ocid="tap-to-speak-btn"
              >
                {isListening ? (
                  <>
                    <span className="relative flex h-8 w-8">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 items-center justify-center">
                        <MicOff className="w-4 h-4 text-white" />
                      </span>
                    </span>
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8" />
                    <span>Tap to Speak</span>
                  </>
                )}
              </button>
            </div>

            {/* Mic error */}
            {micError && (
              <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                ⚠️ {micError}
              </div>
            )}

            {/* Spoken result display */}
            <AnimatePresence>
              {spokenResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 overflow-hidden"
                  data-ocid="spoken-result"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Spoken Translation
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const tL = LANGUAGES.find((l) => l.code === targetLang);
                        if (tL) speakText(spokenResult, tL.speechCode);
                      }}
                      className="p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                      aria-label="Speak again"
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {spokenResult}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Spoken in {tgtLang?.flag} {tgtLang?.name}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ── Main Translator Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-6">
            {/* Language pickers */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1">
                <Select
                  value={sourceLang}
                  onValueChange={(v) => setSourceLang(v as LangCode)}
                >
                  <SelectTrigger data-ocid="translator-source-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.flag} {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={swapLanguages}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-fast"
                aria-label="Swap languages"
                data-ocid="translator-swap-btn"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <Select
                  value={targetLang}
                  onValueChange={(v) => setTargetLang(v as LangCode)}
                >
                  <SelectTrigger data-ocid="translator-target-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.flag} {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {sourceLang === targetLang && (
              <p className="text-red-500 text-xs mb-3">
                Please select different source and target languages
              </p>
            )}

            {/* Input + Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {srcLang?.flag} {srcLang?.name}
                  </p>
                  {/* Mic button in the input area */}
                  <button
                    type="button"
                    onClick={handleMicInput}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      isListening
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-primary"
                    }`}
                    aria-label={
                      isListening ? "Stop recording" : "Start voice input"
                    }
                    data-ocid="mic-input-btn"
                  >
                    {isListening ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <MicOff className="w-3.5 h-3.5" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" /> Voice
                      </>
                    )}
                  </button>
                </div>
                <Textarea
                  placeholder="Type or speak text to translate..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.trim()) setAttemptedTranslate(false);
                  }}
                  className="min-h-[140px] resize-none"
                  data-ocid="translator-input"
                />
                {attemptedTranslate && !inputText.trim() && (
                  <p className="text-muted-foreground text-xs mt-1">
                    Enter text to translate
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {tgtLang?.flag} {tgtLang?.name}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1.5 rounded-md hover:bg-muted transition-fast"
                      aria-label="Copy translation"
                      data-ocid="translator-copy-btn"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-md hover:bg-muted transition-fast"
                      aria-label="Read aloud"
                      data-ocid="translator-speak-btn"
                      onClick={() => {
                        if (!translated) {
                          toast.info(
                            "Nothing to speak. Please translate first.",
                          );
                          return;
                        }
                        const tL = LANGUAGES.find((l) => l.code === targetLang);
                        if (tL) speakText(translated, tL.speechCode);
                      }}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div
                  className={`min-h-[140px] rounded-md border border-input bg-muted/30 p-3 text-sm leading-relaxed ${translated ? "text-foreground" : "text-muted-foreground"}`}
                  data-ocid="translator-output"
                >
                  {translated || "Translation will appear here..."}
                </div>
              </div>
            </div>

            {/* Translate button */}
            <Button
              type="button"
              className={`w-full ${!inputText.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!inputText.trim()}
              onClick={handleTranslate}
              data-ocid="translator-translate-btn"
            >
              <Languages className="w-4 h-4 mr-2" />
              Translate
            </Button>
          </Card>
        </motion.div>

        {/* Common phrases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="font-display font-semibold text-lg text-foreground mb-1">
              Common Travel Phrases
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {srcLang?.flag} {srcLang?.name} → {tgtLang?.flag} {tgtLang?.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {commonPhrasePairs.map(({ key, source, target }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setInputText(key);
                    setTranslated(target);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-smooth text-left group"
                  data-ocid={`common-phrase-${key.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {source}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {target}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Speak ${key}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const tL = LANGUAGES.find((l) => l.code === targetLang);
                      if (tL) speakText(target, tL.speechCode);
                    }}
                    className="p-1.5 rounded-md hover:bg-muted ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-fast"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Travel vocabulary tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="font-display font-semibold text-lg text-foreground mb-4">
              Travel Vocabulary
            </h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1 mb-4">
                {VOCAB_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    data-ocid={`vocab-tab-${tab.id}`}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <AnimatePresence mode="wait">
                {VOCAB_TABS.map((tab) =>
                  tab.id === activeTab ? (
                    <TabsContent key={tab.id} value={tab.id} forceMount>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        {tab.phrases.map((phrase) => {
                          const srcPhrase = getPhrase(phrase, sourceLang);
                          const tgtPhrase = getPhrase(phrase, targetLang);
                          return (
                            <div
                              key={phrase}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 group"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground">
                                  {srcLang?.flag} {srcPhrase}
                                </span>
                              </div>
                              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground">
                                  {tgtLang?.flag} {tgtPhrase}
                                </span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-fast">
                                <button
                                  type="button"
                                  aria-label="Copy phrase"
                                  onClick={() => {
                                    navigator.clipboard.writeText(tgtPhrase);
                                    toast.success("Copied!");
                                  }}
                                  className="p-1 rounded hover:bg-muted transition-fast"
                                >
                                  <Copy className="w-3 h-3 text-muted-foreground" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Speak phrase"
                                  onClick={() => {
                                    const tL = LANGUAGES.find(
                                      (l) => l.code === targetLang,
                                    );
                                    if (tL) speakText(tgtPhrase, tL.speechCode);
                                  }}
                                  className="p-1 rounded hover:bg-muted transition-fast"
                                >
                                  <Volume2 className="w-3 h-3 text-muted-foreground" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    </TabsContent>
                  ) : null,
                )}
              </AnimatePresence>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
