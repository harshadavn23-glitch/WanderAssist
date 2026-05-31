import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { destinations, searchDestinations } from "@/data/destinations";
import type { Destination } from "@/types/travel";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const TOTAL = destinations.length;

type FilterId =
  | "all"
  | "indian"
  | "international"
  | "budget"
  | "beach"
  | "mountains"
  | "city";

const FILTERS: { id: FilterId; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🌍" },
  { id: "indian", label: "Indian", emoji: "🇮🇳" },
  { id: "international", label: "International", emoji: "✈️" },
  { id: "budget", label: "Budget-Friendly", emoji: "💰" },
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "mountains", label: "Mountains", emoji: "⛰️" },
  { id: "city", label: "City", emoji: "🏙️" },
];

function applyFilter(dests: Destination[], filter: FilterId): Destination[] {
  switch (filter) {
    case "indian":
      return dests.filter((d) => d.type === "indian");
    case "international":
      return dests.filter((d) => d.type === "international");
    case "budget":
      return dests.filter(
        (d) => (d.costPerPerson ?? d.pricePerPerson ?? 0) <= 15000,
      );
    case "beach":
      return dests.filter((d) =>
        d.tags.some((t) => t.toLowerCase().includes("beach")),
      );
    case "mountains":
      return dests.filter((d) =>
        d.tags.some(
          (t) =>
            t.toLowerCase().includes("mountain") ||
            t.toLowerCase().includes("snow") ||
            t.toLowerCase().includes("adventure"),
        ),
      );
    case "city":
      return dests.filter((d) =>
        d.tags.some((t) => t.toLowerCase().includes("city")),
      );
    default:
      return dests;
  }
}

function DestCard({ dest, index }: { dest: Destination; index: number }) {
  const navigate = useNavigate();

  function handleBook() {
    navigate({ to: "/travel-plan", search: { destination: dest.name } });
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative rounded-2xl overflow-hidden transition-smooth hover:scale-[1.03] hover:shadow-hero w-full text-left"
      style={{ minHeight: "270px" }}
      onClick={handleBook}
      data-ocid={`search-dest-card-${dest.id}`}
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <img
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
      </div>
      <div className="absolute inset-0 card-overlay-strong" />

      {/* Type badge */}
      <div className="absolute top-3 right-3 z-10">
        {dest.type === "indian" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold glass-card text-white border-0">
            🇮🇳 Indian
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold glass-card text-white border-0">
            🌍 International
          </span>
        )}
      </div>

      {/* Price badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          ₹{((dest.costPerPerson ?? 0) / 1000).toFixed(0)}K
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <h3 className="font-display font-bold text-white text-lg text-shadow-hero leading-tight">
          {dest.name}
        </h3>
        <p className="text-white/75 text-xs flex items-center gap-1 mt-0.5 mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{dest.region}</span>
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {dest.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold glass-card text-white border-0"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Clock className="w-3 h-3" />
            {dest.duration} days
          </div>
          <Button
            type="button"
            className="h-7 px-3 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              handleBook();
            }}
            data-ocid={`search-book-btn-${dest.id}`}
          >
            Book Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </motion.button>
  );
}

export default function SearchPage() {
  const rawSearch = useSearch({ strict: false }) as { q?: string };
  const [query, setQuery] = useState(rawSearch.q ?? "");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [results, setResults] = useState<Destination[]>(destinations);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    const base = trimmed ? searchDestinations(trimmed) : destinations;
    setResults(applyFilter(base, activeFilter));
  }, [query, activeFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header with scenic background */}
      <div
        className="relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,22,40,0.82)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Explore
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white text-shadow-hero mb-2">
              Search Destinations
            </h1>
            <p className="text-white/65 mb-6 text-base">
              Explore {TOTAL} handpicked destinations — India &amp; beyond.
            </p>

            {/* Search input */}
            <div className="flex gap-2 max-w-xl mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder="Search destinations, tags, or region..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-11 h-12 text-base glass-card border-white/25 text-white placeholder:text-white/40 focus:border-amber-400/60"
                  data-ocid="search-page-input"
                />
              </div>
              {query && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuery("")}
                  className="h-12 px-4 gap-1.5 glass-card border-white/25 text-white hover:bg-white/20"
                  data-ocid="search-clear-btn"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Filter chips */}
            <div
              className="flex flex-wrap gap-2"
              data-ocid="search-filter-chips"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-smooth border ${
                    activeFilter === f.id
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "glass-card border-white/20 text-white/80 hover:bg-white/20"
                  }`}
                  data-ocid={`search-filter-${f.id}`}
                >
                  <span>{f.emoji}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p
            className="text-sm text-muted-foreground"
            data-ocid="search-count-indicator"
          >
            Showing{" "}
            <span className="font-semibold text-foreground">
              {results.length}
            </span>{" "}
            of <span className="font-semibold text-foreground">{TOTAL}</span>{" "}
            destinations
          </p>
          {query && results.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              "{query}"
            </Badge>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((dest, i) => (
              <DestCard key={dest.id} dest={dest} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="search-empty-state"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              No destinations found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Try a different keyword, or clear filters to see all destinations.
            </p>
            <Button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("all");
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold"
              data-ocid="search-empty-clear-btn"
            >
              Show All Destinations
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
