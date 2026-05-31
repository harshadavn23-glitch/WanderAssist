// SurprisePlanner.tsx — /surprise-planner
// R4: Auto-generate unique SP##### code after plan setup. Remove code INPUT field.
// The generated code is saved to localStorage so TravelPlan.tsx can validate it.
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { destinations } from "@/data/destinations";
import { saveGeneratedPlan } from "@/data/surprisePlans";
import type { Destination, SurprisePlan } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import {
  Cake,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  Flower2,
  Gift,
  Heart,
  MapPin,
  Sparkles,
  User,
  UtensilsCrossed,
  Wallet,
  Waves,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type Occasion =
  | "Birthday"
  | "Proposal"
  | "Anniversary"
  | "Graduation"
  | "Retirement";
type Relationship = "partner" | "friend" | "family" | "parent";

interface DecorationPkg {
  id: string;
  label: string;
  icon: React.ReactNode;
  price: number;
}

const OCCASIONS: {
  id: Occasion;
  emoji: string;
  label: string;
  gradient: string;
}[] = [
  {
    id: "Birthday",
    emoji: "🎂",
    label: "Birthday",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "Proposal",
    emoji: "💍",
    label: "Proposal",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "Anniversary",
    emoji: "❤️",
    label: "Anniversary",
    gradient: "from-red-500 to-rose-600",
  },
  {
    id: "Graduation",
    emoji: "🎓",
    label: "Graduation",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "Retirement",
    emoji: "🌟",
    label: "Retirement",
    gradient: "from-amber-500 to-yellow-500",
  },
];

const OCCASION_DESTINATIONS: Record<Occasion, string[]> = {
  Proposal: ["paris", "maldives", "bali", "kerala"],
  Birthday: ["goa", "dubai", "singapore", "bali"],
  Anniversary: ["paris", "maldives", "kerala", "bali"],
  Graduation: ["singapore", "bali", "goa", "dubai"],
  Retirement: ["kerala", "goa", "pondicherry", "manali"],
};

const OCCASION_PACKAGES: Record<Occasion, string> = {
  Proposal: "Romantic Getaway",
  Birthday: "Celebration Package",
  Anniversary: "Lovers' Retreat",
  Graduation: "Achievement Escape",
  Retirement: "Golden Journey",
};

const DECORATIONS: DecorationPkg[] = [
  {
    id: "flowers",
    label: "Flower Arrangement",
    icon: <Flower2 size={18} />,
    price: 3500,
  },
  {
    id: "candle",
    label: "Candlelight Dinner",
    icon: <UtensilsCrossed size={18} />,
    price: 5000,
  },
  { id: "cake", label: "Cake Delivery", icon: <Cake size={18} />, price: 1800 },
  {
    id: "photo",
    label: "Photo Session",
    icon: <Camera size={18} />,
    price: 8000,
  },
  { id: "spa", label: "Spa Package", icon: <Waves size={18} />, price: 6500 },
];

const BUDGET_MIN = 20000;
const BUDGET_MAX = 300000;

function ConfettiPiece({
  delay,
  left,
  color,
}: { delay: number; left: number; color: string }) {
  return (
    <span
      className={`absolute top-0 w-2 h-2 rounded-sm opacity-0 ${color}`}
      style={{
        left: `${left}%`,
        animation: `confettiFall 1.2s ease-in ${delay}s forwards`,
      }}
    />
  );
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: (i % 6) * 0.08,
    left: (i * 37 + 5) % 95,
    color: [
      "bg-amber-400",
      "bg-primary",
      "bg-pink-400",
      "bg-violet-400",
      "bg-cyan-400",
      "bg-emerald-400",
    ][i % 6],
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      {pieces.map((p) => (
        <ConfettiPiece
          key={p.id}
          delay={p.delay}
          left={p.left}
          color={p.color}
        />
      ))}
    </div>
  );
}

interface DestinationCardProps {
  dest: Destination;
  selected: boolean;
  occasion: Occasion;
  onSelect: (id: string) => void;
}

function DestCard({
  dest,
  selected,
  occasion,
  onSelect,
}: DestinationCardProps) {
  const price = dest.costPerPerson ?? dest.pricePerPerson ?? 0;
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(dest.id)}
      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-smooth w-full text-left ${selected ? "border-amber-500 shadow-elevated" : "border-white/20 hover:border-amber-400/50"}`}
      data-ocid="destination-card"
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover transition-smooth hover:scale-105"
        />
        {selected && (
          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
            <CheckCircle2 className="text-amber-400 w-8 h-8 drop-shadow" />
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-xs font-semibold text-white">
            {OCCASION_PACKAGES[occasion]}
          </p>
        </div>
      </div>
      <div className="p-3 bg-card/90">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-foreground text-sm">{dest.name}</h4>
          <Badge variant="secondary" className="text-xs">
            ₹{(price / 1000).toFixed(0)}K/person
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {dest.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {dest.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge-accent text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

function SectionHeading({
  step,
  title,
  icon,
}: { step: number; title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {step}
      </span>
      <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
        {icon && <span className="text-amber-500">{icon}</span>}
        {title}
      </h2>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

/** Generate a unique SP##### code not already in localStorage */
function generateUniqueCode(): string {
  const stored = localStorage.getItem("wanderassist-surprise-plans");
  const existing = stored
    ? Object.keys(JSON.parse(stored) as Record<string, unknown>)
    : [];
  let code: string;
  do {
    code = `SP${String(Math.floor(10000 + Math.random() * 90000))}`;
  } while (existing.includes(code));
  return code;
}

export default function SurprisePlanner() {
  const navigate = useNavigate();
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [surpriseDate, setSurpriseDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("partner");
  const [budget, setBudget] = useState(80000);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [activeDecorations, setActiveDecorations] = useState<Set<string>>(
    new Set(),
  );
  const [showConfetti, setShowConfetti] = useState(false);

  // Generated code state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Validation errors
  const [generateErrors, setGenerateErrors] = useState<{
    occasion?: string;
    destination?: string;
  }>({});

  const suggestedDestIds = occasion ? OCCASION_DESTINATIONS[occasion] : [];
  const suggestedDests: Destination[] = suggestedDestIds
    .map((id) => destinations.find((d) => d.id === id))
    .filter((d): d is Destination => !!d);
  const decorationTotal = Array.from(activeDecorations).reduce((sum, id) => {
    const pkg = DECORATIONS.find((d) => d.id === id);
    return sum + (pkg?.price ?? 0);
  }, 0);
  const selectedDest = destinations.find((d) => d.id === selectedDestId);
  const destCost = selectedDest
    ? (selectedDest.costPerPerson ?? selectedDest.pricePerPerson ?? 0)
    : 0;
  const totalCost = destCost + decorationTotal;

  const toggleDecoration = useCallback((id: string) => {
    setActiveDecorations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleGenerateCode = useCallback(() => {
    // Validate required fields
    const errs: { occasion?: string; destination?: string } = {};
    if (!occasion) errs.occasion = "Please select an occasion";
    if (!selectedDestId) errs.destination = "Please select a destination";
    if (Object.keys(errs).length > 0) {
      setGenerateErrors(errs);
      return;
    }
    setGenerateErrors({});
    if (!selectedDest || !occasion) return;
    setShowConfetti(true);

    const code = generateUniqueCode();

    // Build plan and persist to localStorage
    const decorationLabels = Array.from(activeDecorations)
      .map((id) => DECORATIONS.find((d) => d.id === id)?.label ?? id)
      .filter(Boolean);

    const itinerary = selectedDest
      ? [
          `Day 1: Arrive at ${selectedDest.name}, check-in & welcome`,
          "Day 2: Explore local highlights",
          `Day 3: ${OCCASION_PACKAGES[occasion]} experience`,
          "Day 4: Leisure & relaxation",
          "Day 5: Departure",
        ]
      : ["Full itinerary will be revealed at destination!"];

    const plan: SurprisePlan = {
      code,
      destination: selectedDest.name,
      occasion,
      description: `${OCCASION_PACKAGES[occasion]} to ${selectedDest.name}`,
      cost: totalCost || budget,
      days: 5,
      decorations:
        decorationLabels.length > 0 ? decorationLabels : ["Surprise awaits!"],
      itinerary,
      bookingCode: code,
    };

    saveGeneratedPlan(plan);
    setGeneratedCode(code);

    setTimeout(() => setShowConfetti(false), 1500);
  }, [
    selectedDest,
    occasion,
    selectedDestId,
    totalCost,
    budget,
    activeDecorations,
  ]);

  const handleCopyCode = useCallback(() => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCodeCopied(true);
      toast.success("Code copied! Paste it in the Travel Plan page.");
      setTimeout(() => setCodeCopied(false), 2500);
    });
  }, [generatedCode]);

  const handleGoToTravelPlan = useCallback(() => {
    if (!generatedCode || !selectedDest) return;
    navigate({
      to: "/travel-plan",
      search: {
        destination: selectedDest.name,
        surprisePlanCode: generatedCode,
        tourType: "surprise",
        budget: String(totalCost || budget),
      },
    });
  }, [generatedCode, selectedDest, totalCost, budget, navigate]);

  const canGenerate = !!occasion && !!selectedDestId;

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(-10px) rotate(0deg); }
          100% { opacity: 0; transform: translateY(420px) rotate(720deg); }
        }
      `}</style>

      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{
          background:
            "linear-gradient(160deg, #1a0038 0%, #0a1628 40%, #1a0028 70%, #0a1628 100%)",
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {Array.from(
            { length: 20 },
            (_, i) => `star-pos-${(i * 17) % 90}-${(i * 23) % 95}`,
          ).map((key, i) => (
            <div
              key={key}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${(i * 17) % 90}%`,
                left: `${(i * 23) % 95}%`,
                animationDelay: `${(i * 0.3) % 2}s`,
              }}
            />
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
            <Gift className="w-10 h-10 text-amber-400" />
            <Sparkles className="w-8 h-8 text-violet-400" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl md:text-5xl font-display font-bold text-white text-shadow-hero mb-3"
          >
            Plan a Perfect Surprise
          </motion.h1>
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-white/70"
          >
            Birthdays, proposals, anniversaries — make it magical ✨
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Step 1: Occasion */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading step={1} title="Choose the Occasion" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {OCCASIONS.map((occ, i) => (
              <motion.button
                key={occ.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                onClick={() => {
                  setOccasion(occ.id);
                  setSelectedDestId(null);
                  setGeneratedCode(null);
                  setGenerateErrors((e) => ({ ...e, occasion: undefined }));
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-smooth cursor-pointer ${occasion === occ.id ? `bg-gradient-to-br ${occ.gradient} border-white/30 shadow-elevated` : "border-border bg-card hover:border-amber-500/50 hover:shadow-subtle"}`}
                data-ocid={`occasion-${occ.id.toLowerCase()}`}
              >
                <span className="text-3xl leading-none">{occ.emoji}</span>
                <span
                  className={`text-xs font-semibold text-center ${occasion === occ.id ? "text-white" : "text-foreground"}`}
                >
                  {occ.label}
                </span>
              </motion.button>
            ))}
          </div>
          {generateErrors.occasion && (
            <p className="text-red-500 text-xs mt-2">
              {generateErrors.occasion}
            </p>
          )}
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading
            step={2}
            title="Select Surprise Date"
            icon={<Calendar size={18} />}
          />
          <div className="mt-4 max-w-xs">
            <Label
              htmlFor="surprise-date"
              className="text-sm font-medium mb-2 block"
            >
              When is the special day?
            </Label>
            <Input
              id="surprise-date"
              type="date"
              value={surpriseDate}
              onChange={(e) => setSurpriseDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-card border-input"
              data-ocid="surprise-date-input"
            />
          </div>
        </motion.section>

        {/* Step 3: Who */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading
            step={3}
            title="Who Is It For?"
            icon={<User size={18} />}
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <Label
                htmlFor="recipient-name"
                className="text-sm font-medium mb-2 block"
              >
                Their Name
              </Label>
              <Input
                id="recipient-name"
                type="text"
                placeholder="e.g. Priya"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="bg-card border-input"
                data-ocid="recipient-name-input"
              />
            </div>
            <div>
              <Label
                htmlFor="relationship"
                className="text-sm font-medium mb-2 block"
              >
                Relationship
              </Label>
              <Select
                value={relationship}
                onValueChange={(v) => setRelationship(v as Relationship)}
              >
                <SelectTrigger
                  id="relationship"
                  className="bg-card border-input"
                  data-ocid="relationship-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">Partner / Spouse</SelectItem>
                  <SelectItem value="friend">Best Friend</SelectItem>
                  <SelectItem value="family">Family Member</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.section>

        {/* Step 4: Budget */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading
            step={4}
            title="Your Budget"
            icon={<Wallet size={18} />}
          />
          <div className="mt-4 max-w-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                ₹{BUDGET_MIN.toLocaleString("en-IN")}
              </span>
              <span className="font-semibold text-amber-500 text-base">
                ₹{budget.toLocaleString("en-IN")}
              </span>
              <span className="text-muted-foreground">
                ₹{BUDGET_MAX.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer accent-amber-500"
              data-ocid="budget-slider"
            />
          </div>
        </motion.section>

        {/* Step 5: Destinations */}
        <AnimatePresence mode="wait">
          {occasion && (
            <motion.section
              key={`dests-${occasion}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <SectionHeading
                step={5}
                title={`Top Picks for ${occasion}`}
                icon={<MapPin size={18} />}
              />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedDests.map((dest, i) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                  >
                    <DestCard
                      dest={dest}
                      selected={selectedDestId === dest.id}
                      occasion={occasion}
                      onSelect={(id) => {
                        setSelectedDestId(id);
                        setGeneratedCode(null);
                        setGenerateErrors((e) => ({
                          ...e,
                          destination: undefined,
                        }));
                      }}
                    />
                  </motion.div>
                ))}
              </div>
              {generateErrors.destination && (
                <p className="text-red-500 text-xs mt-2">
                  {generateErrors.destination}
                </p>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 6: Decorations */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading
            step={6}
            title="Special Decoration Packages"
            icon={<Sparkles size={18} />}
          />
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Toggle to add to your plan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DECORATIONS.map((pkg, i) => {
              const active = activeDecorations.has(pkg.id);
              return (
                <motion.button
                  key={pkg.id}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  onClick={() => toggleDecoration(pkg.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-smooth ${active ? "border-amber-500 bg-amber-500/5 shadow-subtle" : "border-border bg-card hover:border-amber-500/50"}`}
                  data-ocid={`decoration-${pkg.id}`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    {pkg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {pkg.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +₹{pkg.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {active && (
                    <CheckCircle2
                      size={16}
                      className="text-amber-500 flex-shrink-0"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Summary + Generate Code */}
        <AnimatePresence>
          {canGenerate && (
            <motion.section
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="relative"
              data-ocid="plan-summary"
            >
              <Card
                className="p-6 border-amber-500/40 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(240,165,0,0.06) 0%, rgba(30,58,95,0.4) 100%)",
                }}
              >
                {showConfetti && <ConfettiOverlay />}
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-amber-500 w-5 h-5" />
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Your Surprise Plan Summary
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {occasion && (
                    <SummaryRow
                      label="Occasion"
                      value={`${OCCASIONS.find((o) => o.id === occasion)?.emoji} ${occasion}`}
                    />
                  )}
                  {selectedDest && (
                    <SummaryRow label="Destination" value={selectedDest.name} />
                  )}
                  {surpriseDate && (
                    <SummaryRow
                      label="Date"
                      value={new Date(surpriseDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    />
                  )}
                  {recipientName && (
                    <SummaryRow
                      label="Surprise For"
                      value={`${recipientName} (${relationship})`}
                    />
                  )}
                </div>
                {activeDecorations.size > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Add-ons
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(activeDecorations).map((id) => {
                        const pkg = DECORATIONS.find((d) => d.id === id);
                        return pkg ? (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {pkg.label} +₹{pkg.price.toLocaleString("en-IN")}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Estimated Total
                      </p>
                      <p className="text-2xl font-display font-bold text-amber-500">
                        ₹{(totalCost || budget).toLocaleString("en-IN")}
                      </p>
                    </div>
                    {!generatedCode && (
                      <Button
                        type="button"
                        size="lg"
                        onClick={handleGenerateCode}
                        disabled={showConfetti}
                        className="gap-2 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-hero"
                        data-ocid="generate-surprise-code-btn"
                      >
                        {showConfetti ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />{" "}
                            Generating...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4" /> Generate Surprise Code
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Generated code display */}
                  <AnimatePresence>
                    {generatedCode && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-2xl border-2 border-amber-400/60 bg-amber-50/80 dark:bg-amber-900/20 p-5 space-y-3"
                        data-ocid="generated-code-box"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                          <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                            Your Surprise Plan Code is Ready!
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 font-mono text-3xl font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 rounded-xl px-4 py-2 text-center border border-amber-200 dark:border-amber-700/40">
                            {generatedCode}
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-700 dark:text-amber-400"
                            aria-label="Copy code"
                            data-ocid="copy-code-btn"
                          >
                            {codeCopied ? (
                              <ClipboardCheck className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clipboard className="w-5 h-5" />
                            )}
                            <span className="text-xs font-semibold">
                              {codeCopied ? "Copied!" : "Copy"}
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                          📌 Copy this code and enter it in the{" "}
                          <strong>Travel Plan</strong> booking (the "Have a
                          Surprise Code?" banner) to unlock your surprise
                          destination!
                        </p>
                        <Button
                          type="button"
                          onClick={handleGoToTravelPlan}
                          className="w-full gap-2 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                          data-ocid="go-to-travel-plan-btn"
                        >
                          Go to Travel Plan <ChevronRight className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {!canGenerate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 text-muted-foreground text-sm"
            data-ocid="plan-cta-hint"
          >
            <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Select an occasion and destination to build your plan
          </motion.div>
        )}
      </div>
    </div>
  );
}
