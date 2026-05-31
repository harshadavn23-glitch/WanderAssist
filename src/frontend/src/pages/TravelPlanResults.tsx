// TravelPlanResults.tsx — /travel-plans/results
// Shows 10 generated plan cards after a 2-second loading animation.
// Receives wizard state via router state; falls back to query params.

import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Settings2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/ImageWithFallback";

// ── Types ──────────────────────────────────────────────────────────────────
interface WizardState {
  destination: string;
  season: string;
  month: string;
  days: number;
  planType: "Budget" | "Standard" | "Luxury";
  travelType: "Solo" | "Family" | "Friends" | "Corporate";
  hasGuide: boolean;
  travelers?: number;
  selectedGuide?: { id: string; name: string; rating: number };
}

interface PlanCard {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  nights: number;
  days: number;
  guided: boolean;
}

// ── Price ranges by plan type ─────────────────────────────────────────────
const PRICE_RANGES = {
  Budget: [
    15000, 16500, 18000, 19500, 21000, 22500, 24000, 25500, 27000, 30000,
  ],
  Standard: [
    35000, 38000, 42000, 45000, 48000, 52000, 55000, 58000, 62000, 65000,
  ],
  Luxury: [
    75000, 82000, 90000, 98000, 105000, 112000, 120000, 132000, 142000, 150000,
  ],
};

const RATINGS = [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.3, 4.5, 4.7];
const REVIEWS = [52, 80, 134, 96, 210, 178, 300, 65, 145, 88];

function generatePlans(state: WizardState): PlanCard[] {
  const prices = PRICE_RANGES[state.planType];
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `${state.destination} Explorer Plan ${i + 1}`,
    rating: RATINGS[i],
    reviews: REVIEWS[i],
    price: prices[i],
    nights: state.days - 1,
    days: state.days,
    guided: i % 3 !== 2, // mostly guided, some self-guided
  }));
}

// ── Loading Screen ────────────────────────────────────────────────────────
function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-elevated text-center">
        <CardContent className="p-10 space-y-6">
          {/* Spinner with plane */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              ✈️
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-foreground">
              Creating Your Perfect Trip
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Analyzing your preferences and generating personalized plans...
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-primary rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-primary">
              {progress}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Deterministic destination image lookup ────────────────────────────────
const PLAN_DESTINATION_IMAGES: Record<string, string> = {
  // Indian destinations
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=240&fit=crop&q=80",
  Kerala:
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=240&fit=crop&q=80",
  Mumbai:
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&h=240&fit=crop&q=80",
  Chennai:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=240&fit=crop&q=80",
  Delhi:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=240&fit=crop&q=80",
  Jaipur:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=240&fit=crop&q=80",
  Manali:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=240&fit=crop&q=80",
  Ladakh:
    "https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=600&h=240&fit=crop&q=80",
  Pondicherry:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=240&fit=crop&q=80",
  Bangalore:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&h=240&fit=crop&q=80",
  // International destinations
  "Bali, Indonesia":
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=240&fit=crop&q=80",
  Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=240&fit=crop&q=80",
  "Paris, France":
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=240&fit=crop&q=80",
  Paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=240&fit=crop&q=80",
  "Dubai, UAE":
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=240&fit=crop&q=80",
  Dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=240&fit=crop&q=80",
  "Tokyo, Japan":
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=240&fit=crop&q=80",
  Tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=240&fit=crop&q=80",
  "New York, USA":
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=240&fit=crop&q=80",
  "New York":
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=240&fit=crop&q=80",
  "London, UK":
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=240&fit=crop&q=80",
  London:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=240&fit=crop&q=80",
  Singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=240&fit=crop&q=80",
  Maldives:
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=240&fit=crop&q=80",
  Switzerland:
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=240&fit=crop&q=80",
  Thailand:
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=240&fit=crop&q=80",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=240&fit=crop&q=80";

function getDestinationImage(destination: string): string {
  // Try exact match first, then strip country suffix e.g. "Bali, Indonesia" → "Bali"
  return (
    PLAN_DESTINATION_IMAGES[destination] ??
    PLAN_DESTINATION_IMAGES[destination.split(",")[0].trim()] ??
    FALLBACK_IMG
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────
function PlanCardItem({
  plan,
  destination,
  wizardState,
  onViewDetails,
}: {
  plan: PlanCard;
  destination: string;
  wizardState: WizardState;
  onViewDetails: (plan: PlanCard) => void;
}) {
  const imgUrl = getDestinationImage(destination);

  const planId = `plan-${destination.toLowerCase().replace(/\s+/g, "-")}-${plan.id}`;
  const favoriteTrip = {
    planId,
    destination,
    planName: plan.name,
    image: imgUrl,
    pricePerPerson: plan.price,
    days: plan.days,
    travelers: wizardState.travelers ?? 1,
  };

  return (
    <Card
      className="overflow-hidden card-hover border-border group cursor-pointer"
      data-ocid={`plan-card-${plan.id}`}
      onClick={() => onViewDetails(plan)}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <ImageWithFallback
          src={imgUrl}
          alt={plan.name}
          fallbackLabel={destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 card-overlay" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs font-semibold">
            Plan #{plan.id}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <FavoriteButton planId={planId} trip={favoriteTrip} size="sm" />
          <Badge className="glass-card text-white border-0 text-xs">
            {plan.guided ? "🧭 Guided" : "🚀 Self-Guided"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Name + Rating */}
        <div>
          <h3 className="font-display font-bold text-base text-foreground leading-tight line-clamp-2">
            {plan.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i <= Math.round(plan.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="text-sm font-semibold text-foreground ml-0.5">
              {plan.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({plan.reviews} reviews)
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {plan.days} Days / {plan.nights} Nights
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {plan.days} Days Tour
          </Badge>
          <Badge variant="outline" className="text-xs">
            {plan.guided ? "Guided Tours" : "Self-Guided"}
          </Badge>
        </div>

        {/* Inclusions */}
        <div className="flex items-center gap-4 py-2 border-y border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-base">🏨</span> Hotel
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-base">✈️</span> Flights
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-base">🍽️</span> Meals
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary">
              ₹{plan.price.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(plan);
            }}
            data-ocid={`view-details-${plan.id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function TravelPlanResults() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Pull state from sessionStorage (set by TravelPlan wizard on navigate)
  const raw = sessionStorage.getItem("travelPlanState");
  const wizardState: WizardState = (() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WizardState;
    } catch {
      return null;
    }
  })() ?? {
    destination: "Goa",
    season: "Winter",
    month: "December",
    days: 5,
    planType: "Standard",
    travelType: "Friends",
    hasGuide: false,
    travelers: 2,
  };

  const plans = generatePlans(wizardState);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleViewDetails(plan: PlanCard) {
    sessionStorage.setItem(
      "selectedPlan",
      JSON.stringify({ ...plan, ...wizardState }),
    );
    navigate({ to: "/travel-plans/detail" });
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header banner */}
      <div
        className="relative py-14 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=400&fit=crop&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white text-shadow-hero mb-3">
            Your Travel Plans
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Choose from 10 personalized plans based on your preferences
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Filter bar */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{wizardState.destination}</span>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {wizardState.month} · {wizardState.season}
                </span>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{wizardState.days} Days</span>
              </div>
              <div className="w-px h-5 bg-border" />
              <Badge className="bg-primary/10 text-primary border-primary/30 capitalize">
                {wizardState.planType}
              </Badge>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: "/travel-plan" })}
                  className="gap-1.5"
                  data-ocid="modify-preferences-btn"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Modify Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {plans.map((plan) => (
            <PlanCardItem
              key={plan.id}
              plan={plan}
              destination={wizardState.destination}
              wizardState={wizardState}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
