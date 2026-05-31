// BudgetCalculator.tsx
// Two tabs:
//  1. "Track My Budget" — total budget input, live summary cards, expense entry form, expense list
//  2. "Cost Calculator"  — original destination-based cost estimator (preserved unchanged)
// Backend: getUserBudgetEntries, saveBudgetEntry, deleteBudgetEntry

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { convertAmount, currencyRates } from "@/data/currencyRates";
import { destinations } from "@/data/destinations";
import { useSession } from "@/hooks/useSession";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  Bed,
  Bus,
  Calculator,
  Compass,
  Globe,
  Package,
  PlaneTakeoff,
  PlusCircle,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { createActor } from "../backend";
import type { BudgetEntry } from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

type TravelStyle = "budget" | "standard" | "premium";
type ActiveTab = "tracker" | "calculator";

interface CostBreakdown {
  flights: number;
  hotel: number;
  food: number;
  activities: number;
  transport: number;
  misc: number;
  total: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLE_MULTIPLIERS: Record<TravelStyle, number> = {
  budget: 0.6,
  standard: 1.0,
  premium: 2.2,
};

const STYLE_DESC: Record<TravelStyle, string> = {
  budget: "Hostels, local food, public transit",
  standard: "3-star hotels, mix of dining, comfort",
  premium: "5-star luxury, fine dining, private tours",
};

const STYLE_COLORS: Record<TravelStyle, string> = {
  budget: "bg-emerald-500",
  standard: "bg-primary",
  premium: "bg-accent",
};

const BREAKDOWN_ITEMS = [
  {
    key: "flights",
    label: "Flights (Return)",
    icon: PlaneTakeoff,
    color: "text-blue-500",
  },
  { key: "hotel", label: "Hotel / Stay", icon: Bed, color: "text-purple-500" },
  {
    key: "food",
    label: "Food & Dining",
    icon: Utensils,
    color: "text-orange-500",
  },
  {
    key: "activities",
    label: "Activities & Sightseeing",
    icon: Compass,
    color: "text-green-500",
  },
  {
    key: "transport",
    label: "Local Transport",
    icon: Bus,
    color: "text-cyan-500",
  },
  {
    key: "misc",
    label: "Miscellaneous (10%)",
    icon: Package,
    color: "text-rose-500",
  },
] as const;

const EXPENSE_CATEGORIES = [
  { value: "Food", label: "🍽️ Food" },
  { value: "Accommodation", label: "🏨 Accommodation" },
  { value: "Transport", label: "🚌 Transport" },
  { value: "Activities", label: "🎭 Activities" },
  { value: "Shopping", label: "🛍️ Shopping" },
  { value: "Medical", label: "💊 Medical" },
  { value: "Miscellaneous", label: "📷 Miscellaneous" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Food: "🍽️",
  Accommodation: "🏨",
  Transport: "🚌",
  Activities: "🎭",
  Shopping: "🛍️",
  Medical: "💊",
  Miscellaneous: "📷",
};

// Categories saved by the Cost Calculator tab — used to separate tracker vs calc entries
const CALC_CATEGORIES = new Set([
  "Flights",
  "Hotel",
  "Food",
  "Activities",
  "Transport",
  "Miscellaneous",
]);

// ─── Calculator helpers ───────────────────────────────────────────────────────

function calculateCosts(
  destId: string,
  days: number,
  travelers: number,
  style: TravelStyle,
): CostBreakdown | null {
  const dest = destinations.find((d) => d.id === destId);
  if (!dest) return null;
  const base =
    (dest.costPerPerson ?? dest.pricePerPerson ?? 10000) *
    STYLE_MULTIPLIERS[style];
  const flights = base * 0.35 * travelers;
  const hotel = base * 0.03 * days * travelers;
  const food = base * 0.015 * days * travelers;
  const activities = base * 0.12 * travelers;
  const transport = base * 0.08 * days * travelers * 0.3;
  const subtotal = flights + hotel + food + activities + transport;
  const misc = subtotal * 0.1;
  return {
    flights,
    hotel,
    food,
    activities,
    transport,
    misc,
    total: subtotal + misc,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BudgetCalculator() {
  const navigate = useNavigate();
  const { actor } = useActor(createActor);
  const { session } = useSession();
  const userId = session?.userId ?? "guest";

  const [activeTab, setActiveTab] = useState<ActiveTab>("tracker");

  // ── Shared backend state ──────────────────────────────────────────────────
  const [savedEntries, setSavedEntries] = useState<BudgetEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    if (!actor) return;
    setEntriesLoading(true);
    actor
      .getUserBudgetEntries(userId)
      .then((entries) => setSavedEntries(entries))
      .catch((err) =>
        console.error("[BudgetCalculator] getUserBudgetEntries:", err),
      )
      .finally(() => setEntriesLoading(false));
  }, [actor, userId]);

  async function handleDeleteEntry(id: bigint) {
    if (!actor) return;
    try {
      await actor.deleteBudgetEntry(id);
      setSavedEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("[BudgetCalculator] deleteBudgetEntry:", err);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="bg-card border-b shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Budget Tools
              </Badge>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Budget Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your trip expenses or estimate costs before you book.
            </p>
          </motion.div>

          {/* ── Tab switcher ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-1 mt-6 bg-muted/50 rounded-xl p-1 w-fit"
          >
            <button
              type="button"
              data-ocid="budget-tab.tracker"
              onClick={() => setActiveTab("tracker")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                activeTab === "tracker"
                  ? "bg-card shadow-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="w-4 h-4" />
              Track My Budget
            </button>
            <button
              type="button"
              data-ocid="budget-tab.calculator"
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                activeTab === "calculator"
                  ? "bg-card shadow-subtle text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calculator className="w-4 h-4" />
              Cost Calculator
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "tracker" ? (
          <TrackerTab
            key="tracker"
            actor={actor}
            userId={userId}
            savedEntries={savedEntries}
            entriesLoading={entriesLoading}
            setSavedEntries={setSavedEntries}
            onDelete={handleDeleteEntry}
          />
        ) : (
          <CalculatorTab
            key="calculator"
            actor={actor}
            userId={userId}
            savedEntries={savedEntries}
            entriesLoading={entriesLoading}
            setSavedEntries={setSavedEntries}
            navigate={navigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKER TAB
// ─────────────────────────────────────────────────────────────────────────────

interface TrackerTabProps {
  actor: ReturnType<typeof createActor> | null;
  userId: string;
  savedEntries: BudgetEntry[];
  entriesLoading: boolean;
  setSavedEntries: React.Dispatch<React.SetStateAction<BudgetEntry[]>>;
  onDelete: (id: bigint) => void;
}

function TrackerTab({
  actor,
  userId,
  savedEntries,
  entriesLoading,
  setSavedEntries,
  onDelete,
}: TrackerTabProps) {
  const [totalBudget, setTotalBudget] = useState<string>("");
  const [totalBudgetError, setTotalBudgetError] = useState<string>("");

  // Expense form state
  const [expCategory, setExpCategory] = useState<string>("");
  const [expDescription, setExpDescription] = useState<string>("");
  const [expAmount, setExpAmount] = useState<string>("");
  const [expErrors, setExpErrors] = useState<{
    category?: string;
    amount?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  const budgetNum = useMemo(() => {
    const n = Number.parseFloat(totalBudget);
    return Number.isNaN(n) ? 0 : n;
  }, [totalBudget]);

  // Filter entries to only tracker entries (not from calculator tab)
  // CALC_CATEGORIES is module-level — no dependency needed
  const trackerEntries = useMemo(
    () => savedEntries.filter((e) => !CALC_CATEGORIES.has(e.category)),
    [savedEntries],
  );

  const totalSpent = useMemo(
    () => trackerEntries.reduce((sum, e) => sum + Number(e.amount), 0),
    [trackerEntries],
  );

  const remaining = budgetNum - totalSpent;
  const usedPct =
    budgetNum > 0 ? Math.min((totalSpent / budgetNum) * 100, 100) : 0;

  const remainingColor =
    budgetNum <= 0
      ? "text-muted-foreground"
      : remaining < 0
        ? "text-red-500"
        : remaining / budgetNum < 0.2
          ? "text-amber-500"
          : "text-emerald-500";

  const progressColor =
    budgetNum <= 0
      ? "bg-muted"
      : usedPct >= 100
        ? "bg-red-500"
        : usedPct >= 80
          ? "bg-amber-500"
          : "bg-emerald-500";

  const remainingCardBg =
    budgetNum <= 0
      ? "bg-muted/40"
      : remaining < 0
        ? "bg-red-500/10 border-red-500/30"
        : remaining / budgetNum < 0.2
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-emerald-500/10 border-emerald-500/30";

  function validateBudget() {
    const n = Number.parseFloat(totalBudget);
    if (!totalBudget || Number.isNaN(n) || n <= 0) {
      setTotalBudgetError("Please enter a valid budget greater than 0");
      return false;
    }
    setTotalBudgetError("");
    return true;
  }

  function validateExpense() {
    const errors: { category?: string; amount?: string } = {};
    if (!expCategory) errors.category = "Please select a category";
    const amt = Number.parseFloat(expAmount);
    if (!expAmount || Number.isNaN(amt) || amt <= 0)
      errors.amount = "Amount must be greater than 0";
    setExpErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleAddExpense() {
    if (!validateBudget()) return;
    if (!validateExpense()) return;
    if (!actor) return;

    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const id = await actor.saveBudgetEntry(
        userId,
        expCategory,
        expDescription || `${expCategory} expense`,
        Number.parseFloat(expAmount),
        "INR",
        today,
      );
      const newEntry: BudgetEntry = {
        id,
        userId,
        category: expCategory,
        description: expDescription || `${expCategory} expense`,
        amount: Number.parseFloat(expAmount),
        currency: "INR",
        date: today,
        createdAt: BigInt(Date.now()),
      };
      setSavedEntries((prev) => [newEntry, ...prev]);
      setExpCategory("");
      setExpDescription("");
      setExpAmount("");
      setExpErrors({});
    } catch (err) {
      console.error("[TrackerTab] saveBudgetEntry:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
    >
      {/* ── Total Budget Input ── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              Set Your Total Budget
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter the total amount you plan to spend on this trip
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg pointer-events-none select-none">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 50000"
              value={totalBudget}
              data-ocid="tracker.total-budget-input"
              onChange={(e) => {
                setTotalBudget(e.target.value);
                if (Number.parseFloat(e.target.value) > 0)
                  setTotalBudgetError("");
              }}
              onBlur={validateBudget}
              className={`pl-9 text-lg font-semibold h-12 ${totalBudgetError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
          </div>
          {totalBudget && !totalBudgetError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0"
            >
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                Budget set: ₹{Number.parseFloat(totalBudget).toLocaleString()}
              </span>
            </motion.div>
          )}
        </div>
        {totalBudgetError && (
          <p
            className="text-red-500 text-xs mt-1.5"
            data-ocid="tracker.budget-error"
          >
            {totalBudgetError}
          </p>
        )}
      </Card>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-5 bg-primary/5 border-primary/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Total Budget
            </p>
            <p
              className="text-2xl font-display font-bold text-primary"
              data-ocid="tracker.total-budget-display"
            >
              {budgetNum > 0 ? `₹${budgetNum.toLocaleString()}` : "—"}
            </p>
          </Card>
        </motion.div>

        {/* Amount Spent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 bg-rose-500/5 border-rose-500/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Amount Spent
            </p>
            <p
              className="text-2xl font-display font-bold text-rose-500"
              data-ocid="tracker.amount-spent-display"
            >
              ₹{totalSpent.toLocaleString()}
            </p>
          </Card>
        </motion.div>

        {/* Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className={`p-5 border ${remainingCardBg}`}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Remaining
            </p>
            <p
              className={`text-2xl font-display font-bold ${remainingColor}`}
              data-ocid="tracker.remaining-display"
            >
              {budgetNum > 0
                ? `${remaining < 0 ? "-" : ""}₹${Math.abs(remaining).toLocaleString()}`
                : "—"}
            </p>
            {remaining < 0 && budgetNum > 0 && (
              <p className="text-xs text-red-500 mt-0.5 font-medium">
                Over budget!
              </p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ── Progress bar ── */}
      {budgetNum > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
          data-ocid="tracker.progress-section"
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
            <span>Budget used</span>
            <span className={usedPct >= 100 ? "text-red-500 font-bold" : ""}>
              {Math.round(usedPct)}%{usedPct >= 100 && " — Over budget!"}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-smooth ${progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${usedPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹0</span>
            <span>₹{budgetNum.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* ── Add Expense Form ── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-accent" />
          </div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Add Expense
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-category">Category *</Label>
            <Select
              value={expCategory}
              onValueChange={(v) => {
                setExpCategory(v);
                if (v) setExpErrors((e) => ({ ...e, category: undefined }));
              }}
            >
              <SelectTrigger
                id="exp-category"
                data-ocid="tracker.category-select"
                className={expErrors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {expErrors.category && (
              <p
                className="text-red-500 text-xs"
                data-ocid="tracker.category-error"
              >
                {expErrors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-desc">Description (optional)</Label>
            <Input
              id="exp-desc"
              placeholder="e.g. Dinner at hotel"
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              data-ocid="tracker.description-input"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold pointer-events-none select-none">
                ₹
              </span>
              <Input
                id="exp-amount"
                type="number"
                min={0}
                placeholder="e.g. 2000"
                value={expAmount}
                onChange={(e) => {
                  setExpAmount(e.target.value);
                  if (Number.parseFloat(e.target.value) > 0)
                    setExpErrors((er) => ({ ...er, amount: undefined }));
                }}
                className={`pl-8 ${expErrors.amount ? "border-red-500" : ""}`}
                data-ocid="tracker.amount-input"
              />
            </div>
            {expErrors.amount && (
              <p
                className="text-red-500 text-xs"
                data-ocid="tracker.amount-error"
              >
                {expErrors.amount}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            onClick={handleAddExpense}
            disabled={saving}
            data-ocid="tracker.add-expense-btn"
            className="font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Expense
              </span>
            )}
          </Button>
          {budgetNum <= 0 && (
            <p className="text-xs text-amber-500 font-medium">
              ⚠ Set your total budget first to start tracking
            </p>
          )}
        </div>
      </Card>

      {/* ── Expense List ── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            Expenses
            {entriesLoading && (
              <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
            )}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {trackerEntries.length}{" "}
            {trackerEntries.length === 1 ? "entry" : "entries"}
          </Badge>
        </div>

        <AnimatePresence>
          {trackerEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 rounded-xl bg-muted/30 border border-dashed border-border"
              data-ocid="tracker.empty-state"
            >
              <span className="text-4xl mb-3">💸</span>
              <p className="font-semibold text-foreground text-sm">
                No expenses added yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start tracking your trip costs using the form above
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2" data-ocid="tracker.expense-list">
              {trackerEntries.map((entry, i) => (
                <motion.div
                  key={String(entry.id)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-smooth group"
                  data-ocid={`tracker.expense-item.${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-lg shrink-0">
                    {CATEGORY_EMOJI[entry.category] ?? "📌"}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {entry.category}
                      </p>
                      {entry.description &&
                        entry.description !== `${entry.category} expense` && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.description}
                          </p>
                        )}
                    </div>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      ₹{Number(entry.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-fast opacity-0 group-hover:opacity-100"
                    aria-label="Delete expense"
                    data-ocid={`tracker.delete-btn.${i + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}

              <Separator className="my-4" />

              {/* Category breakdown summary */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Breakdown by Category
                </p>
                {EXPENSE_CATEGORIES.map(({ value, label }) => {
                  const catTotal = trackerEntries
                    .filter((e) => e.category === value)
                    .reduce((sum, e) => sum + Number(e.amount), 0);
                  if (catTotal === 0) return null;
                  const pct =
                    totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
                  return (
                    <div key={value}>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-foreground/80">{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {Math.round(pct)}%
                          </span>
                          <span className="font-semibold text-foreground tabular-nums">
                            ₹{catTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary/60"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
                  <span>Total Spent</span>
                  <span className="text-rose-500">
                    ₹{totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR TAB — Original destination-based cost estimator (preserved)
// ─────────────────────────────────────────────────────────────────────────────

interface CalculatorTabProps {
  actor: ReturnType<typeof createActor> | null;
  userId: string;
  savedEntries: BudgetEntry[];
  entriesLoading: boolean;
  setSavedEntries: React.Dispatch<React.SetStateAction<BudgetEntry[]>>;
  navigate: ReturnType<typeof useNavigate>;
}

function CalculatorTab({
  actor,
  userId,
  savedEntries,
  entriesLoading,
  setSavedEntries,
  navigate,
}: CalculatorTabProps) {
  const [destId, setDestId] = useState<string>("");
  const [days, setDays] = useState<number>(5);
  const [travelers, setTravelers] = useState<number>(2);
  const [style, setStyle] = useState<TravelStyle>("standard");
  const [currency, setCurrency] = useState<string>("INR");
  const [calculated, setCalculated] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    destId?: string;
    days?: string;
    travelers?: string;
  }>({});

  // Filter only calculator entries for history table
  // CALC_CATEGORIES is module-level — no dependency needed
  const calcEntries = useMemo(
    () => savedEntries.filter((e) => CALC_CATEGORIES.has(e.category)),
    [savedEntries],
  );

  const breakdown = useMemo<CostBreakdown | null>(() => {
    if (!destId || days < 1 || travelers < 1) return null;
    return calculateCosts(destId, days, travelers, style);
  }, [destId, days, travelers, style]);

  const currencySymbol = useMemo<string>(() => {
    if (currency === "INR") return "₹";
    return currencyRates.find((c) => c.code === currency)?.symbol ?? currency;
  }, [currency]);

  function fmt(amount: number): string {
    const converted =
      currency === "INR" ? amount : convertAmount(amount, "INR", currency);
    const rounded = Math.round(converted);
    return `${currencySymbol}${rounded.toLocaleString()}`;
  }

  function handleReset() {
    setDestId("");
    setDays(5);
    setTravelers(2);
    setStyle("standard");
    setCurrency("INR");
    setCalculated(false);
    setErrors({});
  }

  async function handleCalculate() {
    const newErrors: { destId?: string; days?: string; travelers?: string } =
      {};
    if (!destId) newErrors.destId = "Please select a destination";
    if (days < 1 || days > 60) newErrors.days = "Days must be between 1 and 60";
    if (travelers < 1 || travelers > 20)
      newErrors.travelers = "Travelers must be between 1 and 20";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCalculated(true);
    if (!breakdown || !actor) return;

    const dest = destinations.find((d) => d.id === destId);
    const today = new Date().toISOString().split("T")[0];

    const entries: Array<[string, number]> = [
      ["Flights", breakdown.flights],
      ["Hotel", breakdown.hotel],
      ["Food", breakdown.food],
      ["Activities", breakdown.activities],
      ["Transport", breakdown.transport],
      ["Miscellaneous", breakdown.misc],
    ];

    try {
      for (const [category, amount] of entries) {
        await actor.saveBudgetEntry(
          userId,
          category,
          `${dest?.name ?? "Trip"} — ${style} style, ${days} days`,
          amount,
          currency,
          today,
        );
      }
      const updated = await actor.getUserBudgetEntries(userId);
      setSavedEntries(updated);
    } catch (err) {
      console.error("[CalculatorTab] saveBudgetEntry:", err);
    }
  }

  async function handleDeleteEntry(id: bigint) {
    if (!actor) return;
    try {
      await actor.deleteBudgetEntry(id);
      setSavedEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("[CalculatorTab] deleteBudgetEntry:", err);
    }
  }

  const dest = destinations.find((d) => d.id === destId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8"
    >
      {/* Form panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="lg:col-span-2 space-y-6"
      >
        <Card className="p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg text-foreground">
            Trip Details
          </h2>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select
              value={destId}
              onValueChange={(v) => {
                setDestId(v);
                if (v) setErrors((e) => ({ ...e, destId: undefined }));
              }}
            >
              <SelectTrigger
                id="destination"
                data-ocid="budget-dest-select"
                className={errors.destId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Choose a destination" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  India
                </div>
                {destinations
                  .filter((d) => d.type === "indian")
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">
                  International
                </div>
                {destinations
                  .filter((d) => d.type === "international")
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.destId && (
              <p className="text-red-500 text-xs mt-1">{errors.destId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={60}
                value={days}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setDays(val);
                  if (val >= 1 && val <= 60)
                    setErrors((er) => ({ ...er, days: undefined }));
                }}
                className={errors.days ? "border-red-500" : ""}
                data-ocid="budget-days-input"
              />
              {errors.days && (
                <p className="text-red-500 text-xs mt-1">{errors.days}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelers">Travelers</Label>
              <Input
                id="travelers"
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setTravelers(val);
                  if (val >= 1 && val <= 20)
                    setErrors((er) => ({ ...er, travelers: undefined }));
                }}
                className={errors.travelers ? "border-red-500" : ""}
                data-ocid="budget-travelers-input"
              />
              {errors.travelers && (
                <p className="text-red-500 text-xs mt-1">{errors.travelers}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Travel Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["budget", "standard", "premium"] as TravelStyle[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  data-ocid={`budget-style-${s}`}
                  className={`p-3 rounded-xl border-2 text-center transition-smooth ${
                    style === s
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mx-auto mb-1 ${STYLE_COLORS[s]}`}
                  />
                  <div className="text-xs font-semibold text-foreground capitalize">
                    {s}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{STYLE_DESC[style]}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" data-ocid="budget-currency-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                {currencyRates.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              size="lg"
              onClick={handleCalculate}
              data-ocid="budget-calculate-btn"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleReset}
              aria-label="Reset"
              data-ocid="budget-reset-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Results panel */}
      <div className="lg:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          {calculated && breakdown ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Total card */}
              <Card className="p-6 bg-primary text-primary-foreground">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-80 mb-1">Estimated Total</p>
                    <p className="text-4xl font-display font-bold">
                      {fmt(breakdown.total)}
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      for {travelers} traveler{travelers > 1 ? "s" : ""} ×{" "}
                      {days} days to {dest?.name}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-60" />
                </div>
                <div className="mt-4 pt-4 border-t border-primary-foreground/20 flex items-center gap-2">
                  <Users className="w-4 h-4 opacity-70" />
                  <span className="text-sm opacity-80">
                    Per person:{" "}
                    <strong>{fmt(breakdown.total / travelers)}</strong>
                  </span>
                </div>
              </Card>

              {/* Bar chart */}
              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">
                  Cost Breakdown
                </h3>
                <div className="space-y-4">
                  {BREAKDOWN_ITEMS.map(({ key, label, icon: Icon, color }) => {
                    const amount = breakdown[
                      key as keyof CostBreakdown
                    ] as number;
                    const pct = Math.round((amount / breakdown.total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                            <span className="text-sm text-foreground truncate">
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs text-muted-foreground">
                              {pct}%
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {fmt(amount)}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{fmt(breakdown.total)}</span>
                  </div>
                </div>
              </Card>

              {/* Per-person breakdown */}
              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  Per-Person Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {BREAKDOWN_ITEMS.map(({ key, label, icon: Icon, color }) => {
                    const amount =
                      (breakdown[key as keyof CostBreakdown] as number) /
                      travelers;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/40"
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {label}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {fmt(amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* CTA */}
              <Card className="p-6 bg-accent/5 border-accent/20">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Globe className="w-8 h-8 text-accent" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Ready to make it real?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Book your {dest?.name} trip with this budget
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    data-ocid="budget-book-cta"
                    onClick={() =>
                      navigate({
                        to: "/travel-plan",
                        search: {
                          destination: dest?.name ?? "",
                          budget: String(Math.round(breakdown.total)),
                        } as Record<string, string>,
                      })
                    }
                  >
                    Book This Trip
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-80 bg-muted/30 rounded-2xl border border-dashed border-border"
              data-ocid="budget-empty-state"
            >
              <Calculator className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium">
                Fill in your trip details
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Select a destination and hit Calculate
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Saved Budget History ── */}
        {(calcEntries.length > 0 || entriesLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  📊 Budget History
                  {entriesLoading && (
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block ml-1" />
                  )}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {calcEntries.length} entries
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Category
                      </th>
                      <th className="py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Description
                      </th>
                      <th className="py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                        Amount
                      </th>
                      <th className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Date
                      </th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {calcEntries.map((entry, i) => (
                      <tr
                        key={String(entry.id)}
                        className="border-b border-border/50 hover:bg-muted/20 transition-fast"
                        data-ocid={`budget-history-row.${i + 1}`}
                      >
                        <td className="py-2.5 pr-3">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium"
                          >
                            {entry.category}
                          </Badge>
                        </td>
                        <td
                          className="py-2.5 pr-3 text-muted-foreground truncate max-w-[140px]"
                          title={entry.description}
                        >
                          {entry.description}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-semibold text-foreground tabular-nums">
                          {entry.currency}{" "}
                          {Number(entry.amount).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">
                          {entry.date}
                        </td>
                        <td className="py-2.5 pl-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-fast"
                            aria-label="Delete entry"
                            data-ocid={`budget-delete-entry.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Trend hint */}
        {calculated && breakdown && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border"
          >
            <TrendingDown className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                Want to track actual spending?
              </span>{" "}
              Switch to the{" "}
              <button
                type="button"
                className="text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-smooth"
                onClick={() => {
                  // Handled by parent tab switcher — trigger by scrolling to tab
                  const tabBtn = document.querySelector<HTMLButtonElement>(
                    '[data-ocid="budget-tab.tracker"]',
                  );
                  tabBtn?.click();
                }}
              >
                Track My Budget
              </button>{" "}
              tab to log real expenses.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
