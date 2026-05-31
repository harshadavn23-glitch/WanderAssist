/**
 * TravelPlan — 5-step booking wizard
 * Steps: 1.Destination  2.Travel Type  3.Details  4.Guide  5.Preferences
 * R1: Family type → adults + children count instead of gender selector.
 */
import { BookingConfirmation } from "@/components/BookingConfirmation";
import { PaymentModal } from "@/components/PaymentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getSurprisePlan } from "@/data/surprisePlans";
import { tourGuides } from "@/data/tourGuides";
import { useBookings } from "@/hooks/useBookings";
import { useSession } from "@/hooks/useSession";
import type { BookingDetails, SurprisePlan } from "@/types/travel";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Leaf,
  MapPin,
  Minus,
  Plus,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TravelPlanSearch {
  destination?: string;
  budget?: string | number;
  days?: string | number;
  travelers?: string | number;
  tourType?: string;
  packageType?: string;
  surprisePlanCode?: string;
}

interface TravelerInfo {
  name: string;
  email: string;
  phone: string;
}

type TravelTypeKey = "solo" | "family" | "friends" | "corporate";
type PlanTier = "budget" | "standard" | "luxury";
type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";
type Season = "Spring" | "Summer" | "Monsoon" | "Autumn" | "Winter";
type DaysOption = 3 | 5 | 7 | 10 | 14 | 21;

// ─── Static data ──────────────────────────────────────────────────────────────
const INDIAN_DESTINATIONS = [
  {
    id: "dest-goa",
    name: "Goa",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop",
  },
  {
    id: "dest-kerala",
    name: "Kerala",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop",
  },
  {
    id: "dest-mumbai",
    name: "Mumbai",
    img: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&h=250&fit=crop",
  },
  {
    id: "dest-chennai",
    name: "Chennai",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=250&fit=crop",
  },
  {
    id: "dest-delhi",
    name: "Delhi",
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=250&fit=crop",
  },
  {
    id: "dest-jaipur",
    name: "Jaipur",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=250&fit=crop",
  },
  {
    id: "dest-manali",
    name: "Manali",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop",
  },
  {
    id: "dest-ladakh",
    name: "Ladakh",
    img: "https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=400&h=250&fit=crop",
  },
  {
    id: "dest-pondicherry",
    name: "Pondicherry",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=250&fit=crop",
  },
  {
    id: "dest-bangalore",
    name: "Bangalore",
    img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=250&fit=crop",
  },
];

const INTL_DESTINATIONS = [
  {
    id: "dest-bali",
    name: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop",
  },
  {
    id: "dest-paris",
    name: "Paris, France",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop",
  },
  {
    id: "dest-dubai",
    name: "Dubai, UAE",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop",
  },
  {
    id: "dest-tokyo",
    name: "Tokyo, Japan",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop",
  },
  {
    id: "dest-newyork",
    name: "New York, USA",
    img: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=250&fit=crop",
  },
  {
    id: "dest-london",
    name: "London, UK",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop",
  },
  {
    id: "dest-singapore",
    name: "Singapore",
    img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=250&fit=crop",
  },
  {
    id: "dest-maldives",
    name: "Maldives",
    img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=250&fit=crop",
  },
  {
    id: "dest-switzerland",
    name: "Switzerland",
    img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=250&fit=crop",
  },
  {
    id: "dest-thailand",
    name: "Thailand",
    img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=250&fit=crop",
  },
];

const TRAVEL_TYPES: {
  key: TravelTypeKey;
  icon: string;
  label: string;
  subtitle: string;
}[] = [
  { key: "solo", icon: "🧍", label: "Solo", subtitle: "Traveling alone" },
  {
    key: "family",
    icon: "👨‍👩‍👧‍👦",
    label: "Family",
    subtitle: "With family members",
  },
  {
    key: "friends",
    icon: "👫",
    label: "Friends",
    subtitle: "Group of friends",
  },
  {
    key: "corporate",
    icon: "💼",
    label: "Corporate",
    subtitle: "Business trip",
  },
];

const FOOD_PREFS = [
  { key: "Vegetarian", emoji: "🥗" },
  { key: "Non-Vegetarian", emoji: "🍗" },
  { key: "Vegan", emoji: "🌱" },
  { key: "Halal", emoji: "☪️" },
  { key: "Jain", emoji: "🕉️" },
  { key: "No Preference", emoji: "🍽️" },
];

const MOCK_GUIDES = [
  {
    id: "tg-001",
    name: "Arjun Sharma",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviews: 312,
    specialty: "Himalayan Trek & Adventure",
    experience: 12,
    price: 3500,
    languages: ["Hindi", "English", "Punjabi"],
  },
  {
    id: "tg-002",
    name: "Priya Nair",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviews: 278,
    specialty: "Culture & Backwaters",
    experience: 9,
    price: 3000,
    languages: ["Malayalam", "Tamil", "English"],
  },
  {
    id: "tg-003",
    name: "Raj Patel",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviews: 195,
    specialty: "Heritage & Royal Tours",
    experience: 8,
    price: 3200,
    languages: ["Gujarati", "Hindi", "English"],
  },
  {
    id: "tg-004",
    name: "Maya Krishnan",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviews: 421,
    specialty: "Luxury International Tours",
    experience: 15,
    price: 5000,
    languages: ["English", "Japanese", "French"],
  },
  {
    id: "tg-005",
    name: "Ahmed Al-Rashid",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviews: 256,
    specialty: "Desert Safari & Middle East",
    experience: 11,
    price: 4200,
    languages: ["Arabic", "English", "Urdu"],
  },
  {
    id: "tg-006",
    name: "Sarah Thompson",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviews: 334,
    specialty: "European City & Art History",
    experience: 10,
    price: 4500,
    languages: ["English", "Spanish", "Portuguese"],
  },
  {
    id: "tg-007",
    name: "Vikram Reddy",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviews: 189,
    specialty: "Wildlife & Photography",
    experience: 7,
    price: 2800,
    languages: ["Telugu", "Hindi", "English"],
  },
  {
    id: "tg-008",
    name: "Meera Iyer",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviews: 367,
    specialty: "Food & Wine Experiences",
    experience: 13,
    price: 4000,
    languages: ["Tamil", "Kannada", "English", "French"],
  },
];

const PLAN_TIERS: {
  key: PlanTier;
  icon: string;
  label: string;
  starting: string;
  desc: string;
  multiplier: number;
}[] = [
  {
    key: "budget",
    icon: "✨",
    label: "Budget",
    starting: "₹15,000",
    desc: "Essential experiences",
    multiplier: 0.7,
  },
  {
    key: "standard",
    icon: "👑",
    label: "Standard",
    starting: "₹35,000",
    desc: "Balanced comfort",
    multiplier: 1.0,
  },
  {
    key: "luxury",
    icon: "💎",
    label: "Luxury",
    starting: "₹75,000",
    desc: "Premium experiences",
    multiplier: 2.0,
  },
];

const SEASONS: Season[] = ["Spring", "Summer", "Monsoon", "Autumn", "Winter"];
const MONTHS: Month[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_OPTIONS: DaysOption[] = [3, 5, 7, 10, 14, 21];

const STEPS = [
  { num: 1, label: "Destination", icon: "📍" },
  { num: 2, label: "Travel Type", icon: "👥" },
  { num: 3, label: "Details", icon: "👤" },
  { num: 4, label: "Guide", icon: "🧭" },
  { num: 5, label: "Preferences", icon: "⭐" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 px-4 overflow-x-auto">
      {STEPS.map((step, idx) => {
        const done = current > step.num;
        const active = current === step.num;
        return (
          <div key={step.num} className="flex items-center gap-0 shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-primary border-primary text-primary-foreground" : "bg-transparent border-muted-foreground/40 text-muted-foreground"}`}
              >
                {done ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span
                className={`text-[10px] font-semibold hidden sm:block ${active ? "text-primary" : done ? "text-green-500" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-0.5 mx-1 mb-5 transition-all ${current > step.num ? "bg-green-500" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </span>
  );
}

// ── Number counter widget ──────────────────────────────────────────────────────
function Counter({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-bold">{label}</Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-bold text-lg text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TravelPlanPage() {
  const search = useSearch({ strict: false }) as TravelPlanSearch;
  const navigate = useNavigate();
  const { isLoggedIn } = useSession();
  const { addBooking } = useBookings();

  const [spCode, setSpCode] = useState(search.surprisePlanCode ?? "");
  const [spError, setSpError] = useState("");
  const [activePlan, setActivePlan] = useState<SurprisePlan | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [destination, setDestination] = useState(search.destination ?? "");
  const [selectedSeason, setSelectedSeason] = useState<Season>("Summer");

  // Resolve URL param destination to full card name (e.g. "Bali" → "Bali, Indonesia")
  useEffect(() => {
    if (!search.destination) return;
    const param = search.destination.trim().toLowerCase();
    // Check exact match first
    const allCards = [...INDIAN_DESTINATIONS, ...INTL_DESTINATIONS];
    const exact = allCards.find((d) => d.name.toLowerCase() === param);
    if (exact) {
      setDestination(exact.name);
      return;
    }
    // Partial match — e.g. "Bali" matches "Bali, Indonesia"
    const partial = allCards.find((d) =>
      d.name.toLowerCase().startsWith(param),
    );
    if (partial) {
      setDestination(partial.name);
    }
  }, [search.destination]);
  const [selectedMonth, setSelectedMonth] = useState<Month>("Jan");
  const [startDate, setStartDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<DaysOption>(5);
  const [travelType, setTravelType] = useState<TravelTypeKey | null>(null);
  const [accessibility, setAccessibility] = useState(false);

  // Non-family traveler count
  const [travelers, setTravelers] = useState(
    search.travelers ? Math.min(10, Math.max(1, Number(search.travelers))) : 2,
  );

  // Friends-specific: male + female counters
  const [maleTravelers, setMaleTravelers] = useState(1);
  const [femaleTravelers, setFemaleTravelers] = useState(1);

  // Family-specific: adults + children
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Solo-specific: gender selector
  const [soloGender, setSoloGender] = useState<"Male" | "Female" | "Other">(
    "Male",
  );

  // Corporate-specific: gender breakdown
  const [corporateMale, setCorporateMale] = useState(1);
  const [corporateFemale, setCorporateFemale] = useState(1);
  const [corporateOther, setCorporateOther] = useState(0);

  const [wantGuide, setWantGuide] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [foodPrefs, setFoodPrefs] = useState<string[]>([]);
  const [planTier, setPlanTier] = useState<PlanTier>(
    search.packageType === "Premium"
      ? "luxury"
      : search.packageType === "Economy"
        ? "budget"
        : "standard",
  );
  const [petFriendly, setPetFriendly] = useState(false);
  const [wantsCertificate, setWantsCertificate] = useState(false);
  // Baby flight certificate fields
  const [certBabyName, setCertBabyName] = useState("");
  const [certBabyAgeInput, setCertBabyAgeInput] = useState("");
  const [certDesign, setCertDesign] = useState("");
  // Child under 5 requirements
  const [childUnder5, setChildUnder5] = useState(false);
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [travelerInfo, setTravelerInfo] = useState<TravelerInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (search.surprisePlanCode) {
      const plan = getSurprisePlan(search.surprisePlanCode);
      if (plan) {
        setActivePlan(plan);
        setDestination(plan.destination);
        setSelectedDays(Math.min(21, plan.days) as DaysOption);
      }
    }
  }, [search.surprisePlanCode]);

  if (!isLoggedIn) return null;

  // Effective travelers count
  const effectiveTravelers =
    travelType === "family"
      ? adults + children
      : travelType === "solo"
        ? 1
        : travelType === "friends"
          ? maleTravelers + femaleTravelers
          : travelType === "corporate"
            ? corporateMale + corporateFemale + corporateOther
            : travelers;

  const BASE_COST_PER_PERSON_PER_DAY = 3000;
  const tierMult = PLAN_TIERS.find((t) => t.key === planTier)?.multiplier ?? 1;
  const baseCost =
    BASE_COST_PER_PERSON_PER_DAY * tierMult * effectiveTravelers * selectedDays;

  const realGuides = tourGuides.filter((g) =>
    g.destinations.some((d) =>
      d.toLowerCase().includes(destination.toLowerCase()),
    ),
  );
  const usedIds = new Set(realGuides.map((g) => g.id));
  const extraMock = MOCK_GUIDES.filter((g) => !usedIds.has(g.id));
  const allDisplayGuides = [
    ...realGuides.map((g) => ({
      id: g.id,
      name: g.name,
      photo: g.photo,
      rating: g.rating,
      reviews: g.reviews,
      specialty: g.specialty,
      experience: g.experience,
      price: "price" in g ? (g as { price: number }).price : 3500,
      languages: g.languages,
    })),
    ...extraMock,
  ].slice(0, 8);

  const selectedGuideObj = allDisplayGuides.find(
    (g) => g.id === selectedGuideId,
  );
  const guideCost =
    wantGuide && selectedGuideObj
      ? (selectedGuideObj.price as number) * selectedDays
      : 0;
  const surpriseCost = activePlan ? activePlan.cost : 0;
  const totalCost = baseCost + guideCost + surpriseCost;

  function applyCode() {
    setSpError("");
    const plan = getSurprisePlan(spCode);
    if (!plan) {
      setSpError("Invalid surprise code. Please check and try again.");
      setActivePlan(null);
      return;
    }
    setActivePlan(plan);
    setDestination(plan.destination);
    setSelectedDays(Math.min(21, plan.days) as DaysOption);
  }

  function removeCode() {
    setActivePlan(null);
    setSpCode("");
    setSpError("");
  }

  function toggleFoodPref(p: string) {
    setFoodPrefs((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  function validateStep(step: number): Record<string, string> {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!destination.trim()) {
        errs.destination = "Please select a destination.";
      }
    }

    if (step === 2) {
      if (!travelType) {
        errs.travelType = "Please select a travel type.";
      } else if (travelType === "family" && adults < 1) {
        errs.travelCount = "At least 1 adult is required.";
      } else if (
        travelType === "friends" &&
        maleTravelers + femaleTravelers < 2
      ) {
        errs.travelCount = "At least 2 friends are required.";
      } else if (
        travelType === "corporate" &&
        corporateMale + corporateFemale + corporateOther < 2
      ) {
        errs.travelCount =
          "At least 2 members are required for corporate travel.";
      }
    }

    if (step === 3) {
      // Validate lead traveler info captured in travelerInfo
      if (!travelerInfo.name.trim()) {
        errs.travelerName = "Name is required.";
      }
      if (!travelerInfo.email.trim()) {
        errs.travelerEmail = "Valid email required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(travelerInfo.email)) {
        errs.travelerEmail = "Valid email required.";
      }
      if (
        travelerInfo.phone.trim() &&
        !/^\d{10}$/.test(travelerInfo.phone.replace(/[\s\-+]/g, ""))
      ) {
        errs.travelerPhone = "Valid 10-digit phone required.";
      }
    }

    if (step === 4) {
      if (wantGuide && !selectedGuideId) {
        errs.guide = "Please select a guide.";
      }
      if (foodPrefs.length === 0) {
        errs.foodPreference = "Please select a food preference.";
      }
    }

    if (step === 5) {
      if (selectedDays < 1) {
        errs.selectedDays = "Trip must be at least 1 day.";
      }
      // Baby flight certificate validation
      if (travelType === "family" && children > 0 && wantsCertificate) {
        if (!certBabyName.trim()) {
          errs.certBabyName = "Baby's name is required.";
        }
        if (!certBabyAgeInput.trim()) {
          errs.certBabyAge = "Baby's age is required.";
        } else {
          const ageVal = Number.parseFloat(certBabyAgeInput);
          if (Number.isNaN(ageVal) || ageVal < 0) {
            errs.certBabyAge = "Please enter a valid age.";
          } else if (ageVal >= 2) {
            errs.certBabyAge =
              "Age must be under 2 years for this certificate.";
          }
        }
        if (!certDesign) {
          errs.certDesign = "Please select a certificate design.";
        }
      }
    }

    return errs;
  }

  function handleNextStep() {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors({});
    setCurrentStep((s) => Math.min(5, s + 1));
  }

  function handleGenerate() {
    const errs = validateStep(5);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      // Scroll to top of wizard card so user can see errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStepErrors({});
    // travelType is validated in step 2 — guard anyway
    if (!travelType) {
      setCurrentStep(2);
      setStepErrors({ travelType: "Please select a travel type." });
      return;
    }
    if (!travelerInfo.name.trim() || !travelerInfo.email.trim()) {
      setShowTravelerModal(true);
      return;
    }
    // Determine safe certificate values — only include when all conditions met
    const certActive =
      travelType === "family" && children > 0 && wantsCertificate;
    // Parse age safely — preserve 0 (newborn) as a valid value
    const certAgeNum =
      certActive && certBabyAgeInput.trim() !== ""
        ? Number.parseFloat(certBabyAgeInput)
        : null;
    // Store wizard state for TravelPlanResults to consume
    const travelPlanState = {
      destination,
      season: selectedSeason,
      month: selectedMonth,
      days: selectedDays,
      planType:
        planTier === "luxury"
          ? "Luxury"
          : planTier === "budget"
            ? "Budget"
            : "Standard",
      travelType:
        travelType === "solo"
          ? "Solo"
          : travelType === "family"
            ? "Family"
            : travelType === "friends"
              ? "Friends"
              : "Corporate",
      hasGuide: wantGuide,
      travelers: effectiveTravelers,
      selectedGuide: selectedGuideObj
        ? {
            id: selectedGuideObj.id,
            name: selectedGuideObj.name,
            rating: selectedGuideObj.rating,
          }
        : null,
      // Gender data — use null instead of undefined so JSON.stringify keeps the key
      soloGender: travelType === "solo" ? soloGender : null,
      corporateGender:
        travelType === "corporate"
          ? {
              male: corporateMale,
              female: corporateFemale,
              other: corporateOther,
            }
          : null,
      maleTravelers: travelType === "friends" ? maleTravelers : null,
      femaleTravelers: travelType === "friends" ? femaleTravelers : null,
      wantsCertificate: certActive,
      certBabyName: certActive ? certBabyName : "",
      certBabyAge: certAgeNum,
      certDesign: certActive ? certDesign : "",
      childUnder5:
        travelType === "family" && children > 0 ? childUnder5 : false,
    };
    sessionStorage.setItem("travelPlanState", JSON.stringify(travelPlanState));

    // Also persist a base selectedPlan so detail page has plan data if navigated directly
    const planData = {
      name: `${destination} Trip`,
      days: selectedDays,
      price: Math.round(totalCost / Math.max(1, effectiveTravelers)),
      travelers: effectiveTravelers,
      destination,
      travelType,
      maleTravelers: travelType === "friends" ? maleTravelers : null,
      femaleTravelers: travelType === "friends" ? femaleTravelers : null,
      soloGender: travelType === "solo" ? soloGender : null,
      corporateGender:
        travelType === "corporate"
          ? {
              male: corporateMale,
              female: corporateFemale,
              other: corporateOther,
            }
          : null,
      wantsCertificate: certActive,
      certBabyName: certActive ? certBabyName : "",
      certBabyAge: certAgeNum,
      certDesign: certActive ? certDesign : "",
      childUnder5:
        travelType === "family" && children > 0 ? childUnder5 : false,
    };
    sessionStorage.setItem("selectedPlan", JSON.stringify(planData));

    navigate({ to: "/travel-plans/results" });
  }

  function handlePaymentSuccess(ref: string) {
    setBookingRef(ref);
    setShowPayment(false);
    const booking: BookingDetails = {
      id: ref,
      destination,
      travelers: effectiveTravelers,
      days: selectedDays,
      tourType: wantGuide ? "guided" : "self-guided",
      guideId: selectedGuideId ?? undefined,
      totalCost,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      reference: ref,
      paymentRef: ref,
      costPerPerson: Math.round(totalCost / effectiveTravelers),
      specialRequests: [
        foodPrefs.join(", "),
        travelType === "friends"
          ? `${maleTravelers}M + ${femaleTravelers}F`
          : "",
        wantsCertificate ? "First-Time Travel Certificate" : "",
      ]
        .filter(Boolean)
        .join(" | "),
      surprisePlanCode: activePlan?.code,
    };
    addBooking(booking);
  }

  if (bookingRef) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BookingConfirmation
          bookingRef={bookingRef}
          destination={destination}
          travelers={effectiveTravelers}
          days={selectedDays}
          totalCost={totalCost}
          costPerPerson={Math.round(totalCost / effectiveTravelers)}
          travelStyle={wantGuide ? "With Guide" : "Without Guide"}
          specialRequests={foodPrefs.join(", ")}
          surprisePlan={activePlan}
          onCancelled={() => setBookingRef("")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header */}
      <div
        className="relative py-10 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 to-slate-900/75" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 flex items-center gap-4">
          <MapPin className="w-7 h-7 text-amber-400 shrink-0" />
          <div>
            <h1 className="font-display font-black text-white text-3xl">
              Plan Your Perfect Trip
            </h1>
            <p className="text-white/70 text-sm">
              Complete the steps below to build your custom travel plan
            </p>
          </div>
          {search.tourType === "senior" && (
            <Badge className="ml-auto bg-amber-500/30 text-amber-200 border-amber-400/40">
              🧓 Senior Tour
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ── Surprise Code Banner */}
        <div className="mb-6 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🎁</span>
            <span className="font-bold text-sm text-amber-800 dark:text-amber-300">
              Have a Surprise Code?
            </span>
          </div>
          {!activePlan ? (
            <div className="flex gap-2 flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="E.G., SP12345"
                value={spCode}
                onChange={(e) => {
                  setSpCode(e.target.value.toUpperCase());
                  setSpError("");
                }}
                className="flex-1 px-3 py-2 rounded-lg border font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-600 text-foreground"
                data-ocid="surprise-code-input"
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={!spCode.trim()}
                className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
                data-ocid="apply-code-btn"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <span className="font-bold text-sm text-green-800 dark:text-green-300">
                {activePlan.destination} — {activePlan.occasion} (+₹
                {activePlan.cost.toLocaleString()})
              </span>
              <button
                type="button"
                onClick={removeCode}
                className="ml-auto text-xs font-semibold underline text-amber-700 dark:text-amber-400"
                data-ocid="remove-plan-btn"
              >
                Remove
              </button>
            </div>
          )}
          {spError && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 w-full sm:w-auto">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {spError}
            </div>
          )}
        </div>

        <StepIndicator current={currentStep} />

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 mb-6">
          {/* STEP 1 — DESTINATION */}
          {currentStep === 1 && (
            <div>
              <h2 className="font-display font-black text-2xl text-foreground mb-1">
                Choose Your Destination
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Select where you want to travel
              </p>
              <div className="mb-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  🇮🇳 Indian Destinations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {INDIAN_DESTINATIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDestination(d.name)}
                      className={`relative rounded-xl overflow-hidden transition-all ${destination === d.name ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "ring-2 ring-transparent"}`}
                      style={{ aspectRatio: "4/3" }}
                      data-ocid={`dest-${d.name.toLowerCase()}`}
                    >
                      <img
                        src={d.img}
                        alt={d.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-center text-white font-bold text-xs px-1 leading-tight">
                        {d.name}
                      </span>
                      {destination === d.name && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  🌍 International Destinations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {INTL_DESTINATIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDestination(d.name)}
                      className={`relative rounded-xl overflow-hidden transition-all ${destination === d.name ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "ring-2 ring-transparent"}`}
                      style={{ aspectRatio: "4/3" }}
                      data-ocid={`dest-${d.name.replace(/[^a-z]/gi, "-").toLowerCase()}`}
                    >
                      <img
                        src={d.img}
                        alt={d.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-center text-white font-bold text-xs px-1 leading-tight">
                        {d.name}
                      </span>
                      {destination === d.name && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {stepErrors.destination && (
                <p
                  className="text-red-500 text-xs mt-1 flex items-center gap-1"
                  data-ocid="dest.error_state"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {stepErrors.destination}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wide mb-1.5 block">
                    Season
                  </Label>
                  <select
                    value={selectedSeason}
                    onChange={(e) =>
                      setSelectedSeason(e.target.value as Season)
                    }
                    className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background text-foreground"
                  >
                    {SEASONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wide mb-1.5 block">
                    Month
                  </Label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value as Month)}
                    className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background text-foreground"
                  >
                    {MONTHS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wide mb-1.5 block">
                    Start Date
                  </Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wide mb-1.5 block">
                    Number of Days
                  </Label>
                  <select
                    value={selectedDays}
                    onChange={(e) =>
                      setSelectedDays(Number(e.target.value) as DaysOption)
                    }
                    className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background text-foreground"
                  >
                    {DAYS_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} days
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — TRAVEL TYPE */}
          {currentStep === 2 && (
            <div>
              <h2 className="font-display font-black text-2xl text-foreground mb-1">
                Travel Type
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Who are you traveling with?
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {TRAVEL_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTravelType(t.key)}
                    className={`rounded-2xl border-2 p-5 text-center transition-all ${travelType === t.key ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
                    data-ocid={`travel-type-${t.key}`}
                  >
                    <div className="text-4xl mb-3">{t.icon}</div>
                    <p className="font-bold text-base text-foreground">
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.subtitle}
                    </p>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border transition-colors hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={accessibility}
                  onChange={(e) => setAccessibility(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                  data-ocid="accessibility-check"
                />
                <div>
                  <span className="font-semibold text-sm text-foreground">
                    ♿ Accessibility Requirements
                  </span>
                  <p className="text-xs text-muted-foreground">
                    I need accessibility accommodations
                  </p>
                </div>
              </label>
              {stepErrors.travelType && (
                <p
                  className="text-red-500 text-xs mt-3 flex items-center gap-1"
                  data-ocid="travel-type.error_state"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {stepErrors.travelType}
                </p>
              )}
              {stepErrors.travelCount && (
                <p
                  className="text-red-500 text-xs mt-2 flex items-center gap-1"
                  data-ocid="travel-count.error_state"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {stepErrors.travelCount}
                </p>
              )}
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h2 className="font-display font-black text-2xl text-foreground mb-6">
                Traveler Details
              </h2>

              {travelType === "family" ? (
                /* ── Family: adults + children ── */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <Counter
                      value={adults}
                      min={1}
                      max={10}
                      onChange={setAdults}
                      label="👨‍👩‍ Number of Adults"
                    />
                    <Counter
                      value={children}
                      min={0}
                      max={10}
                      onChange={setChildren}
                      label="👶 Number of Children"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                    <Users className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm font-semibold text-foreground">
                      Total travelers:{" "}
                      <span className="text-primary">
                        {adults} adult{adults !== 1 ? "s" : ""}
                        {children > 0
                          ? `, ${children} child${children !== 1 ? "ren" : ""}`
                          : ""}
                      </span>
                    </p>
                  </div>
                </div>
              ) : travelType === "solo" ? (
                /* ── Solo: gender selector, always 1 traveler ── */
                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                    <span className="text-3xl">🧍</span>
                    <div>
                      <p className="font-bold text-foreground text-base">
                        Solo Traveler
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Just you — 1 traveler. Ready for your adventure!
                      </p>
                    </div>
                    <span className="ml-auto bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-full">
                      1 Traveler
                    </span>
                  </div>
                  {/* Gender selector for solo */}
                  <div>
                    <Label className="text-sm font-bold mb-3 block text-foreground">
                      ♀♂ Gender
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Male", "Female", "Other"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSoloGender(g)}
                          className={`rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                            soloGender === g
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/30"
                          }`}
                          data-ocid={`solo-gender-${g.toLowerCase()}`}
                        >
                          <span className="text-xl">
                            {g === "Male" ? "♂" : g === "Female" ? "♀" : "⚧"}
                          </span>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : travelType === "friends" ? (
                /* ── Friends: male + female counters ── */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <Counter
                      value={maleTravelers}
                      min={0}
                      max={20}
                      onChange={setMaleTravelers}
                      label="♂ Number of Male Travelers"
                    />
                    <Counter
                      value={femaleTravelers}
                      min={0}
                      max={20}
                      onChange={setFemaleTravelers}
                      label="♀ Number of Female Travelers"
                    />
                  </div>
                  {maleTravelers + femaleTravelers === 0 && (
                    <p className="text-xs text-destructive font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      At least 1 traveler is required to proceed.
                    </p>
                  )}
                  {maleTravelers + femaleTravelers > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                      <Users className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-sm font-semibold text-foreground">
                        <span className="text-primary">
                          {maleTravelers + femaleTravelers} travelers
                        </span>
                        <span className="text-muted-foreground font-normal ml-2">
                          ({maleTravelers}M + {femaleTravelers}F)
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Corporate: count + gender breakdown ── */
                <div className="space-y-6">
                  <div className="mb-6">
                    <Label className="text-sm font-bold mb-2 block">
                      Number of Travelers
                    </Label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full sm:w-48 h-11 rounded-xl border border-border px-3 text-sm bg-background text-foreground"
                      data-ocid="travelers-select"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Traveler" : "Travelers"}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Corporate gender breakdown */}
                  <div>
                    <Label className="text-sm font-bold mb-4 block text-foreground">
                      💼 Gender Breakdown (optional)
                    </Label>
                    <div className="space-y-4">
                      <Counter
                        value={corporateMale}
                        min={0}
                        max={50}
                        onChange={setCorporateMale}
                        label="♂ Number of Male Travelers"
                      />
                      <Counter
                        value={corporateFemale}
                        min={0}
                        max={50}
                        onChange={setCorporateFemale}
                        label="♀ Number of Female Travelers"
                      />
                      <Counter
                        value={corporateOther}
                        min={0}
                        max={50}
                        onChange={setCorporateOther}
                        label="⚧ Other / Prefer Not to Say"
                      />
                    </div>
                    {corporateMale + corporateFemale + corporateOther > 0 && (
                      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                        <Users className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-sm font-semibold text-foreground">
                          <span className="text-primary">
                            {corporateMale + corporateFemale + corporateOther}{" "}
                            travelers
                          </span>
                          <span className="text-muted-foreground font-normal ml-2">
                            ({corporateMale}M · {corporateFemale}F
                            {corporateOther > 0
                              ? ` · ${corporateOther} other`
                              : ""}
                            )
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lead Traveler Info — collected inline in step 3 */}
              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <h3 className="font-bold text-base text-foreground">
                  👤 Lead Traveler Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="step3-name">Full Name *</Label>
                    <Input
                      id="step3-name"
                      placeholder="John Doe"
                      value={travelerInfo.name}
                      onChange={(e) => {
                        setTravelerInfo({
                          ...travelerInfo,
                          name: e.target.value,
                        });
                        if (stepErrors.travelerName)
                          setStepErrors((prev) =>
                            Object.fromEntries(
                              Object.entries(prev).filter(
                                ([k]) => k !== "travelerName",
                              ),
                            ),
                          );
                      }}
                      className={
                        stepErrors.travelerName
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      data-ocid="lead-traveler-name"
                    />
                    {stepErrors.travelerName && (
                      <p
                        className="text-red-500 text-xs flex items-center gap-1"
                        data-ocid="lead-traveler-name.field_error"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {stepErrors.travelerName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="step3-email">Email Address *</Label>
                    <Input
                      id="step3-email"
                      type="email"
                      placeholder="john@example.com"
                      value={travelerInfo.email}
                      onChange={(e) => {
                        setTravelerInfo({
                          ...travelerInfo,
                          email: e.target.value,
                        });
                        if (stepErrors.travelerEmail)
                          setStepErrors((prev) =>
                            Object.fromEntries(
                              Object.entries(prev).filter(
                                ([k]) => k !== "travelerEmail",
                              ),
                            ),
                          );
                      }}
                      className={
                        stepErrors.travelerEmail
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      data-ocid="lead-traveler-email"
                    />
                    {stepErrors.travelerEmail && (
                      <p
                        className="text-red-500 text-xs flex items-center gap-1"
                        data-ocid="lead-traveler-email.field_error"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {stepErrors.travelerEmail}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="step3-phone">Phone Number</Label>
                    <Input
                      id="step3-phone"
                      type="tel"
                      placeholder="9876543210"
                      value={travelerInfo.phone}
                      onChange={(e) => {
                        setTravelerInfo({
                          ...travelerInfo,
                          phone: e.target.value,
                        });
                        if (stepErrors.travelerPhone)
                          setStepErrors((prev) =>
                            Object.fromEntries(
                              Object.entries(prev).filter(
                                ([k]) => k !== "travelerPhone",
                              ),
                            ),
                          );
                      }}
                      className={
                        stepErrors.travelerPhone
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      data-ocid="lead-traveler-phone"
                    />
                    {stepErrors.travelerPhone && (
                      <p
                        className="text-red-500 text-xs flex items-center gap-1"
                        data-ocid="lead-traveler-phone.field_error"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {stepErrors.travelerPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — GUIDE SELECTION */}
          {currentStep === 4 && (
            <div>
              <h2 className="font-display font-black text-2xl text-foreground mb-6">
                Guide Selection
              </h2>
              <label
                className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all mb-5 ${wantGuide ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border"}`}
              >
                <input
                  type="checkbox"
                  checked={wantGuide}
                  onChange={(e) => {
                    setWantGuide(e.target.checked);
                    if (!e.target.checked) setSelectedGuideId(null);
                  }}
                  className="w-4 h-4 accent-blue-600"
                  data-ocid="want-guide-check"
                />
                <span className="font-bold text-sm text-foreground">
                  Travel with a guide
                </span>
              </label>
              {wantGuide && (
                <div className="mb-6">
                  <h3 className="font-bold text-base mb-4 text-foreground">
                    Select a Guide ({allDisplayGuides.length} available)
                  </h3>
                  <div className="space-y-3">
                    {allDisplayGuides.map((g) => {
                      const isSelected = selectedGuideId === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            setSelectedGuideId(isSelected ? null : g.id)
                          }
                          className={`w-full rounded-xl border-2 p-4 text-left transition-all ${isSelected ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
                          data-ocid={`guide-card-${g.id}`}
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={g.photo}
                              alt={g.name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-border shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="font-bold text-base text-foreground">
                                  {g.name}
                                </p>
                                {isSelected && (
                                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                    Selected ✓
                                  </span>
                                )}
                              </div>
                              <StarRatingDisplay rating={g.rating} />
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {g.specialty}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {g.experience} yrs · {g.reviews} reviews
                                </span>
                              </div>
                              <p className="text-sm font-bold mt-2 text-primary">
                                ₹{(g.price as number).toLocaleString()}/day
                              </p>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {(g.languages as string[]).map((l) => (
                                  <span
                                    key={l}
                                    className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                  >
                                    {l}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedGuideObj && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Guide: {selectedGuideObj.name} ·{" "}
                        {selectedGuideObj.specialty} ·{" "}
                        {selectedGuideObj.experience} yrs · ₹
                        {(selectedGuideObj.price as number).toLocaleString()}
                        /day
                      </p>
                    </div>
                  )}
                </div>
              )}
              {stepErrors.guide && (
                <p
                  className="text-red-500 text-xs mb-3 flex items-center gap-1"
                  data-ocid="guide.error_state"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {stepErrors.guide}
                </p>
              )}
              <Separator className="my-5" />
              <div>
                <Label className="font-bold text-sm mb-1 block text-foreground">
                  🍴 Food Preferences
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select your dietary preferences
                </p>
                <div className="flex flex-wrap gap-2">
                  {FOOD_PREFS.map((p) => {
                    const isActive = foodPrefs.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => toggleFoodPref(p.key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${isActive ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary" : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/40"}`}
                        data-ocid={`food-${p.key.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <span>{p.emoji}</span>
                        <span>{p.key}</span>
                        {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {stepErrors.foodPreference && (
                  <p
                    className="text-red-500 text-xs mt-2 flex items-center gap-1"
                    data-ocid="food-preference.error_state"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {stepErrors.foodPreference}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 — PLAN PREFERENCES */}
          {currentStep === 5 && (
            <div>
              <h2 className="font-display font-black text-2xl text-foreground mb-1">
                Plan Preferences
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Select Plan Type
              </p>
              {/* Step-level error banner — shown when Generate is blocked */}
              {Object.keys(stepErrors).length > 0 && (
                <div
                  className="mb-5 rounded-xl border border-red-300 dark:border-red-700/60 bg-red-50 dark:bg-red-950/30 p-4 flex items-start gap-3"
                  data-ocid="step5.error_state"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">
                      Please fix the following before generating your plan:
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {Object.values(stepErrors).map((msg) => (
                        <li
                          key={msg}
                          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {PLAN_TIERS.map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setPlanTier(tier.key)}
                    className={`rounded-2xl border-2 p-5 text-center transition-all ${planTier === tier.key ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
                    data-ocid={`plan-tier-${tier.key}`}
                  >
                    <div className="text-3xl mb-3">{tier.icon}</div>
                    <p className="font-bold text-base text-foreground">
                      {tier.label}
                    </p>
                    <p className="text-sm font-semibold mt-1 text-primary">
                      Starting {tier.starting}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.desc}
                    </p>
                    {planTier === tier.key && (
                      <div className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-primary">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border transition-colors hover:bg-muted/30 mb-5">
                <input
                  type="checkbox"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                  data-ocid="pet-friendly-check"
                />
                <div>
                  <span className="font-semibold text-sm text-foreground">
                    🐾 Pet Friendly
                  </span>
                  <p className="text-xs text-muted-foreground">
                    I'm traveling with a pet
                  </p>
                </div>
              </label>

              {/* First-Time Baby Flight Certificate — shown for family with children */}
              {travelType === "family" && children > 0 && (
                <div
                  className="rounded-xl border-2 border-indigo-300 dark:border-indigo-600/60 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-5 mb-5 space-y-4"
                  data-ocid="certificate-section"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <p className="font-bold text-base text-indigo-800 dark:text-indigo-200">
                        First-Time Baby Flight Certificate
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        A keepsake certificate to mark your baby's very first
                        flight!
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <label
                    className="flex items-start gap-3 cursor-pointer group"
                    data-ocid="wants-certificate-check"
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${wantsCertificate ? "bg-indigo-600 border-indigo-600" : "border-indigo-300 dark:border-indigo-600 bg-white dark:bg-indigo-950/50 group-hover:border-indigo-500"}`}
                    >
                      {wantsCertificate && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                      <input
                        type="checkbox"
                        checked={wantsCertificate}
                        onChange={(e) => {
                          setWantsCertificate(e.target.checked);
                          if (!e.target.checked) {
                            setCertBabyName("");
                            setCertBabyAgeInput("");
                            setCertDesign("");
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                        Would you like a First-Time Baby Flight Certificate?
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                        A personalized commemorative certificate for your baby's
                        first flight. Only valid for babies under 2 years of
                        age.
                      </p>
                    </div>
                  </label>

                  {/* Expanded panel when checked */}
                  {wantsCertificate && (
                    <div className="space-y-5 pt-2 border-t border-indigo-200 dark:border-indigo-700/40">
                      {/* Baby name + age */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="cert-baby-name"
                            className="text-indigo-800 dark:text-indigo-200 font-bold text-sm"
                          >
                            👶 Baby's Full Name *
                          </Label>
                          <Input
                            id="cert-baby-name"
                            placeholder="e.g. Aarav Sharma"
                            value={certBabyName}
                            onChange={(e) => {
                              setCertBabyName(e.target.value);
                              if (stepErrors.certBabyName)
                                setStepErrors((prev) =>
                                  Object.fromEntries(
                                    Object.entries(prev).filter(
                                      ([k]) => k !== "certBabyName",
                                    ),
                                  ),
                                );
                            }}
                            className={`bg-white dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700/50 ${stepErrors.certBabyName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            data-ocid="cert-baby-name"
                          />
                          {stepErrors.certBabyName && (
                            <p
                              className="text-red-500 text-xs flex items-center gap-1"
                              data-ocid="cert-baby-name.field_error"
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {stepErrors.certBabyName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="cert-baby-age"
                            className="text-indigo-800 dark:text-indigo-200 font-bold text-sm"
                          >
                            🎂 Baby's Age (in years) *
                          </Label>
                          <Input
                            id="cert-baby-age"
                            type="number"
                            min="0"
                            max="1.99"
                            step="0.1"
                            placeholder="e.g. 0.5 for 6 months"
                            value={certBabyAgeInput}
                            onChange={(e) => {
                              setCertBabyAgeInput(e.target.value);
                              if (stepErrors.certBabyAge)
                                setStepErrors((prev) =>
                                  Object.fromEntries(
                                    Object.entries(prev).filter(
                                      ([k]) => k !== "certBabyAge",
                                    ),
                                  ),
                                );
                            }}
                            className={`bg-white dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700/50 ${stepErrors.certBabyAge ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            data-ocid="cert-baby-age"
                          />
                          <p className="text-xs text-indigo-500 dark:text-indigo-400">
                            Enter decimal for months (e.g. 0.5 = 6 months, 1.5 =
                            18 months)
                          </p>
                          {stepErrors.certBabyAge && (
                            <p
                              className="text-red-500 text-xs flex items-center gap-1"
                              data-ocid="cert-baby-age.field_error"
                            >
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {stepErrors.certBabyAge}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Certificate Design Picker */}
                      <div className="space-y-3">
                        <p className="font-bold text-sm text-indigo-800 dark:text-indigo-200">
                          🎨 Choose Certificate Design *
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            {
                              key: "classic",
                              label: "Classic",
                              emoji: "📜",
                              bg: "from-amber-50 to-yellow-100 dark:from-amber-950/60 dark:to-yellow-900/40",
                              border: "border-amber-400 dark:border-amber-600",
                              accent: "text-amber-800 dark:text-amber-300",
                              preview: "bg-amber-100 dark:bg-amber-900/40",
                            },
                            {
                              key: "modern",
                              label: "Modern",
                              emoji: "✨",
                              bg: "from-blue-50 to-cyan-100 dark:from-blue-950/60 dark:to-cyan-900/40",
                              border: "border-blue-400 dark:border-blue-600",
                              accent: "text-blue-800 dark:text-blue-300",
                              preview: "bg-blue-100 dark:bg-blue-900/40",
                            },
                            {
                              key: "colorful",
                              label: "Colorful",
                              emoji: "🌈",
                              bg: "from-pink-50 to-purple-100 dark:from-pink-950/60 dark:to-purple-900/40",
                              border: "border-pink-400 dark:border-pink-600",
                              accent: "text-pink-800 dark:text-pink-300",
                              preview:
                                "bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200 dark:from-pink-900/40 dark:via-purple-900/40 dark:to-yellow-900/40",
                            },
                            {
                              key: "minimalist",
                              label: "Minimalist",
                              emoji: "🤍",
                              bg: "from-slate-50 to-stone-100 dark:from-slate-900/60 dark:to-stone-900/40",
                              border: "border-slate-300 dark:border-slate-600",
                              accent: "text-slate-700 dark:text-slate-300",
                              preview: "bg-slate-100 dark:bg-slate-800/60",
                            },
                          ].map((design) => {
                            const isSelected = certDesign === design.key;
                            return (
                              <button
                                key={design.key}
                                type="button"
                                onClick={() => {
                                  setCertDesign(design.key);
                                  if (stepErrors.certDesign)
                                    setStepErrors((prev) =>
                                      Object.fromEntries(
                                        Object.entries(prev).filter(
                                          ([k]) => k !== "certDesign",
                                        ),
                                      ),
                                    );
                                }}
                                className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${isSelected ? `${design.border} bg-gradient-to-br ${design.bg} shadow-md ring-2 ring-indigo-400 ring-offset-1` : "border-indigo-200 dark:border-indigo-700/40 bg-white/60 dark:bg-indigo-950/30 hover:border-indigo-400"}`}
                                data-ocid={`cert-design-${design.key}`}
                              >
                                {/* Design preview swatch */}
                                <div
                                  className={`w-full h-10 rounded-lg ${design.preview} flex items-center justify-center text-lg border border-white/40`}
                                >
                                  {design.emoji}
                                </div>
                                <span
                                  className={`text-xs font-bold ${isSelected ? design.accent : "text-indigo-700 dark:text-indigo-300"}`}
                                >
                                  {design.label}
                                </span>
                                {isSelected && (
                                  <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {stepErrors.certDesign && (
                          <p
                            className="text-red-500 text-xs flex items-center gap-1"
                            data-ocid="cert-design.error_state"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {stepErrors.certDesign}
                          </p>
                        )}
                      </div>

                      {/* Confirmation chip */}
                      {certBabyName &&
                        certBabyAgeInput &&
                        Number.parseFloat(certBabyAgeInput) < 2 &&
                        certDesign && (
                          <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700/50 rounded-lg px-3 py-2">
                            <span className="text-base">✅</span>
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                              Certificate for {certBabyName} ·{" "}
                              {certDesign.charAt(0).toUpperCase() +
                                certDesign.slice(1)}{" "}
                              design — included with booking!
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Child Under 5 — Flight Requirements */}
              {travelType === "family" && children > 0 && (
                <div
                  className="rounded-xl border-2 border-emerald-300 dark:border-emerald-600/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 mb-5 space-y-3"
                  data-ocid="child-under5-section"
                >
                  <label
                    className="flex items-start gap-3 cursor-pointer group"
                    data-ocid="child-under5-check"
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${childUnder5 ? "bg-emerald-600 border-emerald-600" : "border-emerald-300 dark:border-emerald-600 bg-white dark:bg-emerald-950/50 group-hover:border-emerald-500"}`}
                    >
                      {childUnder5 && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                      <input
                        type="checkbox"
                        checked={childUnder5}
                        onChange={(e) => setChildUnder5(e.target.checked)}
                        className="sr-only"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        🧒 Child is 5 or under — show flight requirements
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Get a checklist of airline policies and requirements for
                        traveling with young children.
                      </p>
                    </div>
                  </label>

                  {childUnder5 && (
                    <div className="pt-3 border-t border-emerald-200 dark:border-emerald-700/40 space-y-3">
                      <p className="font-bold text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                        <span className="text-base">✈️</span> Flight Requirements
                        for Children Under 5
                      </p>
                      <ul className="space-y-2.5">
                        {[
                          {
                            icon: "👶",
                            title: "Lap Infant Policy",
                            desc: "Children under 2 years may sit on a parent's lap without a separate seat (varies by airline).",
                          },
                          {
                            icon: "🛏️",
                            title: "Bassinet Request",
                            desc: "Bassinets are available on long-haul flights — request at time of booking (bulkhead seats required).",
                          },
                          {
                            icon: "🍼",
                            title: "Special Meals",
                            desc: "Pre-order Baby Meal (BBML) for infants or Child Meal (CHML) for toddlers when booking.",
                          },
                          {
                            icon: "💺",
                            title: "Child Safety Seat",
                            desc: "If a seat is purchased for an infant, an FAA-approved child safety seat may be used on board.",
                          },
                          {
                            icon: "📄",
                            title: "Required Documentation",
                            desc: "Carry a copy of the child's birth certificate and any travel consent letter if traveling with one parent.",
                          },
                          {
                            icon: "🩺",
                            title: "Medical Clearance",
                            desc: "Consult a pediatrician before flying with infants under 7 days old. Airlines may require written clearance.",
                          },
                          {
                            icon: "🤱",
                            title: "Feeding Accommodations",
                            desc: "Breastfeeding is permitted on board; request a private space from cabin crew. Formula and expressed milk are allowed through security.",
                          },
                        ].map((req) => (
                          <li
                            key={req.title}
                            className="flex items-start gap-3 p-3 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/30"
                          >
                            <span className="text-lg mt-0.5 shrink-0">
                              {req.icon}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                {req.title}
                              </p>
                              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {req.desc}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {travelType !== "family" &&
                travelType !== "solo" &&
                travelType !== "friends" && (
                  <div className="mb-4">
                    <Label className="text-sm font-bold mb-2 block">
                      Number of Travelers
                    </Label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full sm:w-48 h-11 rounded-xl border border-border px-3 text-sm bg-background text-foreground"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Traveler" : "Travelers"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {travelType === "family" && (
                <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {adults} adult{adults !== 1 ? "s" : ""}
                    {children > 0
                      ? `, ${children} child${children !== 1 ? "ren" : ""}`
                      : ""}{" "}
                    · {effectiveTravelers} total travelers
                  </span>
                </div>
              )}

              {travelType === "solo" && (
                <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Solo traveler · 1 passenger
                  </span>
                </div>
              )}

              {travelType === "friends" && (
                <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {maleTravelers + femaleTravelers} travelers{" "}
                    <span className="text-muted-foreground">
                      ({maleTravelers}M + {femaleTravelers}F)
                    </span>
                  </span>
                </div>
              )}

              {/* Cost Summary */}
              {(stepErrors.selectedDays || stepErrors.selectedBudget) && (
                <div className="mb-4 space-y-1">
                  {stepErrors.selectedDays && (
                    <p
                      className="text-red-500 text-xs flex items-center gap-1"
                      data-ocid="trip-days.error_state"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {stepErrors.selectedDays}
                    </p>
                  )}
                  {stepErrors.selectedBudget && (
                    <p
                      className="text-red-500 text-xs flex items-center gap-1"
                      data-ocid="trip-budget.error_state"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {stepErrors.selectedBudget}
                    </p>
                  )}
                </div>
              )}
              {/* Cost Summary */}
              <div
                className="rounded-xl p-5 bg-muted border border-border"
                data-ocid="cost-summary"
              >
                <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Cost Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      Base ({effectiveTravelers} pax × {selectedDays} days)
                    </span>
                    <span>₹{baseCost.toLocaleString()}</span>
                  </div>
                  {guideCost > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Guide fees ({selectedDays} days)</span>
                      <span>₹{guideCost.toLocaleString()}</span>
                    </div>
                  )}
                  {activePlan && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Surprise Plan ({activePlan.code})</span>
                      <span>+₹{activePlan.cost.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base text-foreground">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{totalCost.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Indicative estimate. Taxes may apply.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStepErrors({});
              setCurrentStep((s) => Math.max(1, s - 1));
            }}
            disabled={currentStep === 1}
            className="px-6"
            data-ocid="step-back-btn"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="px-6 font-bold"
              data-ocid="step-next-btn"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerate}
              className="px-8 font-bold text-base"
              data-ocid="generate-plans-btn"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Generate Plans
            </Button>
          )}
        </div>
      </div>

      {/* ── Traveler Details Modal */}
      <Dialog open={showTravelerModal} onOpenChange={setShowTravelerModal}>
        <DialogContent className="max-w-md" data-ocid="traveler-modal">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Lead Traveler Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Provide details for the lead traveler before proceeding to
              payment.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Full Name *</Label>
              <Input
                id="t-name"
                placeholder="John Doe"
                value={travelerInfo.name}
                onChange={(e) =>
                  setTravelerInfo({ ...travelerInfo, name: e.target.value })
                }
                data-ocid="traveler-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">Email Address *</Label>
              <Input
                id="t-email"
                type="email"
                placeholder="john@example.com"
                value={travelerInfo.email}
                onChange={(e) =>
                  setTravelerInfo({ ...travelerInfo, email: e.target.value })
                }
                data-ocid="traveler-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-phone">Phone Number</Label>
              <Input
                id="t-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={travelerInfo.phone}
                onChange={(e) =>
                  setTravelerInfo({ ...travelerInfo, phone: e.target.value })
                }
                data-ocid="traveler-phone"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTravelerModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  !travelerInfo.name.trim() || !travelerInfo.email.trim()
                }
                onClick={() => {
                  setShowTravelerModal(false);
                  // Guard: travelType should always be set at this point
                  if (!travelType) return;
                  const certActive =
                    travelType === "family" && children > 0 && wantsCertificate;
                  // Parse age safely — preserve 0 (newborn) as a valid value
                  const modalCertAgeNum =
                    certActive && certBabyAgeInput.trim() !== ""
                      ? Number.parseFloat(certBabyAgeInput)
                      : null;
                  // Re-run generate now that travelerInfo is filled
                  const travelPlanState = {
                    destination,
                    season: selectedSeason,
                    month: selectedMonth,
                    days: selectedDays,
                    planType:
                      planTier === "luxury"
                        ? "Luxury"
                        : planTier === "budget"
                          ? "Budget"
                          : "Standard",
                    travelType:
                      travelType === "solo"
                        ? "Solo"
                        : travelType === "family"
                          ? "Family"
                          : travelType === "friends"
                            ? "Friends"
                            : "Corporate",
                    hasGuide: wantGuide,
                    travelers: effectiveTravelers,
                    selectedGuide: selectedGuideObj
                      ? {
                          id: selectedGuideObj.id,
                          name: selectedGuideObj.name,
                          rating: selectedGuideObj.rating,
                        }
                      : null,
                    soloGender: travelType === "solo" ? soloGender : null,
                    corporateGender:
                      travelType === "corporate"
                        ? {
                            male: corporateMale,
                            female: corporateFemale,
                            other: corporateOther,
                          }
                        : null,
                    maleTravelers:
                      travelType === "friends" ? maleTravelers : null,
                    femaleTravelers:
                      travelType === "friends" ? femaleTravelers : null,
                    wantsCertificate: certActive,
                    certBabyName: certActive ? certBabyName : "",
                    certBabyAge: modalCertAgeNum,
                    certDesign: certActive ? certDesign : "",
                    childUnder5:
                      travelType === "family" && children > 0
                        ? childUnder5
                        : false,
                  };
                  sessionStorage.setItem(
                    "travelPlanState",
                    JSON.stringify(travelPlanState),
                  );
                  // Also write selectedPlan for the detail page
                  const planData = {
                    name: `${destination} Trip`,
                    days: selectedDays,
                    price: Math.round(
                      totalCost / Math.max(1, effectiveTravelers),
                    ),
                    travelers: effectiveTravelers,
                    destination,
                    travelType,
                    maleTravelers:
                      travelType === "friends" ? maleTravelers : null,
                    femaleTravelers:
                      travelType === "friends" ? femaleTravelers : null,
                    soloGender: travelType === "solo" ? soloGender : null,
                    corporateGender:
                      travelType === "corporate"
                        ? {
                            male: corporateMale,
                            female: corporateFemale,
                            other: corporateOther,
                          }
                        : null,
                    wantsCertificate: certActive,
                    certBabyName: certActive ? certBabyName : "",
                    certBabyAge: modalCertAgeNum,
                    certDesign: certActive ? certDesign : "",
                    childUnder5:
                      travelType === "family" && children > 0
                        ? childUnder5
                        : false,
                  };
                  sessionStorage.setItem(
                    "selectedPlan",
                    JSON.stringify(planData),
                  );
                  navigate({ to: "/travel-plans/results" });
                }}
                className="flex-1 font-bold"
                data-ocid="traveler-continue-btn"
              >
                Generate Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        amount={totalCost}
        destination={destination}
        travelers={effectiveTravelers}
        days={selectedDays}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
