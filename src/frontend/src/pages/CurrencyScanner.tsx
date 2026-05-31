import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ALL_CURRENCIES,
  CURRENCY_FLAGS,
  currencyRates,
} from "@/data/currencyRates";
import type { CurrencyRate } from "@/types/travel";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Camera,
  CircleDollarSign,
  Clock,
  Eye,
  Info,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function minutesAgo(timestampNs: bigint): number {
  const nowMs = Date.now();
  const tsMs = Number(timestampNs) / 1_000_000;
  return Math.floor((nowMs - tsMs) / 60_000);
}

function buildRatesFromCache(raw: Array<[string, number]>): CurrencyRate[] {
  return raw
    .map(([code, rate]) => {
      const base = ALL_CURRENCIES.find((c) => c.code === code);
      return base ? { ...base, rate } : null;
    })
    .filter((r): r is CurrencyRate => r !== null);
}

const BANKNOTES = [
  {
    country: "USA",
    currency: "USD",
    notes: ["$1", "$5", "$10", "$20", "$50", "$100"],
    color:
      "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800",
  },
  {
    country: "Europe",
    currency: "EUR",
    notes: ["€5", "€10", "€20", "€50", "€100"],
    color:
      "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800",
  },
  {
    country: "UK",
    currency: "GBP",
    notes: ["£5", "£10", "£20", "£50"],
    color:
      "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800",
  },
  {
    country: "Japan",
    currency: "JPY",
    notes: ["¥1000", "¥5000", "¥10000"],
    color:
      "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800",
  },
  {
    country: "UAE",
    currency: "AED",
    notes: ["د.إ5", "د.إ10", "د.إ50", "د.إ100"],
    color:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800",
  },
];

export default function CurrencyScanner() {
  const [searchCode, setSearchCode] = useState("");
  const [found, setFound] = useState<CurrencyRate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [liveRates, setLiveRates] = useState<CurrencyRate[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<bigint | null>(null);
  const [isLive, setIsLive] = useState(false);

  const { actor } = useActor(createActor);
  const activeRates = liveRates ?? currencyRates;

  const loadRates = useCallback(async () => {
    if (!actor) return;
    try {
      const cache = await actor.getCurrencyRates();
      if (cache && cache.rates.length > 0) {
        const built = buildRatesFromCache(cache.rates);
        if (built.length > 0) {
          setLiveRates(built);
          setLastUpdated(cache.lastUpdated);
          setIsLive(true);
        }
      }
    } catch {
      // fall back to static
    }
  }, [actor]);

  useEffect(() => {
    if (actor) loadRates();
  }, [actor, loadRates]);

  function handleSearch() {
    const code = searchCode.trim().toUpperCase();
    const result = activeRates.find(
      (c) =>
        c.code === code ||
        c.name.toLowerCase().includes(searchCode.toLowerCase()),
    );
    if (result) {
      setFound(result);
      setNotFound(false);
    } else {
      setFound(null);
      setNotFound(true);
    }
  }

  const minAgo = lastUpdated ? minutesAgo(lastUpdated) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ScanIcon className="w-6 h-6 text-accent" />
              <h1 className="font-display font-bold text-2xl md:text-3xl">
                Currency Scanner
              </h1>
            </div>
            {isLive ? (
              <Badge
                className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium"
                variant="outline"
                data-ocid="scanner-live-badge"
              >
                <Wifi className="w-3 h-3" />
                Live rates
                {minAgo !== null && (
                  <span className="flex items-center gap-1 text-xs opacity-80">
                    <Clock className="w-3 h-3" />
                    {minAgo === 0 ? "just now" : `${minAgo}m ago`}
                  </span>
                )}
              </Badge>
            ) : (
              <Badge
                className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium"
                variant="outline"
                data-ocid="scanner-offline-badge"
              >
                <WifiOff className="w-3 h-3" />
                Offline rates
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm ml-9">
            Identify foreign currencies and check {isLive ? "live" : "offline"}{" "}
            rates.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Search by currency code */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              Identify Currency
            </h2>
            <div className="flex gap-3">
              <Input
                placeholder="Enter currency code or name (e.g. USD, Euro)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                data-ocid="scanner-search-input"
              />
              <Button
                type="button"
                onClick={handleSearch}
                className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
                data-ocid="scanner-search-btn"
              >
                Look Up
              </Button>
            </div>

            {found && (
              <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 animate-slide-up space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-xl">
                      {CURRENCY_FLAGS[found.code] ?? "🏳"} {found.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {found.code}
                    </p>
                  </div>
                  <Badge className="text-2xl bg-transparent border-0 p-0">
                    {found.symbol}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-background p-3 border border-border/50">
                    <p className="text-muted-foreground text-xs">
                      1 {found.code} =
                    </p>
                    <p className="font-bold text-accent">
                      ₹{found.rate.toLocaleString()}
                    </p>
                    {isLive && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Live rate
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg bg-background p-3 border border-border/50">
                    <p className="text-muted-foreground text-xs">1 INR =</p>
                    <p className="font-bold text-accent">
                      {found.symbol}
                      {(1 / found.rate).toFixed(5)}
                    </p>
                    {isLive && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Live rate
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {notFound && (
              <p className="text-sm text-destructive flex items-center gap-2 animate-slide-up">
                <Info className="w-4 h-4" />
                Currency not found. Try a different code or name.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Camera notice */}
        <Card className="border-dashed">
          <CardContent className="p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">Visual Currency Recognition</p>
            <p className="text-muted-foreground text-xs max-w-xs mx-auto">
              Camera-based currency scanning coming soon. For now, use the
              search above to identify currencies by code or name.
            </p>
          </CardContent>
        </Card>

        {/* Banknote reference */}
        <div>
          <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-accent" />
            Common Banknote Denominations
          </h2>
          <div className="space-y-3">
            {BANKNOTES.map(({ country, currency, notes, color }) => (
              <div key={currency} className={`rounded-xl border p-4 ${color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">
                    {CURRENCY_FLAGS[currency] ?? "🏳"} {country}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {currency}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {notes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-background/60 text-sm font-mono font-semibold"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
