/**
 * SeniorTourDetail — /senior-tour-detail
 * Shows day-by-day itinerary with gentle pacing labels, guide, senior-specific inclusions
 * Reads selectedSeniorTour from sessionStorage
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Shield,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SeniorPackage {
  id: string;
  name: string;
  destination: string;
  region: string;
  duration: number;
  price: number;
  image: string;
  tagline: string;
  dayByDay: string[];
  specialInclusions: string[];
  badge: string;
  rating: number;
  reviews: number;
}

const GUIDE = {
  name: "Priya Nair",
  photo:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  specialty: "Senior & Wellness Tours",
  rating: 4.8,
  reviews: 278,
  experience: 9,
  languages: ["Malayalam", "Tamil", "English", "Hindi"],
};

const SENIOR_INCLUSIONS = [
  "Doctor on Call 24/7",
  "Wheelchair Accessible Transport",
  "Slow-Paced Activities",
  "Group Travel with Seniors 55+",
  "Medical Kit on Board",
  "Comfortable 4★ Accommodation",
  "Early Check-In Guaranteed",
  "Dedicated Tour Escort",
  "Travel Insurance",
];

const EXCLUSIONS = [
  "Personal expenses & tips",
  "Optional leisure activities",
  "Additional medical treatment",
  "Alcoholic beverages",
  "Visa fees (international)",
];

function splitDayActivities(dayDesc: string) {
  // dayByDay items are already full strings — show with gentle pacing labels
  return dayDesc;
}

export default function SeniorTourDetail() {
  const navigate = useNavigate();
  const [tour, setTour] = useState<SeniorPackage | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedSeniorTour");
    if (raw) {
      try {
        setTour(JSON.parse(raw) as SeniorPackage);
      } catch {
        navigate({ to: "/senior-tours" });
      }
    } else {
      navigate({ to: "/senior-tours" });
    }
  }, [navigate]);

  if (!tour) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  function handleConfirm() {
    sessionStorage.setItem("seniorBookingData", JSON.stringify(tour));
    navigate({ to: "/senior-trip-details" });
  }

  const pacingLabels = [
    "Morning Relaxation",
    "Afternoon Exploration",
    "Evening Rest",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-card border-white/30 text-white hover:bg-white/20 gap-1"
            onClick={() => navigate({ to: "/senior-tours" })}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className="bg-amber-500/90 text-white border-0 gap-1">
              <Heart className="w-3 h-3" /> Senior Friendly
            </Badge>
            <Badge className="bg-red-500/80 text-white border-0 gap-1">
              <Stethoscope className="w-3 h-3" /> Medical Support
            </Badge>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-1">
            {tour.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {tour.region}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {tour.duration} Days
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{" "}
              {tour.rating} ({tour.reviews} reviews)
            </span>
          </div>
          <p className="text-white/70 text-sm italic mt-2">"{tour.tagline}"</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Day-by-day itinerary with gentle pacing */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Day-by-Day Itinerary
            </h2>
            <div className="space-y-4">
              {tour.dayByDay.map((dayDesc, idx) => {
                const dayNum = idx + 1;
                const pacingIdx = idx % pacingLabels.length;
                const pacing = pacingLabels[pacingIdx];
                return (
                  <div
                    key={`day-${dayNum}`}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                  >
                    <div className="bg-amber-500/10 dark:bg-amber-500/20 px-4 py-2 border-b border-border flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                        Day {dayNum}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        🌿 {pacing}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {splitDayActivities(dayDesc)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Special Inclusions */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Senior Care Inclusions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SENIOR_INCLUSIONS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40"
                >
                  <Shield className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-foreground font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Exclusions */}
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

        {/* RIGHT — sidebar */}
        <div className="space-y-5">
          {/* Guide Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              🧭 Senior Guide
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={GUIDE.photo}
                alt={GUIDE.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/50"
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
                ({GUIDE.reviews})
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {GUIDE.languages.map((l) => (
                <span
                  key={l}
                  className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {GUIDE.experience} years senior travel experience
            </p>
          </div>

          {/* Tour badge */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-4 py-3">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              ✦ {tour.badge}
            </p>
          </div>

          {/* Price + CTA */}
          <div className="rounded-2xl border border-border bg-card p-5 sticky top-4">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground">Per person from</p>
              <p className="font-display font-bold text-3xl text-amber-500">
                ₹{tour.price.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                Includes all senior care services
              </p>
            </div>
            <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium text-foreground">
                  {tour.duration} Days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Region</span>
                <span className="font-medium text-foreground">
                  {tour.region}
                </span>
              </div>
            </div>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 gap-2"
              onClick={handleConfirm}
              data-ocid="confirm-senior-btn"
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
