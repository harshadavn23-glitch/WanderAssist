import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertAmount, currencyRates } from "@/data/currencyRates";
import {
  destinations,
  getRandomDestination,
  searchDestinations,
} from "@/data/destinations";
import { useBookings } from "@/hooks/useBookings";
import { useFavorites } from "@/hooks/useFavorites";
import { useSession } from "@/hooks/useSession";
import type { Destination } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Clock,
  Compass,
  DollarSign,
  Heart,
  Map as MapIcon,
  MapPin,
  Package,
  Plane,
  RefreshCw,
  Search,
  Shuffle,
  Star,
  Sun,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ElementType, useEffect, useMemo, useRef, useState } from "react";
import { ImageWithFallback } from "../components/ImageWithFallback";

// ─── Types ────────────────────────────────────────────────────────────────────

type Season = "Summer" | "Winter" | "Monsoon" | "Autumn";

interface WeatherDay {
  day: string;
  temp: number;
  icon: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  forecast: WeatherDay[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const featuredDestinations = destinations.slice(0, 6);

const travelUpdates = [
  {
    id: "1",
    icon: "✈️",
    title: "Air India Launches New Route: Mumbai–Bali Direct",
    date: "Apr 10, 2026",
    category: "Airlines",
  },
  {
    id: "2",
    icon: "🏨",
    title: "Maldives Opens Exclusive Overwater Villas — Book Early",
    date: "Apr 8, 2026",
    category: "Hotels",
  },
  {
    id: "3",
    icon: "🎫",
    title: "Rajasthan Heritage Tourism Festival — Limited Passes Available",
    date: "Apr 6, 2026",
    category: "Events",
  },
];

const weatherByDestination: Record<string, WeatherData> = {
  Goa: {
    temp: 32,
    condition: "Sunny",
    icon: "☀️",
    humidity: 78,
    wind: 14,
    forecast: [
      { day: "Mon", temp: 32, icon: "☀️" },
      { day: "Tue", temp: 30, icon: "⛅" },
      { day: "Wed", temp: 28, icon: "🌦️" },
      { day: "Thu", temp: 29, icon: "⛅" },
      { day: "Fri", temp: 31, icon: "☀️" },
    ],
  },
  Kerala: {
    temp: 27,
    condition: "Partly Cloudy",
    icon: "⛅",
    humidity: 85,
    wind: 10,
    forecast: [
      { day: "Mon", temp: 27, icon: "⛅" },
      { day: "Tue", temp: 26, icon: "🌧️" },
      { day: "Wed", temp: 25, icon: "🌧️" },
      { day: "Thu", temp: 27, icon: "⛅" },
      { day: "Fri", temp: 28, icon: "☀️" },
    ],
  },
  Manali: {
    temp: 8,
    condition: "Snowy",
    icon: "❄️",
    humidity: 60,
    wind: 20,
    forecast: [
      { day: "Mon", temp: 8, icon: "❄️" },
      { day: "Tue", temp: 5, icon: "🌨️" },
      { day: "Wed", temp: 3, icon: "🌨️" },
      { day: "Thu", temp: 6, icon: "❄️" },
      { day: "Fri", temp: 9, icon: "⛅" },
    ],
  },
  Bali: {
    temp: 29,
    condition: "Tropical",
    icon: "🌴",
    humidity: 82,
    wind: 12,
    forecast: [
      { day: "Mon", temp: 29, icon: "☀️" },
      { day: "Tue", temp: 28, icon: "⛅" },
      { day: "Wed", temp: 27, icon: "🌦️" },
      { day: "Thu", temp: 29, icon: "☀️" },
      { day: "Fri", temp: 30, icon: "☀️" },
    ],
  },
  Paris: {
    temp: 14,
    condition: "Cloudy",
    icon: "🌥️",
    humidity: 65,
    wind: 18,
    forecast: [
      { day: "Mon", temp: 14, icon: "🌥️" },
      { day: "Tue", temp: 12, icon: "🌧️" },
      { day: "Wed", temp: 13, icon: "⛅" },
      { day: "Thu", temp: 15, icon: "⛅" },
      { day: "Fri", temp: 16, icon: "☀️" },
    ],
  },
};

const weatherCities = Object.keys(weatherByDestination);

const seasonDestinationMap: Record<Season, string[]> = {
  Summer: ["Manali", "Ladakh", "Shimla", "Goa", "Maldives", "Bali"],
  Winter: ["Goa", "Kerala", "Jaipur", "Dubai", "Singapore", "Maldives"],
  Monsoon: ["Kerala", "Coorg", "Munnar", "Bali", "Pondicherry", "Goa"],
  Autumn: ["Manali", "Paris", "Tokyo", "Jaipur", "Darjeeling", "Mysore"],
};

const SCANNED_CURRENCIES = [
  { name: "Indian Rupee", symbol: "₹", code: "INR", amount: 500 },
  { name: "US Dollar", symbol: "$", code: "USD", amount: 50 },
  { name: "Euro", symbol: "€", code: "EUR", amount: 50 },
  { name: "UAE Dirham", symbol: "د.إ", code: "AED", amount: 200 },
  { name: "Japanese Yen", symbol: "¥", code: "JPY", amount: 5000 },
];

const SPARKLINE_DATA = [100, 102, 99, 103, 101];

type AppRoute =
  | "/search"
  | "/budget-travel"
  | "/map"
  | "/senior-tours"
  | "/package-tours"
  | "/women-community"
  | "/travel-plan";

type QuickCard = {
  label: string;
  subtitle: string;
  icon: ElementType;
  gradient: string;
} & ({ action: "random"; to?: never } | { to: AppRoute; action?: never });

const quickAccessCards: QuickCard[] = [
  {
    label: "Random Travel",
    subtitle: "Get Surprised",
    icon: Shuffle,
    gradient: "from-amber-500 to-orange-600",
    action: "random",
  },
  {
    label: "Search Destinations",
    subtitle: "Find your dream place",
    icon: Search,
    gradient: "from-blue-600 to-cyan-500",
    to: "/search",
  },
  {
    label: "Budget Travel",
    subtitle: "Travel within your budget",
    icon: DollarSign,
    gradient: "from-emerald-500 to-teal-600",
    to: "/budget-travel",
  },
  {
    label: "Interactive Map",
    subtitle: "Explore on map",
    icon: MapIcon,
    gradient: "from-sky-500 to-indigo-600",
    to: "/map",
  },
  {
    label: "Senior Citizen Tours",
    subtitle: "Comfortable travel for seniors",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    to: "/senior-tours",
  },
  {
    label: "Package Tours",
    subtitle: "Family, Couples, Senior packages",
    icon: Briefcase,
    gradient: "from-violet-500 to-purple-600",
    to: "/package-tours",
  },
  {
    label: "Women Community",
    subtitle: "Connect with women travelers",
    icon: Users,
    gradient: "from-fuchsia-500 to-rose-500",
    to: "/women-community",
  },
];

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({
  data,
  color = "#f59e0b",
}: { data: number[]; color?: string }) {
  const w = 80;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Rate trend sparkline"
    >
      <title>Rate trend sparkline</title>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((v, i) => (
        <circle
          key={`sp-${i}-${v}`}
          cx={(i / (data.length - 1)) * w}
          cy={h - ((v - min) / range) * (h - 4) - 2}
          r="2.5"
          fill={color}
        />
      ))}
    </svg>
  );
}

// ─── Destination Card (magazine style, full image) ─────────────────────────────

function DestCard({ dest, index }: { dest: Destination; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group cursor-pointer rounded-2xl overflow-hidden relative w-full text-left transition-smooth hover:scale-[1.03] hover:shadow-hero"
      style={{ minHeight: "260px" }}
      onClick={() =>
        navigate({ to: "/travel-plan", search: { destination: dest.name } })
      }
      data-ocid={`dest-card-${dest.id}`}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={dest.image}
          alt={dest.name}
          fallbackLabel={dest.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
        />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 card-overlay-strong" />
      {/* Type badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className="glass-card text-white border-0 text-xs">
          {dest.type === "indian" ? "🇮🇳 India" : "🌍 International"}
        </Badge>
      </div>
      {/* Price badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          ₹{((dest.costPerPerson ?? 0) / 1000).toFixed(0)}K
        </span>
      </div>
      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <h3 className="font-display font-bold text-white text-xl text-shadow-hero leading-tight">
          {dest.name}
        </h3>
        <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5 mb-2">
          <MapPin className="w-3 h-3" />
          {dest.region}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/70" />
            <span className="text-white/70 text-xs">{dest.duration} days</span>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              navigate({
                to: "/travel-plan",
                search: { destination: dest.name },
              });
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Random Destination Modal ──────────────────────────────────────────────────

function RandomDestinationModal({
  dest,
  onBook,
  onClose,
}: { dest: Destination; onBook: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-2xl overflow-hidden max-w-sm w-full shadow-hero"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-52">
          <ImageWithFallback
            src={dest.image}
            alt={dest.name}
            fallbackLabel={dest.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 card-overlay" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500/90 text-white border-0 text-xs gap-1">
              <Shuffle className="w-3 h-3" />🎲 Random Pick
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-display font-bold text-white text-2xl text-shadow-hero">
              {dest.name}
            </h3>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {dest.region}
            </p>
          </div>
        </div>
        <div className="bg-card p-5">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {dest.description}
          </p>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-muted-foreground">
                Starting from
              </span>
              <p className="font-display font-bold text-xl text-amber-500">
                ₹{(dest.costPerPerson ?? 0).toLocaleString("en-IN")}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  /person
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Duration</span>
              <p className="font-semibold text-foreground">
                {dest.duration} days
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border"
              onClick={onClose}
            >
              Try Again
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold"
              onClick={onBook}
              data-ocid="random-modal-book-btn"
            >
              Book This Trip <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Currency Converter Card ───────────────────────────────────────────────────

function CurrencyConverterCard() {
  const [amount, setAmount] = useState("1000");
  const [fromCode, setFromCode] = useState("INR");
  const [toCode, setToCode] = useState("USD");
  const [result, setResult] = useState<number | null>(null);

  const currencyOptions = useMemo(
    () => [
      { code: "INR", symbol: "₹", name: "Indian Rupee" },
      ...currencyRates,
    ],
    [],
  );

  const handleConvert = () => {
    const num = Number.parseFloat(amount);
    if (!Number.isNaN(num) && num > 0)
      setResult(convertAmount(num, fromCode, toCode));
  };

  const fromCurrency = currencyOptions.find((c) => c.code === fromCode);
  const toCurrency = currencyOptions.find((c) => c.code === toCode);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)",
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="font-display font-bold text-white text-lg">
            Currency Converter
          </h3>
          <p className="text-xs text-white/50">Real-time rates</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-amber-400" />
        </div>
      </div>
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            data-ocid="converter-amount-input"
          />
          <Select value={fromCode} onValueChange={setFromCode}>
            <SelectTrigger
              className="w-24 bg-white/10 border-white/20 text-white"
              data-ocid="converter-from-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/20" />
          <button
            type="button"
            onClick={() => {
              const tmp = fromCode;
              setFromCode(toCode);
              setToCode(tmp);
              setResult(null);
            }}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-amber-500/30 transition-fast"
            aria-label="Swap currencies"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="flex-1 h-px bg-white/20" />
        </div>
        <Select value={toCode} onValueChange={setToCode}>
          <SelectTrigger
            className="w-full bg-white/10 border-white/20 text-white"
            data-ocid="converter-to-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleConvert}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0"
          data-ocid="converter-convert-btn"
        >
          Convert
        </Button>
      </div>
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 border border-white/20 rounded-xl p-4 relative z-10"
        >
          <p className="text-xs text-white/60 mb-1">
            {amount} {fromCurrency?.name} =
          </p>
          <p className="font-display font-bold text-2xl text-amber-400">
            {toCurrency?.symbol}
            {result.toFixed(2)}
            <span className="text-sm ml-1 font-normal text-white/50">
              {toCode}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-white/60">Rate trend (7d)</span>
            <Sparkline data={SPARKLINE_DATA} color="#f59e0b" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Currency Scanner Card ─────────────────────────────────────────────────────

function CurrencyScannerCard() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<(typeof SCANNED_CURRENCIES)[0] | null>(
    null,
  );

  const handleScan = () => {
    setScanning(true);
    setScanned(null);
    setTimeout(() => {
      const pick =
        SCANNED_CURRENCIES[
          Math.floor(Math.random() * SCANNED_CURRENCIES.length)
        ];
      setScanned(pick);
      setScanning(false);
    }, 2200);
  };

  const getConvertedAmounts = () => {
    if (!scanned) return [];
    const targets = ["USD", "EUR", "AED", "GBP"]
      .filter((c) => c !== scanned.code)
      .slice(0, 3);
    return targets.map((code) => {
      const rate = currencyRates.find((r) => r.code === code);
      return {
        code,
        symbol: rate?.symbol ?? code,
        value: convertAmount(
          scanned.code === "INR"
            ? scanned.amount
            : convertAmount(scanned.amount, scanned.code, "INR"),
          "INR",
          code,
        ),
      };
    });
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, #0f766e 0%, #0a1628 100%)",
      }}
    >
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="font-display font-bold text-white text-lg">
            Currency Scanner
          </h3>
          <p className="text-xs text-white/50">Identify & convert</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-400/20 flex items-center justify-center">
          <Camera className="w-5 h-5 text-teal-300" />
        </div>
      </div>
      <button
        type="button"
        onClick={handleScan}
        disabled={scanning}
        className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-teal-400/60 hover:bg-white/5 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed relative z-10"
        data-ocid="scanner-scan-btn"
      >
        {scanning ? (
          <>
            <RefreshCw className="w-5 h-5 text-teal-300 animate-spin" />
            <span className="text-sm font-medium text-white/70">
              Scanning...
            </span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 text-white/50" />
            <span className="text-sm font-medium text-white">
              Scan Currency
            </span>
          </>
        )}
      </button>
      <AnimatePresence mode="wait">
        {scanning && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4 relative z-10"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-teal-400/20" />
              <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
              <Camera className="absolute inset-0 m-auto w-6 h-6 text-teal-300" />
            </div>
            <p className="text-sm text-white/50 animate-pulse">
              Detecting currency...
            </p>
          </motion.div>
        )}
        {scanned && !scanning && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/10 rounded-xl p-4 space-y-3 relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                {scanned.symbol}
              </div>
              <div>
                <p className="text-xs text-white/60">Detected</p>
                <p className="font-semibold text-white text-sm">
                  {scanned.symbol}
                  {scanned.amount} {scanned.name}
                </p>
              </div>
              <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                Detected ✓
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {getConvertedAmounts().map(({ code, symbol, value }) => (
                <div
                  key={code}
                  className="bg-white/10 rounded-lg p-2 text-center"
                >
                  <p className="text-xs text-white/60">{code}</p>
                  <p className="font-bold text-amber-400 text-sm">
                    {symbol}
                    {value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Weather Widget ────────────────────────────────────────────────────────────

function WeatherWidget() {
  const [city, setCity] = useState("Goa");
  const weather = weatherByDestination[city] ?? weatherByDestination.Goa;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background:
          "linear-gradient(135deg, #1e3a5f 0%, #075985 50%, #0369a1 100%)",
      }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="font-display font-bold text-white text-lg">
            Weather Forecast
          </h3>
          <p className="text-xs text-white/50">Travel destination weather</p>
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger
            className="w-28 h-8 text-sm bg-white/15 border-white/20 text-white"
            data-ocid="weather-city-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weatherCities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="text-6xl">{weather.icon}</div>
        <div>
          <p className="font-display font-bold text-4xl text-white">
            {weather.temp}°<span className="text-2xl">C</span>
          </p>
          <p className="text-sm font-medium text-white/70">
            {weather.condition}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            Humidity {weather.humidity}% · Wind {weather.wind} km/h
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 relative z-10">
        {weather.forecast.map(({ day, temp, icon }) => (
          <div
            key={day}
            className="flex flex-col items-center gap-1 bg-white/10 rounded-xl py-2 px-1"
          >
            <p className="text-xs text-white/60 font-medium">{day}</p>
            <span className="text-lg">{icon}</span>
            <p className="text-xs font-semibold text-white">{temp}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Season Planner ────────────────────────────────────────────────────────────

function SeasonPlanner() {
  const navigate = useNavigate();
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const seasons: Season[] = ["Summer", "Winter", "Monsoon", "Autumn"];
  const seasonIcons: Record<Season, string> = {
    Summer: "☀️",
    Winter: "❄️",
    Monsoon: "🌧️",
    Autumn: "🍂",
  };
  const seasonColors: Record<Season, string> = {
    Summer: "from-amber-600 to-orange-700",
    Winter: "from-sky-600 to-blue-800",
    Monsoon: "from-teal-600 to-cyan-800",
    Autumn: "from-orange-600 to-red-700",
  };

  const matchingDestinations = activeSeason
    ? destinations.filter((d) =>
        seasonDestinationMap[activeSeason].some((name) =>
          d.name.toLowerCase().includes(name.toLowerCase()),
        ),
      )
    : [];

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, #3b1f6e 0%, #1e3a5f 100%)",
      }}
    >
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-violet-400/10 blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <h3 className="font-display font-bold text-white text-lg mb-1">
          Season Planner
        </h3>
        <p className="text-xs text-white/50">
          Pick a season for perfect destinations
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 relative z-10">
        {seasons.map((season) => (
          <button
            key={season}
            type="button"
            onClick={() =>
              setActiveSeason(activeSeason === season ? null : season)
            }
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-smooth font-medium text-sm ${
              activeSeason === season
                ? `bg-gradient-to-br ${seasonColors[season]} border-white/30 text-white shadow-md`
                : "border-white/15 bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            data-ocid={`season-btn-${season.toLowerCase()}`}
          >
            <span className="text-xl">{seasonIcons[season]}</span>
            <span className="text-xs">{season}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeSeason && matchingDestinations.length > 0 && (
          <motion.div
            key={activeSeason}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden relative z-10"
          >
            <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
              Best for {activeSeason}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {matchingDestinations.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/travel-plan",
                      search: { destination: d.name },
                    })
                  }
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-fast text-left group"
                  data-ocid={`season-dest-${d.id}`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={d.image}
                      alt={`${d.name} destination`}
                      fallbackLabel={d.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                      {d.name}
                    </p>
                    <p className="text-xs text-white/50">
                      {d.duration}d · ₹
                      {((d.costPerPerson ?? 0) / 1000).toFixed(0)}k
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { activeBookings } = useBookings();
  const { favorites } = useFavorites();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [randomDest, setRandomDest] = useState<Destination | null>(null);
  const [showModal, setShowModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.loggedIn) navigate({ to: "/login" });
  }, [session, navigate]);

  useEffect(() => {
    if (query.trim().length > 1) setSearchResults(searchDestinations(query));
    else setSearchResults([]);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchResults([]);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRandomTravel = () => {
    const dest = getRandomDestination();
    setRandomDest(dest);
    setShowModal(true);
  };

  const handleBookRandom = () => {
    if (randomDest) {
      setShowModal(false);
      navigate({
        to: "/travel-plan",
        search: { destination: randomDest.name },
      });
    }
  };

  const handleCloseModal = () => {
    const dest = getRandomDestination();
    setRandomDest(dest);
  };

  const userName = session?.userName ?? "Traveler";

  const statsRow = [
    {
      icon: MapPin,
      label: "Destinations",
      value: "18+",
      color: "text-amber-300",
    },
    {
      icon: Package,
      label: "My Bookings",
      value: String(activeBookings.length),
      color: "text-sky-300",
    },
    {
      icon: Heart,
      label: "Saved Favorites",
      value: String(favorites.length),
      color: "text-rose-300",
    },
    {
      icon: Zap,
      label: "Next Trip Awaits",
      value: "✈️",
      color: "text-emerald-300",
    },
  ];

  if (!session?.loggedIn) return null;

  return (
    <div className="animate-fade-in">
      {/* Random Destination Modal */}
      <AnimatePresence>
        {showModal && randomDest && (
          <RandomDestinationModal
            dest={randomDest}
            onBook={handleBookRandom}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      {/* ── Hero Section — clean gradient bg ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient-bg">
        {/* Subtle decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <Plane className="absolute top-24 left-[10%] w-8 h-8 text-blue-300 rotate-12" />
          <Compass className="absolute top-32 right-[15%] w-6 h-6 text-indigo-300" />
          <MapPin className="absolute bottom-32 left-[20%] w-7 h-7 text-blue-200" />
          <Star className="absolute bottom-24 right-[25%] w-5 h-5 text-amber-300" />
          <Sun className="absolute top-20 right-[35%] w-6 h-6 text-amber-200" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Welcome banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 glass-card text-white border-0 text-sm px-4 py-1.5">
              👋 Welcome back, {userName}!
            </Badge>
            <Badge className="mb-6 ml-2 bg-amber-500/25 text-amber-200 border-amber-400/30 text-sm px-4 py-1.5">
              <Plane className="w-3.5 h-3.5 mr-1.5" />
              Your AI Travel Companion
            </Badge>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-3 text-shadow-hero">
              Discover Your Next
              <br />
              <span className="text-gradient-gold">Adventure</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-8 leading-relaxed text-shadow-sm">
              AI-powered travel recommendations for the world's most
              breathtaking destinations — your perfect trip is just one click
              away.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <Button
              type="button"
              size="lg"
              onClick={() => navigate({ to: "/travel-plan" })}
              className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl gap-2 shadow-hero border-0"
              data-ocid="hero-plan-trip-btn"
            >
              <Plane className="w-5 h-5" />
              Plan a Trip
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleRandomTravel}
              className="h-12 px-8 glass-card border-white/30 text-white hover:bg-white/20 font-bold rounded-xl gap-2"
              data-ocid="hero-explore-random-btn"
            >
              <Shuffle className="w-5 h-5" />
              Explore Random
            </Button>
          </motion.div>

          {/* Search bar */}
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative max-w-2xl mx-auto mb-12"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  placeholder="Search destinations (Goa, Bali, Paris...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-11 h-12 rounded-xl text-base glass-card border-white/25 text-white placeholder:text-white/40 focus:border-amber-400/60 focus:bg-white/20"
                  data-ocid="hero-search-input"
                />
              </div>
              <Button
                type="button"
                onClick={() =>
                  navigate({ to: "/search", search: { q: query } })
                }
                className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold border-0"
                data-ocid="hero-search-btn"
              >
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-hero z-20 max-h-64 overflow-y-auto animate-slide-up">
                {searchResults.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-fast text-left"
                    onClick={() => {
                      setQuery("");
                      setSearchResults([]);
                      navigate({
                        to: "/travel-plan",
                        search: { destination: dest.name },
                      });
                    }}
                  >
                    <ImageWithFallback
                      src={dest.image}
                      alt={dest.name}
                      fallbackLabel={dest.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {dest.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {dest.region}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-amber-500 font-semibold">
                      ₹{(dest.costPerPerson ?? 0).toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {statsRow.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="text-center glass-card rounded-xl p-3"
              >
                <div className="flex items-center justify-center mb-1">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="font-display font-bold text-2xl text-white text-shadow-sm">
                  {value}
                </p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-px h-8 bg-white/30" />
          <span className="text-white/40 text-xs">Scroll</span>
        </div>
      </section>

      {/* ── Widgets Row — glass on dark bg ── */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(180deg, #0a1628 0%, #1e3a5f 50%, #0f766e 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Travel Tools
            </p>
            <h2 className="font-display font-bold text-3xl text-white text-shadow-sm">
              Everything You Need
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <CurrencyConverterCard />
            <CurrencyScannerCard />
            <WeatherWidget />
            <SeasonPlanner />
          </div>
        </div>
      </section>

      {/* ── Quick Access Cards — clean dark section ── */}
      <section className="py-16 relative bg-card border-t border-border">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">
              Quick Access
            </p>
            <h2 className="font-display font-bold text-3xl text-foreground">
              Where Would You Like to Go?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessCards.map(
              ({ label, subtitle, icon: Icon, gradient, to, action }, i) => (
                <motion.button
                  key={label}
                  type="button"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => {
                    if (action === "random") handleRandomTravel();
                    else if (to) navigate({ to });
                  }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 border border-border hover:bg-muted hover:scale-105 transition-smooth text-left group"
                  data-ocid={`quick-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-base text-foreground group-hover:text-amber-500 transition-fast">
                      {label}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {subtitle}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0 group-hover:text-amber-500 group-hover:translate-x-1 transition-smooth" />
                </motion.button>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Destinations — full-bleed magazine grid ── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-1">
                Trending Now
              </p>
              <h2 className="font-display font-bold text-3xl text-foreground">
                Featured Destinations
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/search" })}
              className="gap-1 text-amber-500 hover:text-amber-400"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDestinations.map((dest, i) => (
              <DestCard key={dest.id} dest={dest} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel Updates ── */}
      <section className="py-14 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-1">
                Latest
              </p>
              <h2 className="font-display font-bold text-3xl text-foreground">
                Travel Updates
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/travel-updates" })}
              className="gap-1 text-amber-500 hover:text-amber-400"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {travelUpdates.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl hover:shadow-card transition-smooth cursor-pointer"
                data-ocid={`update-card-${update.id}`}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                  {update.icon}
                </div>
                <div className="min-w-0">
                  <Badge className="mb-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-xs">
                    {update.category}
                  </Badge>
                  <p className="text-sm font-semibold text-foreground line-clamp-2">
                    {update.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {update.date}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 relative overflow-hidden bg-card border-t border-border">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/8 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-5xl text-foreground mb-4">
              Ready to Start Your{" "}
              <span className="text-gradient-gold">Adventure</span>?
            </h2>
            <p className="text-muted-foreground text-xl mb-10">
              Plan your dream trip today. Choose from 18+ destinations
              worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                type="button"
                size="lg"
                onClick={() => navigate({ to: "/travel-plan" })}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-10 border-0 shadow-card"
                data-ocid="cta-book-btn"
              >
                Book Your Trip
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/package-tours" })}
                className="border-border font-bold"
              >
                Browse Packages
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
