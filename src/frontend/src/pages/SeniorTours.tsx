import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Accessibility,
  Activity,
  ArrowRight,
  CheckCircle,
  Clock,
  Heart,
  Plane,
  Shield,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const featureHighlights = [
  {
    icon: Stethoscope,
    label: "Medical Support",
    sub: "Doctor on-call throughout",
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  {
    icon: Accessibility,
    label: "Wheelchair Accessible",
    sub: "All transport & venues",
    color: "text-sky-400",
    bg: "bg-sky-500/20",
  },
  {
    icon: Clock,
    label: "Slow-Paced Itinerary",
    sub: "No rush, generous rest",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  {
    icon: Users,
    label: "Group Travel",
    sub: "Travel with fellow seniors",
    color: "text-violet-400",
    bg: "bg-violet-500/20",
  },
];

interface SeniorPackage {
  id: string;
  name: string;
  destination: string;
  region: string;
  duration: number;
  price: number;
  image: string;
  tagline: string;
  dayByDay: string[];
  specialInclusions: string[];
  badge: string;
  rating: number;
  reviews: number;
}

const seniorPackages: SeniorPackage[] = [
  {
    id: "kerala-backwaters",
    name: "Kerala Backwaters Cruise",
    destination: "Kerala",
    region: "Kerala, India",
    duration: 7,
    price: 18000,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    tagline: "Drift through paradise on a tranquil houseboat",
    dayByDay: [
      "Day 1: Arrive Kochi, rest & welcome dinner",
      "Day 2: Fort Kochi heritage walk at leisure",
      "Day 3: Munnar hill station, tea garden visit",
      "Day 4: Alleppey houseboat boarding",
      "Day 5: Backwaters cruise, village interaction",
      "Day 6: Kovalam Beach — sunrise yoga & wellness",
      "Day 7: Ayurvedic massage, departure",
    ],
    specialInclusions: [
      "Doctor on-call 24/7",
      "Comfortable AC coach",
      "Early check-in guaranteed",
    ],
    badge: "Ayurvedic Wellness",
    rating: 4.9,
    reviews: 174,
  },
  {
    id: "rajasthan-heritage",
    name: "Rajasthan Heritage Tour",
    destination: "Jaipur",
    region: "Rajasthan, India",
    duration: 8,
    price: 22000,
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    tagline: "Walk through centuries of royal grandeur at your own pace",
    dayByDay: [
      "Day 1: Arrive Jaipur, check-in palace hotel",
      "Day 2: City Palace & Jantar Mantar (guided)",
      "Day 3: Amber Fort — accessible cart ride",
      "Day 4: Jodhpur Blue City transfer",
      "Day 5: Mehrangarh Fort & leisure afternoon",
      "Day 6: Udaipur City of Lakes, boat ride",
      "Day 7: Pushkar Brahma Temple & fair",
      "Day 8: Return Jaipur & departure",
    ],
    specialInclusions: [
      "Emergency medical kit onboard",
      "Wheelchair-accessible transport",
      "Early check-in at all hotels",
    ],
    badge: "Heritage Expert Guide",
    rating: 4.8,
    reviews: 142,
  },
  {
    id: "darjeeling-retreat",
    name: "Darjeeling Scenic Retreat",
    destination: "Darjeeling",
    region: "West Bengal, India",
    duration: 5,
    price: 15000,
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80",
    tagline: "Cool mountain air, lush tea gardens & Himalayan vistas",
    dayByDay: [
      "Day 1: Arrive NJP, comfortable drive to Darjeeling",
      "Day 2: Tiger Hill sunrise view of Kanchenjunga",
      "Day 3: Tea garden walk & tea tasting session",
      "Day 4: Toy train ride through scenic mountain passes",
      "Day 5: Padmaja Zoo (gentle walk), departure",
    ],
    specialInclusions: [
      "Altitude sickness first-aid kit",
      "Comfortable heated transport",
      "Early check-in guaranteed",
    ],
    badge: "Cool Climate — Joint-Friendly",
    rating: 4.7,
    reviews: 118,
  },
  {
    id: "maldives-relaxation",
    name: "Maldives Senior Relaxation",
    destination: "Maldives",
    region: "Maldives",
    duration: 6,
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    tagline: "Premium beachside retreat with zero strenuous activity",
    dayByDay: [
      "Day 1: Arrive Malé, speedboat to resort",
      "Day 2: Private beach, gentle paddleboard tour",
      "Day 3: Glass-bottom boat trip & snorkeling",
      "Day 4: Couples/group spa, sandbank picnic",
      "Day 5: Sunrise beach breakfast & island walk",
      "Day 6: Souvenir shopping, departure",
    ],
    specialInclusions: [
      "Medical travel insurance included",
      "Personal wheelchair escort",
      "Priority boarding & early check-in",
    ],
    badge: "All-Inclusive Premium",
    rating: 4.9,
    reviews: 87,
  },
  {
    id: "singapore-explorer",
    name: "Singapore Comfort Explorer",
    destination: "Singapore",
    region: "Singapore",
    duration: 5,
    price: 60000,
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    tagline: "Modern city comforts with easy-pace sightseeing",
    dayByDay: [
      "Day 1: Arrive Singapore, 5-star hotel, Gardens by the Bay evening",
      "Day 2: Sentosa Island — cable car, accessible beach",
      "Day 3: Marina Bay Sands observation deck, hawker lunch",
      "Day 4: Singapore Zoo & Night Safari (easy walks)",
      "Day 5: Orchard Road shopping & departure",
    ],
    specialInclusions: [
      "Dedicated doctor contact 24/7",
      "Wheelchair-accessible coach",
      "Early check-in at 5-star hotel",
    ],
    badge: "5-Star Comfort",
    rating: 4.9,
    reviews: 96,
  },
  {
    id: "goa-coastal",
    name: "Goa Gentle Coastal Retreat",
    destination: "Goa",
    region: "Goa, India",
    duration: 5,
    price: 14000,
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    tagline: "Relax on pristine beaches with accessible comfort",
    dayByDay: [
      "Day 1: Arrive Goa, 4-star beach resort check-in, rest",
      "Day 2: North Goa — Old Goa churches, leisurely river cruise",
      "Day 3: Relaxed beach morning, evening wellness yoga",
      "Day 4: Spice plantation tour, Dudhsagar (scenic drive)",
      "Day 5: Anjuna market leisurely walk, departure",
    ],
    specialInclusions: [
      "On-call medical assistance",
      "AC wheelchair-friendly coach",
      "Early check-in at beach resort",
    ],
    badge: "Beach Accessibility",
    rating: 4.8,
    reviews: 161,
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Medical-Ready Travel",
    desc: "First-aid kits, doctor-on-call contacts, and medication storage assistance throughout your journey.",
  },
  {
    icon: Clock,
    title: "Slow-Paced Itineraries",
    desc: "Generous rest periods, no rushed schedules, and flexible timing to explore at your own comfort.",
  },
  {
    icon: Users,
    title: "Friendly Group Environment",
    desc: "Travel with fellow seniors aged 55+. Build lasting friendships in a safe, welcoming setting.",
  },
  {
    icon: Heart,
    title: "Health-First Approach",
    desc: "Dietary needs, mobility aids, low-altitude options, and accommodation requirements fully met.",
  },
  {
    icon: Activity,
    title: "Curated Experiences",
    desc: "Hand-picked attractions that are wheelchair accessible, low-exertion, and deeply enriching.",
  },
  {
    icon: Star,
    title: "Premium Comfort",
    desc: "4-star and above stays, comfortable AC transport, and dedicated tour escorts at every step.",
  },
];

const tourIncludes = [
  "Comfortable 4★ hotels",
  "AC group transport",
  "Expert guided tours",
  "First-aid kit on board",
  "Emergency doctor contacts",
  "Dietary assistance",
  "Dedicated tour escort",
  "Travel insurance",
  "Welcome & farewell dinners",
];

function PackageCard({
  pkg,
  onBook,
}: { pkg: SeniorPackage; onBook: (pkg: SeniorPackage) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col rounded-2xl overflow-hidden transition-smooth hover:scale-[1.02] hover:shadow-hero"
      data-ocid={`senior-pkg-${pkg.id}`}
    >
      {/* Full image header */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-108"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 card-overlay-strong" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="glass-card text-white border-0 text-xs gap-1">
            <Clock className="w-3 h-3" />
            {pkg.duration} Days
          </Badge>
          <Badge className="bg-amber-500/90 text-white border-0 text-xs gap-1">
            <Heart className="w-3 h-3" />
            Senior Friendly
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display font-bold text-white text-lg text-shadow-hero leading-tight">
            {pkg.name}
          </h3>
          <p className="text-white/75 text-xs mt-0.5">{pkg.region}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3 bg-card border border-t-0 border-border rounded-b-2xl">
        <p className="text-sm text-muted-foreground italic leading-snug">
          "{pkg.tagline}"
        </p>
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={`${pkg.id}-s${n}`}
                className={`w-3 h-3 ${n <= Math.floor(pkg.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold">{pkg.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({pkg.reviews} reviews)
          </span>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Special Inclusions
          </p>
          <ul className="space-y-1">
            {pkg.specialInclusions.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-xs text-foreground"
              >
                <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 hover:underline"
          >
            Day-by-Day Highlights
            <ArrowRight
              className={`w-3 h-3 transition-smooth ${expanded ? "rotate-90" : ""}`}
            />
          </button>
          {expanded && (
            <ul className="space-y-1 animate-fade-in">
              {pkg.dayByDay.map((day) => (
                <li
                  key={day}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="text-amber-500 font-bold shrink-0">·</span>
                  {day}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/8 rounded-lg px-2.5 py-1.5">
          ✦ {pkg.badge}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <p className="font-display font-bold text-xl text-amber-500 leading-none">
              ₹{pkg.price.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold text-xs shrink-0"
            onClick={() => onBook(pkg)}
            data-ocid={`senior-book-${pkg.id}`}
          >
            Book Senior Tour
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SeniorTours() {
  const navigate = useNavigate();

  const bookTour = (pkg: SeniorPackage) => {
    sessionStorage.setItem("selectedSeniorTour", JSON.stringify(pkg));
    navigate({ to: "/senior-tour-detail" });
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero with scenic background */}
      <section
        className="relative py-24"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-amber-500/30 text-amber-200 border-amber-400/40 gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Designed for Senior Travelers
            </Badge>
            <h1 className="font-display font-bold text-5xl sm:text-6xl text-white text-shadow-hero mb-4 leading-tight">
              Senior Citizen Tours
            </h1>
            <p className="text-xl text-white/75 mb-8 leading-relaxed text-shadow-sm">
              Comfortable, slow-paced travel for seniors — medical support,
              wheelchair access, group camaraderie, and early check-in at every
              step.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 shadow-hero gap-2"
                onClick={() =>
                  document
                    .getElementById("tour-packages")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-ocid="senior-book-cta"
              >
                <Plane className="w-4 h-4" />
                Book a Senior Tour
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="glass-card border-white/30 text-white hover:bg-white/20 gap-2 font-bold"
                onClick={() =>
                  document
                    .getElementById("tour-packages")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View All Packages
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section
        className="py-8"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featureHighlights.map(
              ({ icon: Icon, label, sub, color, bg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="flex items-start gap-3 p-3.5 rounded-xl glass-card"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">
                      {label}
                    </p>
                    <p className="text-xs text-white/55 mt-0.5">{sub}</p>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Tour Packages */}
      <section id="tour-packages" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">
              Packages
            </p>
            <h2 className="font-display font-bold text-3xl text-foreground mb-2">
              Senior Tour Packages
            </h2>
            <p className="text-muted-foreground text-lg">
              6 handpicked destinations — accessible, enriching, and deeply
              comfortable
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {seniorPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onBook={bookTour} />
            ))}{" "}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section
        className="py-16"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative" style={{ background: "rgba(10,22,40,0.88)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-10">
              <h2 className="font-display font-bold text-3xl text-white text-shadow-sm mb-2">
                Why Choose Senior Tours?
              </h2>
              <p className="text-white/65 text-lg max-w-2xl mx-auto">
                We've rethought travel from the ground up — built around
                comfort, safety, and joy.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="p-5 rounded-2xl glass-card"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Every Tour Includes */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0f766e 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl text-white text-shadow-sm mb-2">
              Every Senior Tour Includes
            </h2>
            <p className="text-white/60 mb-8">
              Everything you need for a safe, comfortable, and joyful journey
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 max-w-3xl mx-auto">
              {tourIncludes.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-left glass-card p-2.5 rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="lg"
              onClick={() =>
                document
                  .getElementById("tour-packages")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 px-10 gap-2 shadow-hero"
              data-ocid="senior-final-cta"
            >
              <Plane className="w-4 h-4" />
              Start Planning Your Senior Trip
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
