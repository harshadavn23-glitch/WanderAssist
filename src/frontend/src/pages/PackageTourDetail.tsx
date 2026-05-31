/**
 * PackageTourDetail — /package-tour-detail
 * Shows day-by-day itinerary, guide info, inclusions/exclusions
 * Reads selectedPackage from sessionStorage
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Compass,
  Hotel,
  MapPin,
  Plane,
  Star,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PackageData {
  id: string;
  name: string;
  destination: string;
  image: string;
  pricePerPerson: number;
  duration: number;
  highlights: string[];
  includes: Array<"flight" | "hotel" | "food" | "guide">;
  rating: number;
  reviewCount: number;
  type: string;
  popular?: boolean;
}

const includeMap = {
  flight: { icon: Plane, label: "Flight Tickets" },
  hotel: { icon: Hotel, label: "Hotel Accommodation" },
  food: { icon: UtensilsCrossed, label: "Daily Meals" },
  guide: { icon: Compass, label: "Expert Guide" },
} as const;

const GUIDE = {
  name: "Arjun Sharma",
  photo:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  specialty: "Adventure & Cultural Tours",
  rating: 4.9,
  reviews: 312,
  experience: 12,
  languages: ["Hindi", "English", "Punjabi"],
};

function buildItinerary(destination: string, duration: number) {
  const days: {
    day: number;
    morning: string;
    afternoon: string;
    evening: string;
  }[] = [];
  for (let i = 1; i <= duration; i++) {
    days.push({
      day: i,
      morning:
        i === 1
          ? `Arrive ${destination}, hotel check-in & welcome briefing`
          : "Morning relaxation & breakfast at hotel",
      afternoon:
        i === duration
          ? "Free time for last-minute shopping & souvenirs"
          : `Afternoon guided sightseeing of ${destination} highlights`,
      evening:
        i === duration
          ? "Departure transfer to airport"
          : i === 1
            ? "Welcome dinner with your travel group"
            : "Evening leisure — local market or cultural show",
    });
  }
  return days;
}

const EXCLUSIONS = [
  "Personal expenses & tips",
  "Optional activities not in itinerary",
  "Travel insurance (recommended)",
  "Visa fees for international destinations",
  "Alcoholic beverages",
];

export default function PackageTourDetail() {
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedPackage");
    if (raw) {
      try {
        setPkg(JSON.parse(raw) as PackageData);
      } catch {
        navigate({ to: "/package-tours" });
      }
    } else {
      navigate({ to: "/package-tours" });
    }
  }, [navigate]);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const itinerary = buildItinerary(pkg.destination, pkg.duration);

  function handleConfirm() {
    sessionStorage.setItem("packageBookingData", JSON.stringify(pkg));
    navigate({ to: "/package-trip-details" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-card border-white/30 text-white hover:bg-white/20 gap-1"
            onClick={() => navigate({ to: "/package-tours" })}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className="bg-amber-500/90 text-white border-0">
              {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}
            </Badge>
            {pkg.popular && (
              <Badge className="bg-orange-500/90 text-white border-0">
                ⭐ Popular
              </Badge>
            )}
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-1">
            {pkg.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {pkg.destination}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {pkg.duration} Days
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{" "}
              {pkg.rating} ({pkg.reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT — main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Day-by-day itinerary */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Day-by-Day Itinerary
            </h2>
            <div className="space-y-4">
              {itinerary.map((day) => (
                <div
                  key={day.day}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="bg-amber-500/10 dark:bg-amber-500/20 px-4 py-2 border-b border-border">
                    <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                      Day {day.day}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-20 shrink-0 pt-0.5">
                        🌅 Morning
                      </span>
                      <span className="text-sm text-foreground">
                        {day.morning}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-20 shrink-0 pt-0.5">
                        ☀️ Afternoon
                      </span>
                      <span className="text-sm text-foreground">
                        {day.afternoon}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-20 shrink-0 pt-0.5">
                        🌆 Evening
                      </span>
                      <span className="text-sm text-foreground">
                        {day.evening}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              ✨ Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pkg.highlights.map((h) => (
                <div
                  key={h}
                  className="flex items-start gap-2 p-3 rounded-xl bg-muted/50"
                >
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{h}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Inclusions + Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section>
              <h2 className="font-display font-bold text-lg text-foreground mb-3 text-green-600 dark:text-green-400">
                ✓ Inclusions
              </h2>
              <ul className="space-y-2">
                {pkg.includes.map((key) => {
                  const { icon: Icon, label } = includeMap[key];
                  return (
                    <li
                      key={key}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Icon className="w-4 h-4 text-green-500 shrink-0" />
                      {label}
                    </li>
                  );
                })}
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Users className="w-4 h-4 text-green-500 shrink-0" />
                  Group Transportation
                </li>
              </ul>
            </section>
            <section>
              <h2 className="font-display font-bold text-lg text-foreground mb-3 text-red-500 dark:text-red-400">
                ✗ Exclusions
              </h2>
              <ul className="space-y-2">
                {EXCLUSIONS.map((ex) => (
                  <li
                    key={ex}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    {ex}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div className="space-y-5">
          {/* Guide Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              🧭 Your Guide
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={GUIDE.photo}
                alt={GUIDE.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
              />
              <div>
                <p className="font-bold text-foreground">{GUIDE.name}</p>
                <p className="text-xs text-muted-foreground">
                  {GUIDE.specialty}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
              <span className="text-xs font-semibold ml-1">{GUIDE.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({GUIDE.reviews} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {GUIDE.languages.map((l) => (
                <span
                  key={l}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {GUIDE.experience} years experience
            </p>
          </div>

          {/* Price + CTA */}
          <div className="rounded-2xl border border-border bg-card p-5 sticky top-4">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="font-display font-bold text-3xl text-amber-500">
                ₹{pkg.pricePerPerson.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">per person</p>
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium text-foreground">
                  {pkg.duration} Days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Destination</span>
                <span className="font-medium text-foreground">
                  {pkg.destination}
                </span>
              </div>
            </div>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 gap-2"
              onClick={handleConfirm}
              data-ocid="confirm-package-btn"
            >
              Confirm & Book
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
