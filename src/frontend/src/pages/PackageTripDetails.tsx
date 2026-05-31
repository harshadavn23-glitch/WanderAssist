/**
 * PackageTripDetails — /package-trip-details
 * Collects number of people, pet-friendly, days, travel date before booking
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
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PackageData {
  id: string;
  name: string;
  destination: string;
  image: string;
  pricePerPerson: number;
  duration: number;
  type: string;
}

export default function PackageTripDetails() {
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);

  // All state hooks before early returns
  const [numPeople, setNumPeople] = useState(2);
  const [petFriendly, setPetFriendly] = useState(false);
  const [numDays, setNumDays] = useState(5);
  const [travelDate, setTravelDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("packageBookingData");
    if (raw) {
      try {
        const data = JSON.parse(raw) as PackageData;
        setPkg(data);
        setNumDays(data.duration ?? 5);
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
      "packageTripDetails",
      JSON.stringify({ numPeople, petFriendly, numDays, travelDate, pkg }),
    );
    navigate({ to: "/package-booking" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="relative py-12 overflow-hidden"
        style={{
          backgroundImage: `url('${pkg.image}')`,
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
            onClick={() => navigate({ to: "/package-tour-detail" })}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Trip Details
          </h1>
          <div className="flex flex-wrap gap-3 text-white/80 text-sm mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {pkg.destination}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {pkg.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          <h2 className="font-display font-bold text-xl text-foreground">
            Customize Your Trip
          </h2>

          {/* Number of People */}
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Number of People
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
                onClick={() => setNumPeople((p) => Math.min(20, p + 1))}
                className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center font-bold text-lg text-foreground hover:border-primary transition-colors"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">
                (max 20 people)
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
                      ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                  data-ocid={`pet-${opt.toLowerCase()}`}
                >
                  {opt === "Yes" ? "🐶 Yes, with pet" : "🚫 No pet"}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Days */}
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
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
              <Calendar className="w-4 h-4 text-primary" />
              Travel Date
            </Label>
            <Input
              type="date"
              value={travelDate}
              min={today}
              onChange={(e) => setTravelDate(e.target.value)}
              className="max-w-xs"
              data-ocid="travel-date-input"
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Cost preview */}
          <div className="rounded-xl bg-muted/60 border border-border p-4">
            <p className="text-sm font-bold text-foreground mb-1">
              Estimated Cost
            </p>
            <p className="text-2xl font-display font-bold text-primary">
              ₹{(pkg.pricePerPerson * numPeople).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">
              ₹{pkg.pricePerPerson.toLocaleString("en-IN")} × {numPeople}{" "}
              {numPeople === 1 ? "person" : "people"} (+ 18% taxes at checkout)
            </p>
          </div>

          <Button
            type="button"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 py-6 text-base gap-2"
            onClick={handleProceed}
            data-ocid="proceed-to-booking-btn"
          >
            Proceed to Booking
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
