import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_CURRENCIES,
  CURRENCY_FLAGS,
  convertAmount,
  currencyRates,
  getRate,
} from "@/data/currencyRates";
import type { CurrencyRate } from "@/types/travel";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  ArrowLeftRight,
  CircleDollarSign,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const STALE_MINUTES = 60;

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

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("10000");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [liveRates, setLiveRates] = useState<CurrencyRate[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<bigint | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const prevResult = useRef<number | null>(null);

  // Validation errors
  const [amountError, setAmountError] = useState<string>("");

  const { actor } = useActor(createActor);

  const activeRates = liveRates ?? currencyRates;

  const fromInfo = ALL_CURRENCIES.find((c) => c.code === from);
  const toInfo = ALL_CURRENCIES.find((c) => c.code === to);

  // Live conversion as user types
  const amountNum = Number.parseFloat(amount);
  const isValidAmount = !Number.isNaN(amountNum) && amountNum > 0;
  const isSameCurrency = from === to;
  const result =
    isValidAmount && !isSameCurrency
      ? convertAmount(amountNum, from, to, activeRates)
      : null;

  // Fade-in animation when result changes
  useEffect(() => {
    if (result !== prevResult.current) {
      setResultVisible(false);
      const t = setTimeout(() => {
        setResultVisible(true);
        prevResult.current = result;
      }, 80);
      return () => clearTimeout(t);
    }
  }, [result]);

  const loadRatesFromCanister = useCallback(
    async (forceRefresh = false) => {
      if (!actor) return;
      setIsFetchingRates(true);
      try {
        let cache = await actor.getCurrencyRates();

        const isStale = !cache || minutesAgo(cache.lastUpdated) > STALE_MINUTES;

        if (isStale || forceRefresh) {
          // Fetch live rates from a public API via frontend
          try {
            const res = await fetch(
              "https://api.exchangerate-api.com/v4/latest/INR",
            );
            if (res.ok) {
              const data = (await res.json()) as {
                rates: Record<string, number>;
              };
              const supportedCodes = ALL_CURRENCIES.map((c) => c.code).filter(
                (c) => c !== "INR",
              );
              const ratesArr: Array<[string, number]> = supportedCodes
                .filter((code) => data.rates[code] !== undefined)
                .map((code) => [code, 1 / (data.rates[code] as number)]);

              if (ratesArr.length > 0) {
                const nowNs = BigInt(Date.now()) * BigInt(1_000_000);
                await actor.updateCurrencyRates(ratesArr, nowNs);
                cache = await actor.getCurrencyRates();
              }
            }
          } catch {
            // External fetch failed — fall through to use cached or static
          }
        }

        if (cache && cache.rates.length > 0) {
          const built = buildRatesFromCache(cache.rates);
          if (built.length > 0) {
            setLiveRates(built);
            setLastUpdated(cache.lastUpdated);
            setIsLive(true);
          }
        }
      } catch {
        setIsLive(false);
      } finally {
        setIsFetchingRates(false);
      }
    },
    [actor],
  );

  useEffect(() => {
    if (actor) {
      loadRatesFromCanister();
    }
  }, [actor, loadRatesFromCanister]);

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  const minAgo = lastUpdated ? minutesAgo(lastUpdated) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="w-6 h-6 text-accent" />
              <h1 className="font-display font-bold text-2xl md:text-3xl">
                Currency Converter
              </h1>
            </div>
            {/* Live / Offline badge */}
            {isLive ? (
              <Badge
                className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium"
                variant="outline"
                data-ocid="live-rates-badge"
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
                data-ocid="offline-rates-badge"
              >
                <WifiOff className="w-3 h-3" />
                Offline rates
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm ml-9">
            Convert between 19 currencies with{" "}
            {isLive ? "real-time" : "static fallback"} rates.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Main converter card */}
        <Card className="shadow-md">
          <CardContent className="p-6 space-y-5">
            {/* Amount */}
            <div className="space-y-1.5">
              <label
                htmlFor="conv-amount"
                className="text-sm font-semibold text-foreground"
              >
                Amount
              </label>
              <Input
                id="conv-amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  const n = Number.parseFloat(e.target.value);
                  if (!Number.isNaN(n) && n > 0) {
                    setAmountError("");
                  } else {
                    setAmountError(
                      "Please enter a valid amount greater than 0",
                    );
                  }
                }}
                className={`text-xl font-bold h-14 tracking-wide ${amountError ? "border-red-500" : ""}`}
                data-ocid="converter-amount-input"
              />
              {amountError && (
                <p className="text-red-500 text-xs mt-1">{amountError}</p>
              )}
            </div>

            {/* From / To with swap */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div className="space-y-1.5">
                <label
                  htmlFor="conv-from"
                  className="text-sm font-semibold text-foreground"
                >
                  From
                </label>
                <Select
                  value={from}
                  onValueChange={(v) => {
                    setFrom(v);
                  }}
                >
                  <SelectTrigger
                    id="conv-from"
                    className="h-12"
                    data-ocid="converter-from"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {CURRENCY_FLAGS[c.code] ?? "🏳"} {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwap}
                className="h-12 w-12 shrink-0 rounded-full"
                aria-label="Swap currencies"
                data-ocid="converter-swap-btn"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>

              <div className="space-y-1.5">
                <label
                  htmlFor="conv-to"
                  className="text-sm font-semibold text-foreground"
                >
                  To
                </label>
                <Select
                  value={to}
                  onValueChange={(v) => {
                    setTo(v);
                  }}
                >
                  <SelectTrigger
                    id="conv-to"
                    className="h-12"
                    data-ocid="converter-to"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {CURRENCY_FLAGS[c.code] ?? "🏳"} {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isSameCurrency && (
              <p className="text-red-500 text-xs mt-1">
                Please select two different currencies
              </p>
            )}

            {/* Refresh button row */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {isLive
                  ? "Rates from live exchange feed"
                  : "Using built-in fallback rates"}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadRatesFromCanister(true)}
                disabled={isFetchingRates || !actor}
                className="gap-1.5 h-8 text-xs"
                data-ocid="refresh-rates-btn"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isFetchingRates ? "animate-spin" : ""}`}
                />
                {isFetchingRates ? "Refreshing…" : "Refresh rates"}
              </Button>
            </div>

            {/* Live result — no button needed, updates as user types */}
            {result !== null && (
              <div
                className="rounded-xl bg-accent/5 border border-accent/20 p-6 text-center"
                style={{
                  opacity: resultVisible ? 1 : 0,
                  transition: "opacity 0.15s ease",
                }}
                data-ocid="conversion-result"
              >
                <p className="text-sm text-muted-foreground font-medium">
                  {fromInfo?.symbol}
                  {Number(amount).toLocaleString("en-IN")} {from}
                </p>
                <p className="text-5xl font-display font-bold text-accent mt-2 tracking-tight">
                  {toInfo?.symbol}
                  {result.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-muted-foreground text-sm mt-1 font-semibold">
                  {to} — {toInfo?.name}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
                  <span>
                    1 {from} = {getRate(from, to, activeRates).toFixed(4)} {to}
                  </span>
                  <span className="text-border">·</span>
                  <span>
                    1 {to} = {getRate(to, from, activeRates).toFixed(4)} {from}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick reference rates */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Popular Rates (1 INR =)</h2>
              {isLive && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Live
                </span>
              )}
            </div>
            {isFetchingRates ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"].map(
                  (k) => (
                    <div
                      key={k}
                      className="rounded-lg bg-muted/40 p-3 h-16 animate-pulse"
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeRates.slice(0, 9).map((c) => (
                  <div
                    key={c.code}
                    className="rounded-lg bg-muted/40 p-3 text-center hover:bg-muted/70 transition-colors cursor-default"
                  >
                    <p className="text-xs text-muted-foreground">
                      {CURRENCY_FLAGS[c.code] ?? "🏳"} {c.name}
                    </p>
                    <p className="font-bold text-foreground text-sm mt-0.5">
                      {c.symbol} {(1 / c.rate).toFixed(4)}
                    </p>
                    <p className="text-xs text-accent font-medium">{c.code}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
