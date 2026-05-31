import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { destinations } from "@/data/destinations";
import type { Destination } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Lightbulb,
  MapPin,
  Search,
  Shuffle,
  TrendingDown,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function calcTotalCost(dest: Destination, days: number, people: number) {
  const cost = dest.costPerPerson ?? dest.pricePerPerson ?? 10000;
  const dur = dest.duration ?? 5;
  const dailyRate = cost / dur;
  return Math.round(dailyRate * days * people);
}

function filterByBudget(
  dests: Destination[],
  totalBudget: number,
  people: number,
  days: number,
): Destination[] {
  return dests
    .filter((d) => calcTotalCost(d, days, people) <= totalBudget)
    .sort(
      (a, b) => calcTotalCost(a, days, people) - calcTotalCost(b, days, people),
    );
}

function top3Affordable(dests: Destination[]): Destination[] {
  return [...dests]
    .sort(
      (a, b) =>
        (a.costPerPerson ?? a.pricePerPerson ?? 0) -
        (b.costPerPerson ?? b.pricePerPerson ?? 0),
    )
    .slice(0, 3);
}

function ResultCard({
  dest,
  totalCost,
  budget,
  index,
}: { dest: Destination; totalCost: number; budget: number; index: number }) {
  const navigate = useNavigate();
  const savings = Math.round(((budget - totalCost) / budget) * 100);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="group relative rounded-2xl overflow-hidden transition-smooth hover:scale-[1.03] hover:shadow-hero w-full text-left"
      style={{ minHeight: "260px" }}
      onClick={() =>
        navigate({
          to: "/travel-plan",
          search: { destination: dest.name, budget: totalCost },
        })
      }
      data-ocid={`budget-result-${dest.id}`}
    >
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
      {savings > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-emerald-500/90 text-white border-0 text-[11px] font-bold">
            {savings}% under budget
          </Badge>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <h3 className="font-display font-bold text-white text-lg text-shadow-hero leading-tight">
          {dest.name}
        </h3>
        <p className="text-white/75 text-xs flex items-center gap-1 mt-0.5 mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          {dest.region}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Total estimate</p>
            <p className="font-display font-bold text-amber-400 text-base">
              ₹{totalCost.toLocaleString("en-IN")}
            </p>
          </div>
          <Button
            type="button"
            className="h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              navigate({
                to: "/travel-plan",
                search: { destination: dest.name, budget: totalCost },
              });
            }}
            data-ocid={`budget-book-${dest.id}`}
          >
            Book Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </motion.button>
  );
}

function TipCard({ dest }: { dest: Destination }) {
  const navigate = useNavigate();
  const dailyRate = Math.round(
    (dest.costPerPerson ?? dest.pricePerPerson ?? 10000) / (dest.duration ?? 5),
  );

  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-amber-500/40 transition-smooth cursor-pointer group text-left"
      onClick={() =>
        navigate({
          to: "/travel-plan",
          search: {
            destination: dest.name,
            budget: dest.costPerPerson ?? dest.pricePerPerson,
          },
        })
      }
      data-ocid={`budget-tip-${dest.id}`}
    >
      <img
        src={dest.image}
        alt={dest.name}
        className="w-12 h-12 rounded-lg object-cover shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/assets/images/placeholder.svg";
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {dest.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{dest.region}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-bold text-amber-500 text-sm">
          ₹{dailyRate.toLocaleString("en-IN")}
        </p>
        <p className="text-[10px] text-muted-foreground">/person/day</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500 transition-smooth shrink-0" />
    </button>
  );
}

export default function BudgetTravel() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<string>("");
  const [people, setPeople] = useState<string>("2");
  const [days, setDays] = useState(5);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Destination[]>([]);
  const [randomPick, setRandomPick] = useState<Destination | null>(null);

  const budgetNum = Number(budget) || 0;
  const peopleNum = Math.min(Math.max(Number(people) || 1, 1), 20);

  function handleFind() {
    if (!budgetNum) return;
    const filtered = filterByBudget(destinations, budgetNum, peopleNum, days);
    setResults(filtered);
    setSearched(true);
    setRandomPick(null);
  }

  function handleRandom() {
    if (!budgetNum) return;
    const filtered = filterByBudget(destinations, budgetNum, peopleNum, days);
    if (filtered.length === 0) {
      setResults([]);
      setSearched(true);
      setRandomPick(null);
      return;
    }
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    setRandomPick(pick);
    setResults(filtered);
    setSearched(true);
  }

  const affordableTips = top3Affordable(destinations);
  const budgetLabel = budgetNum
    ? `₹${budgetNum.toLocaleString("en-IN")} for ${peopleNum} ${peopleNum === 1 ? "person" : "people"} for ${days} days`
    : "";

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero with bg image */}
      <section
        className="relative py-16"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,22,40,0.85)" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-emerald-500/30 text-emerald-200 border-emerald-500/40 inline-flex items-center">
            <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
            Smart Budget Planning
          </Badge>
          <h1 className="font-display font-bold text-5xl text-white text-shadow-hero mb-3">
            Budget Travel Planner
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Enter your total budget and we'll find the best destinations your
            group can afford — or get a random surprise pick!
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-subtle"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Set Your Budget
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <Label
                htmlFor="budget-input"
                className="text-sm font-semibold text-foreground mb-1.5 block"
              >
                Total Budget (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">
                  ₹
                </span>
                <Input
                  id="budget-input"
                  type="number"
                  min={1000}
                  max={10000000}
                  step={500}
                  placeholder="Enter total budget (e.g. 50000)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-8"
                  data-ocid="budget-amount-input"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10000, 25000, 50000, 75000, 100000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBudget(String(v))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-fast ${budget === String(v) ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    ₹{v >= 100000 ? "1L" : `${v / 1000}K`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label
                htmlFor="people-input"
                className="text-sm font-semibold text-foreground mb-1.5 block"
              >
                Number of People (1–20)
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="people-input"
                  type="number"
                  min={1}
                  max={20}
                  placeholder="2"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="pl-9"
                  data-ocid="budget-people-input"
                />
              </div>
              {budgetNum > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Per person budget:{" "}
                  <span className="font-semibold text-amber-500">
                    ₹{Math.floor(budgetNum / peopleNum).toLocaleString("en-IN")}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="mb-7">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-foreground">
                Trip Duration
              </Label>
              <span className="text-sm font-display font-bold text-amber-500">
                {days} {days === 1 ? "day" : "days"}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={14}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full h-2 appearance-none rounded-full bg-muted cursor-pointer accent-amber-500"
              data-ocid="budget-days-slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>3 days</span>
              <span>7 days</span>
              <span>14 days</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="lg"
              className="flex-1 sm:flex-none px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0"
              onClick={handleFind}
              disabled={!budgetNum || budgetNum < 1000}
              data-ocid="budget-find-btn"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Destinations
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="flex-1 sm:flex-none px-8 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold"
              onClick={handleRandom}
              disabled={!budgetNum || budgetNum < 1000}
              data-ocid="budget-random-btn"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random within Budget
            </Button>
          </div>
        </motion.div>

        {/* Random Pick */}
        <AnimatePresence>
          {randomPick && (
            <motion.div
              key="random-pick"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border-2 border-amber-500/40 overflow-hidden"
              data-ocid="budget-random-pick"
            >
              <div className="relative h-36">
                <img
                  src={randomPick.image}
                  alt={randomPick.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/assets/images/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 card-overlay" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-lg font-display font-bold text-white text-shadow-hero">
                      🎲 {randomPick.name}
                    </span>
                    <Badge className="ml-2 bg-amber-500/90 text-white border-0 text-xs">
                      Random Pick
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-display font-bold text-amber-400 text-base">
                      ₹
                      {calcTotalCost(
                        randomPick,
                        days,
                        peopleNum,
                      ).toLocaleString("en-IN")}
                      <span className="text-xs text-white/60 font-normal ml-1">
                        total
                      </span>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold h-8"
                      onClick={() =>
                        navigate({
                          to: "/travel-plan",
                          search: {
                            destination: randomPick.name,
                            budget: calcTotalCost(randomPick, days, peopleNum),
                          },
                        })
                      }
                      data-ocid="budget-random-book-btn"
                    >
                      Book <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 text-white/70 hover:text-white"
                      onClick={handleRandom}
                      data-ocid="budget-random-reshuffle"
                    >
                      <Shuffle className="w-3.5 h-3.5 mr-1.5" /> Try Another
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {searched && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              data-ocid="budget-results-section"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">
                    {results.length > 0
                      ? `${results.length} Destinations within ${budgetLabel}`
                      : "No results found"}
                  </h2>
                  {results.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Sorted by total cost · lowest first
                    </p>
                  )}
                </div>
                {results.length > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 self-start sm:self-auto">
                    {results.length} match{results.length !== 1 ? "es" : ""}
                  </Badge>
                )}
              </div>
              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.map((dest, i) => (
                    <ResultCard
                      key={dest.id}
                      dest={dest}
                      totalCost={calcTotalCost(dest, days, peopleNum)}
                      budget={budgetNum}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border"
                  data-ocid="budget-empty-state"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    No destinations within this budget
                  </h3>
                  <p className="text-muted-foreground max-w-sm mb-4">
                    Try increasing your budget, reducing travelers, or
                    shortening the trip duration.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[50000, 75000, 100000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setBudget(String(v));
                          setResults(
                            filterByBudget(destinations, v, peopleNum, days),
                          );
                        }}
                        className="px-4 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-fast border border-amber-500/20"
                      >
                        Try ₹{v >= 100000 ? "1L" : `${v / 1000}K`}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Budget Tips */}
        <section className="rounded-2xl bg-card border border-border p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground">
              Budget Tip: Most Affordable Destinations
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            WanderAssist's top picks for budget travellers — great value
            regardless of your budget.
          </p>
          <div className="space-y-3">
            {affordableTips.map((dest) => (
              <TipCard key={dest.id} dest={dest} />
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3">
              ✈️ General Tips to Stretch Your Travel Budget
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Book flights 2–3 months early for up to 40% off",
                "Travel in shoulder season (Apr–Jun, Sep–Oct) for fewer crowds",
                "Choose local guesthouses over hotel chains — save 40–60%",
                "Use public transport and street food to cut daily costs",
                "Group tours share costs — bigger group means bigger savings",
                "Combo packages (flight + hotel) often beat booking separately",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
