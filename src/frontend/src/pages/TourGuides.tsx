import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tourGuides } from "@/data/tourGuides";
import type { TourGuide } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Globe,
  Languages,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

const guidesMeta: Record<
  string,
  { tourTypes: string[]; region: "india" | "international" }
> = {
  "tg-001": { tourTypes: ["Family", "Adventure", "Group"], region: "india" },
  "tg-002": { tourTypes: ["Family", "Cultural", "Wellness"], region: "india" },
  "tg-003": { tourTypes: ["Family", "Heritage", "Senior"], region: "india" },
  "tg-004": {
    tourTypes: ["Couples", "Luxury", "Cultural"],
    region: "international",
  },
  "tg-005": {
    tourTypes: ["Adventure", "Desert Safari", "Couples"],
    region: "international",
  },
  "tg-006": {
    tourTypes: ["Couples", "City Break", "Art & History"],
    region: "international",
  },
};

type FilterKey = "all" | "india" | "international" | "languages";
const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Guides" },
  { key: "india", label: "India" },
  { key: "international", label: "International" },
  { key: "languages", label: "Multi-lingual" },
];

function StarRating({ rating, id }: { rating: number; id: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={`${id}-star-${n}`}
          className={`w-3.5 h-3.5 ${n <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : n - 0.5 <= rating ? "fill-amber-400/50 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = name.charCodeAt(0) * 47;
  return (
    <div
      className="w-full h-full flex items-center justify-center text-3xl font-display font-bold text-white"
      style={{ background: `hsl(${hue % 360}, 55%, 45%)` }}
    >
      {initials}
    </div>
  );
}

function GuideCard({ guide }: { guide: TourGuide }) {
  const meta = guidesMeta[guide.id];
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col rounded-2xl overflow-hidden transition-smooth hover:scale-[1.02] hover:shadow-hero"
      data-ocid={`guide-card-${guide.id}`}
    >
      {/* Photo */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {guide.photo ? (
          <img
            src={guide.photo}
            alt={guide.name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-108"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <InitialsAvatar name={guide.name} />
        )}
        <div className="absolute inset-0 card-overlay-strong" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white shadow-md">
            <Shield className="w-3 h-3" />
            Verified Guide
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold glass-card text-white border-0">
            <Globe className="w-3 h-3" />
            {meta?.region === "india" ? "India" : "International"}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display font-bold text-white text-xl text-shadow-hero leading-tight">
            {guide.name}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3 bg-card border border-t-0 border-border rounded-b-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <StarRating rating={guide.rating} id={guide.id} />
            <span className="text-xs font-semibold text-foreground">
              {guide.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({guide.reviews})
            </span>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold">
            {guide.experience} Yrs Exp
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {guide.specialty}
        </p>
        <div>
          <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Languages className="w-3 h-3 text-amber-500" />
            Languages
          </p>
          <div className="flex flex-wrap gap-1">
            {guide.languages.map((lang) => (
              <Badge
                key={lang}
                variant="outline"
                className="text-xs font-normal px-2 py-0"
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-500" />
            Destinations
          </p>
          <div className="flex flex-wrap gap-1">
            {guide.destinations.slice(0, 3).map((dest) => (
              <span
                key={dest}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
              >
                {dest}
              </span>
            ))}
          </div>
        </div>
        {meta?.tourTypes && (
          <div className="flex flex-wrap gap-1">
            {meta.tourTypes.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground font-medium"
              >
                <CheckCircle className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
          </div>
        )}
        <Button
          type="button"
          onClick={() =>
            navigate({
              to: "/travel-plan",
              search: { destination: guide.destinations[0], guideId: guide.id },
            })
          }
          className="w-full mt-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold h-9 gap-2"
          data-ocid={`book-guide-btn-${guide.id}`}
        >
          <Users className="w-3.5 h-3.5" />
          Book with {guide.name.split(" ")[0]}
        </Button>
      </div>
    </motion.div>
  );
}

export default function TourGuides() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return tourGuides;
    if (activeFilter === "india")
      return tourGuides.filter((g) => guidesMeta[g.id]?.region === "india");
    if (activeFilter === "international")
      return tourGuides.filter(
        (g) => guidesMeta[g.id]?.region === "international",
      );
    return tourGuides.filter((g) => g.languages.length >= 3);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <section
        className="relative py-16"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,22,40,0.85)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge className="mb-3 bg-amber-500/30 text-amber-200 border-amber-400/40 gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              All Guides Are Background-Verified
            </Badge>
            <h1 className="font-display font-bold text-5xl text-white text-shadow-hero mb-2">
              Verified Tour Guides
            </h1>
            <p className="text-white/70 text-lg">
              Expert local guides to make your journey extraordinary —
              handpicked, certified, and highly rated.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <div
        className="sticky top-16 z-30 shadow-subtle"
        style={{
          background: "rgba(10,22,40,0.96)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {filterOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                data-ocid={`guide-filter-${key}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-smooth shrink-0 ${
                  activeFilter === key
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {key === "india" && <MapPin className="w-3.5 h-3.5" />}
                {key === "international" && <Globe className="w-3.5 h-3.5" />}
                {key === "languages" && <Languages className="w-3.5 h-3.5" />}
                {label}
                {key !== "all" && (
                  <span className="ml-0.5 text-xs bg-white/15 text-white/80 rounded-full px-1.5 py-0.5">
                    {key === "india"
                      ? tourGuides.filter(
                          (g) => guidesMeta[g.id]?.region === "india",
                        ).length
                      : key === "international"
                        ? tourGuides.filter(
                            (g) => guidesMeta[g.id]?.region === "international",
                          ).length
                        : tourGuides.filter((g) => g.languages.length >= 3)
                            .length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          verified guide{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No guides found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
