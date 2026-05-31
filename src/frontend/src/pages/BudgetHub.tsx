import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Compass,
  MapPin,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";

interface OptionCardProps {
  icon: React.ReactNode;
  accentIcon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  cta: string;
  to: string;
  gradient: string;
  badgeLabel: string;
  badgeClass: string;
  delay: number;
  dataOcid: string;
  ctaOcid: string;
}

function OptionCard({
  icon,
  accentIcon,
  title,
  subtitle,
  description,
  features,
  cta,
  to,
  gradient,
  badgeLabel,
  badgeClass,
  delay,
  dataOcid,
  ctaOcid,
}: OptionCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-accent/30 hover:shadow-elevated transition-smooth cursor-pointer flex flex-col w-full text-left"
      onClick={() => navigate({ to })}
      data-ocid={dataOcid}
      aria-label={title}
    >
      {/* Gradient accent top bar */}
      <div className={`h-1.5 w-full ${gradient}`} />

      {/* Icon hero area */}
      <div className="relative px-8 pt-8 pb-6 flex flex-col items-center text-center">
        {/* Large decorative icon container */}
        <div
          className={`relative w-24 h-24 rounded-2xl ${gradient} bg-opacity-10 flex items-center justify-center mb-5 shadow-subtle group-hover:scale-105 transition-smooth`}
        >
          <div className="absolute inset-0 rounded-2xl opacity-10 bg-foreground" />
          {icon}
          {/* Floating accent icon */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border shadow-subtle flex items-center justify-center">
            {accentIcon}
          </div>
        </div>

        <Badge className={`mb-3 text-xs font-semibold ${badgeClass}`}>
          {badgeLabel}
        </Badge>

        <h2 className="font-display font-bold text-2xl text-foreground mb-1 tracking-tight">
          {title}
        </h2>
        <p className="text-sm font-medium text-accent">{subtitle}</p>
      </div>

      {/* Description & features */}
      <div className="px-8 pb-6 flex-1 space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed text-center">
          {description}
        </p>

        <ul className="space-y-2.5">
          {features.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5">
              <ChevronRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <span className="text-sm text-foreground/80">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-8 pb-8">
        <Button
          type="button"
          size="lg"
          className={`w-full font-bold text-base group-hover:scale-[1.02] transition-smooth ${gradient} text-white border-0 shadow-subtle`}
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to });
          }}
          data-ocid={ctaOcid}
        >
          {cta}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-smooth" />
        </Button>
      </div>
    </motion.button>
  );
}

export default function BudgetHub() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero */}
      <section
        className="relative py-16 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,22,40,0.88)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge className="mb-4 bg-emerald-500/30 text-emerald-200 border-emerald-500/40 inline-flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Smart Budget Planning
            </Badge>
            <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-4 leading-tight">
              Budget Travel
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
              Plan smarter, spend less, explore more. Choose your budget tool
              below and start planning your perfect trip.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Option Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-10"
        >
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            What would you like to do?
          </h2>
          <p className="text-muted-foreground text-sm">
            Two powerful tools to take control of your travel budget
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <OptionCard
            delay={0.1}
            icon={<Compass className="w-12 h-12 text-white" />}
            accentIcon={<MapPin className="w-4 h-4 text-amber-500" />}
            title="Where Can I Go?"
            subtitle="Destination Finder"
            description="Enter your total budget, travel party size, and trip duration — we'll show you every destination you can afford, sorted by cost."
            features={[
              "See all destinations within your budget",
              "Estimated total cost per trip & per person",
              "Sort by affordability, cheapest first",
              "One-click to plan & book your trip",
            ]}
            cta="Find My Destinations"
            to="/budget-travel"
            gradient="bg-gradient-to-r from-amber-500 to-orange-500"
            badgeLabel="Destination Finder"
            badgeClass="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25"
            dataOcid="budget-hub.destination-finder-card"
            ctaOcid="budget-hub.destination-finder-btn"
          />

          <OptionCard
            delay={0.2}
            icon={<Wallet className="w-12 h-12 text-white" />}
            accentIcon={<Calculator className="w-4 h-4 text-emerald-500" />}
            title="Track My Budget"
            subtitle="Expense Tracker"
            description="Set a total trip budget, log your spending by category, and instantly see how much you've used and how much is left."
            features={[
              "Set a budget and track expenses in real time",
              "Categorize: food, hotel, transport, activities",
              "Visual progress bar: spent vs remaining",
              "History saved securely to your account",
            ]}
            cta="Start Tracking"
            to="/budget-calculator"
            gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
            badgeLabel="Expense Tracker"
            badgeClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
            dataOcid="budget-hub.expense-tracker-card"
            ctaOcid="budget-hub.expense-tracker-btn"
          />
        </div>

        {/* Quick tip strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-10 rounded-2xl bg-muted/40 border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground mb-1">
              Pro Tip: Use both tools together
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Start with{" "}
              <strong className="text-foreground">Where Can I Go?</strong> to
              pick a destination within your budget, then use{" "}
              <strong className="text-foreground">Track My Budget</strong>{" "}
              during your trip to stay on target.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
