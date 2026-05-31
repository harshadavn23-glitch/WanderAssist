import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { destinations } from "@/data/destinations";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Compass,
  Heart,
  Hotel,
  MapPin,
  Package,
  Plane,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type TabKey = "all" | "family" | "couples" | "adventure";

interface PackageCard {
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
  type: "family" | "couples" | "adventure";
  popular?: boolean;
}

const getImg = (id: string) =>
  destinations.find((d) => d.id === id)?.image ??
  "/assets/images/placeholder.svg";

const includeIcons = {
  flight: {
    icon: Plane,
    label: "Flight",
    color: "text-sky-300",
    bg: "bg-sky-500/20",
  },
  hotel: {
    icon: Hotel,
    label: "Hotel",
    color: "text-violet-300",
    bg: "bg-violet-500/20",
  },
  food: {
    icon: UtensilsCrossed,
    label: "Meals",
    color: "text-orange-300",
    bg: "bg-orange-500/20",
  },
  guide: {
    icon: Compass,
    label: "Guide",
    color: "text-emerald-300",
    bg: "bg-emerald-500/20",
  },
} as const;

const allPackages: PackageCard[] = [
  {
    id: "fam-goa",
    name: "Goa Family Fun",
    destination: "Goa",
    image: getImg("goa"),
    pricePerPerson: 12000,
    duration: 5,
    highlights: [
      "Pristine beaches",
      "Water sports for kids",
      "Family seafood feasts",
      "Heritage churches",
    ],
    includes: ["hotel", "food", "guide"],
    rating: 4.8,
    reviewCount: 312,
    type: "family",
    popular: true,
  },
  {
    id: "fam-jaipur",
    name: "Jaipur Royal Family",
    destination: "Jaipur",
    image: getImg("jaipur"),
    pricePerPerson: 15000,
    duration: 6,
    highlights: [
      "Camel rides & sand dunes",
      "Amber Fort elephant ride",
      "Cultural folk shows",
      "Palace hotel stay",
    ],
    includes: ["flight", "hotel", "food", "guide"],
    rating: 4.7,
    reviewCount: 245,
    type: "family",
  },
  {
    id: "cpl-paris",
    name: "Paris Romance",
    destination: "Paris",
    image: getImg("paris"),
    pricePerPerson: 65000,
    duration: 7,
    highlights: [
      "Eiffel Tower sunset dinner",
      "Seine river cruise",
      "Louvre Museum visit",
      "Champagne experience",
    ],
    includes: ["flight", "hotel", "food", "guide"],
    rating: 4.9,
    reviewCount: 189,
    type: "couples",
    popular: true,
  },
  {
    id: "cpl-maldives",
    name: "Maldives Paradise",
    destination: "Maldives",
    image: getImg("maldives"),
    pricePerPerson: 75000,
    duration: 5,
    highlights: [
      "Overwater bungalow",
      "Snorkeling & dolphins",
      "Couple spa ritual",
      "Candlelit beach dinner",
    ],
    includes: ["flight", "hotel", "food"],
    rating: 5.0,
    reviewCount: 98,
    type: "couples",
  },
  {
    id: "adv-ladakh",
    name: "Ladakh Extreme Adventure",
    destination: "Ladakh",
    image: getImg("ladakh"),
    pricePerPerson: 28000,
    duration: 9,
    highlights: [
      "Khardung La (world's highest pass)",
      "Pangong Lake camping",
      "White water rafting",
      "Himalayan trekking",
    ],
    includes: ["hotel", "food", "guide"],
    rating: 4.9,
    reviewCount: 167,
    type: "adventure",
    popular: true,
  },
  {
    id: "adv-manali",
    name: "Manali Snow & Thrills",
    destination: "Manali",
    image: getImg("manali"),
    pricePerPerson: 16000,
    duration: 6,
    highlights: [
      "Paragliding over valleys",
      "Rohtang Pass snowfields",
      "Beas River rafting",
      "ATV adventure ride",
    ],
    includes: ["hotel", "food", "guide"],
    rating: 4.7,
    reviewCount: 203,
    type: "adventure",
  },
  {
    id: "adv-bali",
    name: "Bali Adventure Rush",
    destination: "Bali",
    image: getImg("bali"),
    pricePerPerson: 38000,
    duration: 7,
    highlights: [
      "Volcano summit trek",
      "Ubud jungle swing",
      "White-water rafting",
      "Kintamani crater walk",
    ],
    includes: ["flight", "hotel", "food", "guide"],
    rating: 4.8,
    reviewCount: 145,
    type: "adventure",
  },
  {
    id: "adv-rishikesh",
    name: "Rishikesh Thrill Camp",
    destination: "Rishikesh",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
    pricePerPerson: 12000,
    duration: 4,
    highlights: [
      "Ganga rapids white-water rafting",
      "Bungee jumping 83m",
      "Jungle camping",
      "Rock climbing & rappelling",
    ],
    includes: ["hotel", "food", "guide"],
    rating: 4.8,
    reviewCount: 289,
    type: "adventure",
  },
];

const tabs: {
  key: TabKey;
  label: string;
  icon: typeof Users;
  gradient: string;
}[] = [
  {
    key: "all",
    label: "All Packages",
    icon: Package,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    key: "family",
    label: "Family",
    icon: Users,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    key: "couples",
    label: "Couples",
    icon: Heart,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    key: "adventure",
    label: "Adventure",
    icon: Compass,
    gradient: "from-orange-500 to-red-600",
  },
];

const typeBadge: Record<PackageCard["type"], { label: string; cls: string }> = {
  family: {
    label: "Family",
    cls: "bg-sky-500/20 text-sky-300 border-sky-500/20",
  },
  couples: {
    label: "Couples",
    cls: "bg-pink-500/20 text-pink-300 border-pink-500/20",
  },
  adventure: {
    label: "Adventure",
    cls: "bg-orange-500/20 text-orange-300 border-orange-500/20",
  },
};

function PkgCard({ pkg }: { pkg: PackageCard }) {
  const navigate = useNavigate();
  const badge = typeBadge[pkg.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl overflow-hidden transition-smooth hover:scale-[1.03] hover:shadow-hero flex flex-col"
      style={{ minHeight: "320px" }}
      data-ocid={`package-card-${pkg.id}`}
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
      </div>
      <div className="absolute inset-0 card-overlay-strong" />

      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white shadow-md">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </span>
        </div>
      )}

      {/* Duration */}
      <div className="absolute top-3 right-3 z-10">
        <span className="glass-card text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {pkg.duration}d
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex flex-col gap-2">
        {/* Type + name */}
        <Badge className={`self-start text-xs border ${badge.cls}`}>
          {badge.label}
        </Badge>
        <h3 className="font-display font-bold text-white text-lg text-shadow-hero leading-tight truncate">
          {pkg.name}
        </h3>
        <p className="text-white/70 text-xs flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3" />
          {pkg.destination}
        </p>

        {/* Highlights */}
        <ul className="space-y-0.5">
          {pkg.highlights.slice(0, 2).map((h) => (
            <li
              key={h}
              className="flex items-start gap-1.5 text-xs text-white/75"
            >
              <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Includes + Rating + CTA */}
        <div className="flex items-center gap-1 mt-1">
          {pkg.includes.map((key) => {
            const cfg = includeIcons[key];
            const Icon = cfg.icon;
            return (
              <div
                key={key}
                title={cfg.label}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg ${cfg.bg} ${cfg.color}`}
              >
                <Icon className="w-3 h-3" />
                <span className="text-[10px] font-semibold">{cfg.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div>
            <p className="text-xs text-white/60">From</p>
            <p className="font-display font-bold text-amber-400 text-base">
              ₹{pkg.pricePerPerson.toLocaleString("en-IN")}
              <span className="text-xs text-white/50 font-normal">/person</span>
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold gap-1 shrink-0"
            onClick={() => {
              sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
              navigate({ to: "/package-tour-detail" });
            }}
            data-ocid={`book-package-${pkg.id}`}
          >
            View Package
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PackageTours() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const filtered =
    activeTab === "all"
      ? allPackages
      : allPackages.filter((p) => p.type === activeTab);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero with bg image */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge className="mb-3 bg-amber-500/30 text-amber-200 border-amber-400/40 gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Curated Tour Packages
            </Badge>
            <h1 className="font-display font-bold text-5xl text-white text-shadow-hero mb-2">
              Package Tours
            </h1>
            <p className="text-white/70 text-lg">
              Handcrafted packages for families, couples, and thrill-seekers —{" "}
              <span className="font-semibold text-white">
                {allPackages.length} packages
              </span>{" "}
              across top destinations
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div
        className="sticky top-16 z-30 shadow-subtle"
        style={{
          background: "rgba(10,22,40,0.97)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon, gradient }) => {
              const isActive = activeTab === key;
              const count =
                key === "all"
                  ? allPackages.length
                  : allPackages.filter((p) => p.type === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  data-ocid={`package-tab-${key}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-smooth shrink-0 ${
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? "bg-white/20" : "bg-white/10 text-white/60"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Package Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filtered.map((pkg) => (
              <PkgCard key={pkg.id} pkg={pkg} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
