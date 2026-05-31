/**
 * SeniorTripDetails — /senior-trip-details
 * Collects number of people, pet-friendly, days, travel date for senior tours
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Users,
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
}

export default function SeniorTripDetails() {
  const navigate = useNavigate();
  const [tour, setTour] = useState<SeniorPackage | null>(null);

  // State hooks before early returns
  const [numPeople, setNumPeople] = useState(2);
  const [petFriendly, setPetFriendly] = useState(false);
  const [numDays, setNumDays] = useState(5);
  const [travelDate, setTravelDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("seniorBookingData");
    if (raw) {
      try {
        const data = JSON.parse(raw) as SeniorPackage;
        setTour(data);
        setNumDays(data.duration ?? 5);
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

  const today = new Date().toISOString().split("T")[0];

  function validate() {
    const errs: Record<string, string> = {};
    if (!travelDate) errs.date = "Please select a travel date";
    if (numPeople < 1) errs.people = "At least 1 person required";
    if (numDays < 1) errs.days = "At least 1 day required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleProceed() {
    if (!validate()) return;
    sessionStorage.setItem(
      "seniorTripDetails",
      JSON.stringify({ numPeople, petFriendly, numDays, travelDate, tour }),
    );
    navigate({ to: "/senior-booking" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="relative py-12 overflow-hidden"
        style={{
          backgroundImage: `url('${tour.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1a1a2e",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-card border-white/30 text-white hover:bg-white/20 gap-1 mb-4"
            onClick={() => navigate({ to: "/senior-tour-detail" })}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40">
              <Heart className="w-3 h-3" /> Senior Friendly
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Trip Details
          </h1>
          <div className="flex flex-wrap gap-3 text-white/80 text-sm mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {tour.region}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {tour.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          <h2 className="font-display font-bold text-xl text-foreground">
            Customize Your Senior Tour
          </h2>

          {/* Number of People */}
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Number of Travelers
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNumPeople((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-bold text-lg text-foreground hover:border-primary transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center font-bold text-xl text-foreground">
                {numPeople}
              </span>
              <button
                type="button"
                onClick={() => setNumPeople((p) => Math.min(10, p + 1))}
                className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-bold text-lg text-foreground hover:border-primary transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">
                (max 10 for senior tours)
              </span>
            </div>
            {errors.people && (
              <p className="text-xs text-destructive">{errors.people}</p>
            )}
          </div>

          {/* Pet Friendly */}
          <div className="space-y-2">
            <Label className="font-bold">🐾 Pet Friendly</Label>
            <div className="flex gap-3">
              {(["Yes", "No"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPetFriendly(opt === "Yes")}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    (opt === "Yes") === petFriendly
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      : "border-border bg-card text-foreground hover:border-amber-500/50"
                  }`}
                  data-ocid={`senior-pet-${opt.toLowerCase()}`}
                >
                  {opt === "Yes" ? "🐶 Yes, with pet" : "🚫 No pet"}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Days */}
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Number of Days
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNumDays((d) => Math.max(1, d - 1))}
                className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-bold text-lg text-foreground hover:border-primary transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center font-bold text-xl text-foreground">
                {numDays}
              </span>
              <button
                type="button"
                onClick={() => setNumDays((d) => Math.min(30, d + 1))}
                className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-bold text-lg text-foreground hover:border-primary transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">(1-30 days)</span>
            </div>
            {errors.days && (
              <p className="text-xs text-destructive">{errors.days}</p>
            )}
          </div>

          {/* Travel Date */}
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Travel Date
            </Label>
            <Input
              type="date"
              value={travelDate}
              min={today}
              onChange={(e) => setTravelDate(e.target.value)}
              className="max-w-xs"
              data-ocid="senior-travel-date"
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Cost preview */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 p-4">
            <p className="text-sm font-bold text-foreground mb-1">
              Estimated Cost
            </p>
            <p className="text-2xl font-display font-bold text-amber-500">
              ₹{(tour.price * numPeople).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">
              ₹{tour.price.toLocaleString("en-IN")} × {numPeople}{" "}
              {numPeople === 1 ? "person" : "people"} (+ 18% taxes at checkout)
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
              ✦ Includes all senior care services and medical support
            </p>
          </div>

          <Button
            type="button"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 py-6 text-base gap-2"
            onClick={handleProceed}
            data-ocid="senior-proceed-btn"
          >
            Proceed to Booking
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
