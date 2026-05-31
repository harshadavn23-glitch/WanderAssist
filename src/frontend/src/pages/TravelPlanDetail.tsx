// TravelPlanDetail.tsx — /travel-plans/detail
// Reviews are loaded from Motoko canister on mount and saved back on submit.
// All state declared before early returns (Rules of Hooks).

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import type { Review } from "@/types/travel";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Backpack,
  Banknote,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  Droplets,
  Landmark,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Share2,
  Shirt,
  Star,
  Thermometer,
  UtensilsCrossed,
  Wind,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import type { Review as BackendReview } from "../backend";
import { FavoriteButton } from "../components/FavoriteButton";

// ── Destination hero images lookup ───────────────────────────────────────
const DESTINATION_HERO_IMAGES: Record<string, string> = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=400&fit=crop&q=80",
  Kerala:
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=400&fit=crop&q=80",
  Mumbai:
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&h=400&fit=crop&q=80",
  Chennai:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=400&fit=crop&q=80",
  Delhi:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=400&fit=crop&q=80",
  Jaipur:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=400&fit=crop&q=80",
  Manali:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=400&fit=crop&q=80",
  Ladakh:
    "https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=1200&h=400&fit=crop&q=80",
  Pondicherry:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=400&fit=crop&q=80",
  Bangalore:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=400&fit=crop&q=80",
  "Bali, Indonesia":
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=400&fit=crop&q=80",
  Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=400&fit=crop&q=80",
  "Paris, France":
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=400&fit=crop&q=80",
  Paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=400&fit=crop&q=80",
  "Dubai, UAE":
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=400&fit=crop&q=80",
  Dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=400&fit=crop&q=80",
  "Tokyo, Japan":
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=400&fit=crop&q=80",
  Tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=400&fit=crop&q=80",
  "New York, USA":
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&h=400&fit=crop&q=80",
  "New York":
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&h=400&fit=crop&q=80",
  "London, UK":
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=400&fit=crop&q=80",
  London:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=400&fit=crop&q=80",
  Singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=400&fit=crop&q=80",
  Maldives:
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&h=400&fit=crop&q=80",
  Switzerland:
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&h=400&fit=crop&q=80",
  Thailand:
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&h=400&fit=crop&q=80",
};

function getHeroImage(destination: string): string {
  return (
    DESTINATION_HERO_IMAGES[destination] ??
    DESTINATION_HERO_IMAGES[destination.split(",")[0].trim()] ??
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop&q=80"
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
interface DayActivity {
  period: "Morning" | "Afternoon" | "Evening";
  icon: string;
  color: string;
  title: string;
  description: string;
  location: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: DayActivity[];
  meals: { breakfast: string; lunch: string; dinner: string };
}

// ── Generate realistic itinerary per destination ───────────────────────────
function buildItinerary(destination: string, days: number): DayPlan[] {
  const templates: Record<string, DayPlan[]> = {
    Paris: [
      {
        day: 1,
        title: "Arrival & City Intro",
        activities: [
          {
            period: "Morning",
            icon: "🌅",
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
            title: "Arrive at CDG Airport",
            description:
              "Transfer to hotel, freshen up, and enjoy a welcome breakfast at a Parisian café.",
            location: "Charles de Gaulle Airport",
          },
          {
            period: "Afternoon",
            icon: "☀️",
            color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
            title: "Eiffel Tower Visit",
            description:
              "Take in stunning views of Paris from the world's most iconic landmark.",
            location: "Champ de Mars, Paris",
          },
          {
            period: "Evening",
            icon: "🌙",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
            title: "Seine River Cruise",
            description:
              "Enjoy a romantic dinner cruise along the Seine with views of illuminated monuments.",
            location: "Seine River, Paris",
          },
        ],
        meals: {
          breakfast: "Hotel Continental Breakfast",
          lunch: "Café de Flore",
          dinner: "Dinner Cruise on Seine",
        },
      },
      {
        day: 2,
        title: "Museums & Culture",
        activities: [
          {
            period: "Morning",
            icon: "🌅",
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
            title: "Louvre Museum",
            description:
              "Explore the world's largest art museum; see the Mona Lisa and Venus de Milo.",
            location: "Louvre, Paris",
          },
          {
            period: "Afternoon",
            icon: "☀️",
            color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
            title: "Musée d'Orsay",
            description:
              "Impressionist masterpieces by Monet, Renoir, and Van Gogh.",
            location: "7th Arrondissement, Paris",
          },
          {
            period: "Evening",
            icon: "🌙",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
            title: "Montmartre Stroll",
            description:
              "Wander cobblestone streets of Montmartre and visit Sacré-Cœur at sunset.",
            location: "Montmartre, Paris",
          },
        ],
        meals: {
          breakfast: "Le Pain Quotidien",
          lunch: "Café in Louvre",
          dinner: "Bistro at Montmartre",
        },
      },
    ],
    Goa: [
      {
        day: 1,
        title: "Beach Arrival",
        activities: [
          {
            period: "Morning",
            icon: "🌅",
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
            title: "Arrive & Check-in",
            description:
              "Check into your beachfront resort and relax with a welcome drink.",
            location: "Calangute Beach, Goa",
          },
          {
            period: "Afternoon",
            icon: "☀️",
            color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
            title: "Beach Exploration",
            description:
              "Explore the golden sands, try water sports and build sandcastles.",
            location: "Baga Beach, Goa",
          },
          {
            period: "Evening",
            icon: "🌙",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
            title: "Sunset at Anjuna",
            description:
              "Watch Goa's legendary sunset at Anjuna beach with live music.",
            location: "Anjuna Beach, Goa",
          },
        ],
        meals: {
          breakfast: "Resort Buffet",
          lunch: "Beach Shack",
          dinner: "Thalassa Greek Restaurant",
        },
      },
    ],
    Bali: [
      {
        day: 1,
        title: "Rice Terraces & Temples",
        activities: [
          {
            period: "Morning",
            icon: "🌅",
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
            title: "Tegallalang Rice Terraces",
            description:
              "Walk through stunning UNESCO rice paddies at golden hour.",
            location: "Tegallalang, Ubud",
          },
          {
            period: "Afternoon",
            icon: "☀️",
            color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
            title: "Tanah Lot Temple",
            description:
              "See the iconic sea temple perched on a rock, framed by crashing waves.",
            location: "Tabanan, Bali",
          },
          {
            period: "Evening",
            icon: "🌙",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
            title: "Kecak Fire Dance",
            description:
              "Watch the mesmerizing traditional Kecak dance at Uluwatu Temple cliff.",
            location: "Uluwatu, South Bali",
          },
        ],
        meals: {
          breakfast: "Warung Local",
          lunch: "Ibu Oka Ubud",
          dinner: "Kubu at COMO Uma Ubud",
        },
      },
    ],
  };

  const genericDays: DayPlan[] = Array.from(
    { length: Math.min(days, 7) },
    (_, i) => ({
      day: i + 1,
      title:
        [
          "Arrival & Welcome",
          "City Exploration",
          "Local Culture Day",
          "Adventure Day",
          "Leisure & Shopping",
          "Day Trip",
          "Departure Day",
        ][i] ?? `Day ${i + 1}`,
      activities: [
        {
          period: "Morning" as const,
          icon: "🌅",
          color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
          title: "Morning Exploration",
          description: `Explore the best of ${destination}'s morning sights and local cafes.`,
          location: `${destination} City Center`,
        },
        {
          period: "Afternoon" as const,
          icon: "☀️",
          color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
          title: "Main Attraction Visit",
          description: `Visit the top landmarks and hidden gems that ${destination} is famous for.`,
          location: `${destination} Heritage Zone`,
        },
        {
          period: "Evening" as const,
          icon: "🌙",
          color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
          title: "Evening Dining & Culture",
          description: `Experience local cuisine and entertainment in the heart of ${destination}.`,
          location: `${destination} Old Town`,
        },
      ],
      meals: {
        breakfast: "Hotel Breakfast",
        lunch: "Local Restaurant",
        dinner: "Rooftop Dinner",
      },
    }),
  );

  const destTemplates = templates[destination] ?? [];
  const merged: DayPlan[] = Array.from(
    { length: Math.min(days, 7) },
    (_, i) => {
      if (i < destTemplates.length) return destTemplates[i];
      const g = genericDays[i];
      return g ?? genericDays[0];
    },
  );

  return merged.filter(Boolean);
}

function getWeather(destination: string) {
  const map: Record<
    string,
    { temp: string; condition: string; humidity: string; wind: string }
  > = {
    Manali: {
      temp: "5°C - 18°C",
      condition: "Snowy / Clear",
      humidity: "70%",
      wind: "15 km/h",
    },
    Goa: {
      temp: "26°C - 34°C",
      condition: "Sunny / Partly Cloudy",
      humidity: "72%",
      wind: "14 km/h",
    },
    Kerala: {
      temp: "24°C - 32°C",
      condition: "Humid / Tropical",
      humidity: "80%",
      wind: "10 km/h",
    },
    Paris: {
      temp: "12°C - 22°C",
      condition: "Partly Cloudy / Mild",
      humidity: "62%",
      wind: "18 km/h",
    },
    Bali: {
      temp: "27°C - 33°C",
      condition: "Tropical / Showers",
      humidity: "75%",
      wind: "12 km/h",
    },
    Dubai: {
      temp: "28°C - 38°C",
      condition: "Sunny / Hot",
      humidity: "55%",
      wind: "20 km/h",
    },
    Tokyo: {
      temp: "15°C - 25°C",
      condition: "Partly Cloudy",
      humidity: "60%",
      wind: "16 km/h",
    },
  };
  return (
    map[destination] ?? {
      temp: "24°C - 32°C",
      condition: "Sunny / Partly Cloudy",
      humidity: "65%",
      wind: "12 km/h",
    }
  );
}

function getDressCode(destination: string) {
  const map: Record<string, string> = {
    Manali:
      "Pack heavy woolens, thermals, and waterproof jackets. Snow boots are essential.",
    Goa: "Light casuals, beachwear, and flip-flops. Carry a light shawl for temple visits.",
    Kerala:
      "Light cotton clothes. Modest dress for temple and backwater areas.",
    Paris: "Smart casual is the norm. Pack layers for unpredictable weather.",
    Bali: "Light tropical wear. Bring a sarong for temple visits — it's required.",
    Dubai:
      "Modest clothing in public places. Resort wear at beaches and pools is fine.",
    Tokyo:
      "Smart casual; follow seasonal layers. Remove shoes when entering homes or temples.",
  };
  return (
    map[destination] ??
    "Comfortable casuals are ideal. Carry light layers and formal wear for special dinners."
  );
}

function getPhotoSpots(destination: string) {
  const map: Record<string, string[]> = {
    Paris: [
      "Eiffel Tower at dusk",
      "Louvre Glass Pyramid",
      "Montmartre hilltop",
    ],
    Goa: [
      "Chapora Fort panorama",
      "Anjuna Beach sunset",
      "Basilica of Bom Jesus",
    ],
    Bali: [
      "Tegallalang Terraces at sunrise",
      "Uluwatu Cliff Temple",
      "Tanah Lot ocean view",
    ],
    Dubai: [
      "Burj Khalifa observation deck",
      "Palm Jumeirah aerial",
      "Dubai Creek Old Souk",
    ],
    Tokyo: [
      "Senso-ji Temple lanterns",
      "Shibuya Crossing at night",
      "Mt. Fuji from Lake Kawaguchi",
    ],
    Manali: [
      "Rohtang Pass snowfield",
      "Solang Valley cable car",
      "Hadimba Temple forest",
    ],
  };
  return (
    map[destination] ?? [
      `${destination} main square`,
      `${destination} heritage district`,
      `${destination} riverside viewpoint`,
    ]
  );
}

/** Context-aware packing list per destination */
function getPackingList(destination: string): string[] {
  const base = [
    "Passport / ID",
    "Travel insurance docs",
    "Phone charger",
    "Power bank",
    "First-aid kit",
    "Medications",
    "Sunscreen",
    "Camera",
  ];

  const beach = [
    "Swimwear",
    "Sunglasses",
    "Flip flops",
    "Beach towel",
    "Insect repellent",
  ];
  const cold = [
    "Thermal wear",
    "Warm jacket",
    "Gloves",
    "Woolen socks",
    "Snow boots",
    "Lip balm",
  ];
  const intl = [
    "Foreign currency cash",
    "Travel adapter",
    "Copies of visa",
    "International SIM card",
  ];
  const heritage = ["Modest clothing for temples", "Comfortable walking shoes"];

  const beachDests = ["Goa", "Bali", "Maldives", "Kerala"];
  const coldDests = ["Manali", "Ladakh"];
  const intlDests = [
    "Paris",
    "Dubai",
    "Tokyo",
    "New York",
    "London",
    "Singapore",
    "Bali",
    "Maldives",
  ];
  const heritageDests = ["Jaipur", "Delhi", "Pondicherry", "Mumbai"];

  const extras: string[] = [];
  if (beachDests.includes(destination)) extras.push(...beach);
  if (coldDests.includes(destination)) extras.push(...cold);
  if (intlDests.includes(destination)) extras.push(...intl);
  if (heritageDests.includes(destination)) extras.push(...heritage);

  return [...base, ...extras];
}

interface ExchangeShop {
  name: string;
  area: string;
  hours: string;
  note: string;
}

function getExchangeShops(destination: string): ExchangeShop[] {
  const indianDefault: ExchangeShop[] = [
    {
      name: "Thomas Cook Forex",
      area: "City Centre",
      hours: "9 AM – 7 PM",
      note: "Best USD/EUR rates, no commission",
    },
    {
      name: "BookMyForex",
      area: "Airport Terminal",
      hours: "6 AM – 10 PM",
      note: "Door delivery available",
    },
    {
      name: "Paul Merchants",
      area: "MG Road / Main Market",
      hours: "10 AM – 6 PM",
      note: "Competitive rates, RBI authorised",
    },
    {
      name: "Centrum Forex",
      area: "Railway Station",
      hours: "8 AM – 8 PM",
      note: "No hidden fees, instant exchange",
    },
  ];

  const shopMap: Record<string, ExchangeShop[]> = {
    Paris: [
      {
        name: "Travelex — Opéra",
        area: "Near Opéra Garnier, 9th Arr.",
        hours: "9 AM – 8 PM",
        note: "No commission on large amounts",
      },
      {
        name: "Calforex Rivoli",
        area: "Rue de Rivoli, 1st Arr.",
        hours: "10 AM – 6 PM",
        note: "INR accepted, fair rates",
      },
      {
        name: "ICE Currency Services",
        area: "CDG Airport, Terminal 2",
        hours: "6 AM – 11 PM",
        note: "24-hr option in transit zone",
      },
      {
        name: "Ria Money Exchange",
        area: "Marais District",
        hours: "9:30 AM – 7 PM",
        note: "Transparent rates, no markup",
      },
    ],
    Dubai: [
      {
        name: "Al Ansari Exchange",
        area: "Dubai Mall Ground Floor",
        hours: "10 AM – 10 PM",
        note: "Best INR rates in the city",
      },
      {
        name: "UAE Exchange",
        area: "Deira Gold Souk",
        hours: "9 AM – 9 PM",
        note: "Open on weekends",
      },
      {
        name: "Wall Street Exchange",
        area: "BurJuman Centre",
        hours: "10 AM – 9 PM",
        note: "Competitive AED/USD rates",
      },
      {
        name: "Orient Exchange",
        area: "DXB Airport Arrivals",
        hours: "24 hours",
        note: "No commission for airport",
      },
    ],
    Tokyo: [
      {
        name: "Travelex Shinjuku",
        area: "Shinjuku Station East Exit",
        hours: "9 AM – 8 PM",
        note: "Best JPY rates for INR holders",
      },
      {
        name: "Japan Post Bank",
        area: "Nearest Post Office",
        hours: "9 AM – 5 PM",
        note: "Accepts international cards",
      },
      {
        name: "7-Eleven ATM",
        area: "Across the city",
        hours: "24 hours",
        note: "Forex-friendly, low fees",
      },
      {
        name: "Narita Airport Forex",
        area: "Terminal 1 & 2",
        hours: "6 AM – 11 PM",
        note: "Arrive with USD for best rates",
      },
    ],
    Bali: [
      {
        name: "Central Kuta Money Changer",
        area: "Kuta Strip, Legian",
        hours: "9 AM – 9 PM",
        note: "Best IDR rates on the strip",
      },
      {
        name: "BMC Seminyak",
        area: "Seminyak Square",
        hours: "10 AM – 8 PM",
        note: "Licensed dealer, no receipt scams",
      },
      {
        name: "Ngurah Rai Airport FX",
        area: "International Arrivals",
        hours: "24 hours",
        note: "Avoid — rates 10% worse",
      },
      {
        name: "PT Dinar Mas",
        area: "Ubud Central Market",
        hours: "9 AM – 6 PM",
        note: "Honest rates for rural areas",
      },
    ],
    Singapore: [
      {
        name: "The Arcade Money Changer",
        area: "18 Raffles Quay, CBD",
        hours: "9 AM – 5 PM",
        note: "Best rates in Southeast Asia",
      },
      {
        name: "Lucky Plaza Changers",
        area: "Orchard Road Level 2",
        hours: "10 AM – 9 PM",
        note: "Popular with Indian tourists",
      },
      {
        name: "Mustafa Centre Forex",
        area: "Little India",
        hours: "24 hours",
        note: "Best INR buy-back rates",
      },
      {
        name: "Changi Airport FX",
        area: "Terminal 3, Departure",
        hours: "5 AM – 2 AM",
        note: "Reasonable for last-minute",
      },
    ],
  };

  return shopMap[destination] ?? indianDefault;
}

interface Restaurant {
  name: string;
  cuisine: string;
  price: string;
  description: string;
  area: string;
}

function getRestaurants(destination: string): Restaurant[] {
  const map: Record<string, Restaurant[]> = {
    Goa: [
      {
        name: "Fisherman's Wharf",
        cuisine: "Seafood",
        price: "₹₹",
        description:
          "Iconic riverside shack serving fresh catch, prawn curry rice and Goan fish thali.",
        area: "Cavelossim Beach",
      },
      {
        name: "Thalassa",
        cuisine: "Greek & Fusion",
        price: "₹₹₹",
        description:
          "Clifftop restaurant with sunset views; known for mezze platters and cocktails.",
        area: "Vagator",
      },
      {
        name: "Vinayak Family Restaurant",
        cuisine: "Goan Vegetarian",
        price: "₹",
        description:
          "Old favourite for Sol Kadi, bebinca, and authentic Saraswat cuisine.",
        area: "Porvorim",
      },
      {
        name: "Bomra's",
        cuisine: "Burmese-Asian",
        price: "₹₹₹",
        description:
          "Award-winning pan-Asian kitchen; standout dish is the slow-cooked pork curry.",
        area: "Baga",
      },
      {
        name: "A Reverie",
        cuisine: "Continental",
        price: "₹₹₹",
        description:
          "Art-deco interiors, slow-food philosophy and excellent wood-fired pizzas.",
        area: "Panaji",
      },
    ],
    Paris: [
      {
        name: "Le Comptoir du Relais",
        cuisine: "French Bistro",
        price: "$$$",
        description:
          "Classic Saint-Germain bistro with seasonal tasting menus; reserve ahead.",
        area: "6th Arrondissement",
      },
      {
        name: "Bouillon Pigalle",
        cuisine: "Traditional French",
        price: "$",
        description:
          "Affordable Art Nouveau brasserie serving steak-frites and snails to long queues.",
        area: "Pigalle",
      },
      {
        name: "Septime",
        cuisine: "Modern French",
        price: "$$$",
        description:
          "Michelin-starred neighbourhood gem; ingredient-driven tasting menus.",
        area: "11th Arrondissement",
      },
      {
        name: "L'As du Fallafel",
        cuisine: "Middle Eastern",
        price: "$",
        description:
          "Legendary falafel wraps; the best street lunch in the Marais.",
        area: "Le Marais",
      },
      {
        name: "Frenchie",
        cuisine: "New American-French",
        price: "$$$",
        description:
          "Market-inspired cooking, cosy room, must-try pigeon and truffle menu.",
        area: "Rue du Nil",
      },
    ],
    Bali: [
      {
        name: "Locavore",
        cuisine: "Modern Indonesian",
        price: "$$$",
        description:
          "One of Asia's 50 best restaurants; hyperlocal ingredients, creative tasting menu.",
        area: "Ubud",
      },
      {
        name: "Ibu Oka",
        cuisine: "Balinese",
        price: "$",
        description:
          "Famous suckling pig (babi guling) spot visited by celebrity chefs worldwide.",
        area: "Ubud Centre",
      },
      {
        name: "Merah Putih",
        cuisine: "Indonesian Fine Dining",
        price: "$$$",
        description:
          "Stunning bamboo architecture; pan-archipelago dishes in an open-kitchen setting.",
        area: "Seminyak",
      },
      {
        name: "Sardine",
        cuisine: "Seafood",
        price: "$$$",
        description:
          "Fresh Jimbaran seafood in a beautiful rice-field setting; perfect for sunset.",
        area: "Petitenget",
      },
      {
        name: "Warung Sunset",
        cuisine: "Indonesian Warung",
        price: "$",
        description:
          "No-frills local joint with perfect nasi goreng and a legendary sambal.",
        area: "Kuta",
      },
    ],
    Tokyo: [
      {
        name: "Ichiran Ramen",
        cuisine: "Ramen",
        price: "$",
        description:
          "Solo-booth ramen experience; rich tonkotsu broth, customisable spice level.",
        area: "Shinjuku",
      },
      {
        name: "Sukiyabashi Jiro",
        cuisine: "Sushi Omakase",
        price: "$$$",
        description:
          "The three-Michelin-star sushi bar immortalised in film; book months ahead.",
        area: "Ginza",
      },
      {
        name: "Gonpachi",
        cuisine: "Izakaya",
        price: "$$",
        description:
          "Inspired the Kill Bill restaurant scene; grilled skewers and sake flights.",
        area: "Nishi-Azabu",
      },
      {
        name: "Tsukiji Outer Market",
        cuisine: "Seafood Street Food",
        price: "$",
        description:
          "Best tamagoyaki, oysters and tuna sashimi stalls open from 5 AM.",
        area: "Tsukiji",
      },
      {
        name: "Narisawa",
        cuisine: "Innovative Japanese",
        price: "$$$",
        description:
          "World's best sustainable restaurant; forest-to-table Japanese nouvelle cuisine.",
        area: "Minami-Aoyama",
      },
    ],
    Dubai: [
      {
        name: "Pierchic",
        cuisine: "Seafood",
        price: "$$$",
        description:
          "Over-water restaurant perched on a pier; lobster thermidor and stunning Marina views.",
        area: "Jumeirah",
      },
      {
        name: "Al Fanar",
        cuisine: "Emirati",
        price: "$$",
        description:
          "Authentic Emirati food in a heritage dhow setting; try the machboos and luqaimat.",
        area: "Festival City",
      },
      {
        name: "Zaroob",
        cuisine: "Lebanese Street Food",
        price: "$",
        description:
          "Vibrant street food concept; manakish, shawarma wraps and mezze platters.",
        area: "Sheikh Zayed Road",
      },
      {
        name: "Nobu Dubai",
        cuisine: "Japanese Fusion",
        price: "$$$",
        description: "World-famous Nobu brand; black cod miso is a must-order.",
        area: "Atlantis, Palm",
      },
      {
        name: "The Maine Land Brasserie",
        cuisine: "American Brasserie",
        price: "$$",
        description:
          "Brunch institution with bottomless options; popular with expats and tourists.",
        area: "JBR Walk",
      },
    ],
    Kerala: [
      {
        name: "Dal Roti",
        cuisine: "North Indian Fusion",
        price: "₹₹",
        description:
          "Rooftop spot with backwater views; traditional dal preparations and tandoor breads.",
        area: "Alleppey",
      },
      {
        name: "Paragon Restaurant",
        cuisine: "Malabar / Seafood",
        price: "₹₹",
        description:
          "Kozhikode institution since 1939; the best biryani and fish curry in North Kerala.",
        area: "Kozhikode",
      },
      {
        name: "Savoury Park",
        cuisine: "Fusion Kerala",
        price: "₹₹",
        description:
          "Rooftop fine dining with Fort Kochi views; Kerala lobster and mango chutney.",
        area: "Fort Kochi",
      },
      {
        name: "Dhe Puttu",
        cuisine: "Kerala Traditional",
        price: "₹",
        description:
          "25+ puttu varieties; bamboo steam-cooked cylindrical rice with coconut.",
        area: "Thrissur",
      },
    ],
    Manali: [
      {
        name: "Drifter's Inn",
        cuisine: "Continental / Café",
        price: "₹₹",
        description:
          "Cosy cabin café with bonfire seating; apple crumble pie and wood-fired pizzas.",
        area: "Old Manali",
      },
      {
        name: "Café 1947",
        cuisine: "Indian / Tibetan",
        price: "₹",
        description:
          "Best momos and thukpa in town; traveller favourite since 2003.",
        area: "Mall Road",
      },
      {
        name: "Johnson's Bar & Restaurant",
        cuisine: "Multi-cuisine",
        price: "₹₹₹",
        description:
          "Upscale heritage property; trout fish from adjacent pond, live music.",
        area: "Circuit House Road",
      },
      {
        name: "Lazy Dog",
        cuisine: "Israeli / Fusion",
        price: "₹₹",
        description:
          "Shakshuka, humus and cocktails in a hammock-strewn garden.",
        area: "Old Manali",
      },
    ],
    Jaipur: [
      {
        name: "Suvarna Mahal",
        cuisine: "Rajasthani",
        price: "₹₹₹",
        description:
          "Palatial dining room inside Rambagh Palace; laal maas and ker sangri.",
        area: "Bhawani Singh Road",
      },
      {
        name: "Laxmi Misthan Bhandar (LMB)",
        cuisine: "Rajasthani Thali",
        price: "₹",
        description:
          "Heritage sweet shop and restaurant since 1727; daal baati churma.",
        area: "Johari Bazaar",
      },
      {
        name: "Tapri Central",
        cuisine: "Indian Café",
        price: "₹",
        description:
          "Quirky rooftop chai-and-snacks spot beloved by locals and backpackers.",
        area: "C Scheme",
      },
      {
        name: "Handi Restaurant",
        cuisine: "Mughlai",
        price: "₹₹",
        description:
          "Clay pot curries slow-cooked over wood fire; legendary mutton handi.",
        area: "MI Road",
      },
    ],
    Ladakh: [
      {
        name: "Bon Appetit",
        cuisine: "Multi-cuisine / Tibetan",
        price: "₹₹",
        description:
          "Best view of Leh Palace from the rooftop; thukpa, pasta and local butter tea.",
        area: "Leh Main Market",
      },
      {
        name: "Lehchen's Kitchen",
        cuisine: "Tibetan / Indian",
        price: "₹",
        description:
          "Authentic Ladakhi home-style cooking; skyu (pasta soup) and tsampa.",
        area: "Changspa",
      },
      {
        name: "Gesmo Restaurant",
        cuisine: "Israeli / World",
        price: "₹₹",
        description:
          "Popular backpacker hub; shakshuka, fresh juices and hearty breakfasts.",
        area: "Fort Road, Leh",
      },
      {
        name: "Alchi Kitchen",
        cuisine: "Ladakhi Heritage",
        price: "₹₹",
        description:
          "Monastery complex eatery with rare Ladakhi dishes like chhutagi and butter spinach.",
        area: "Alchi Village",
      },
    ],
    Pondicherry: [
      {
        name: "Le Café",
        cuisine: "French / Bakery",
        price: "₹₹",
        description:
          "Heritage promenade café run by Pondy Tourism; croissants, quiche and sea breeze.",
        area: "Beach Road",
      },
      {
        name: "Villa Shanti",
        cuisine: "Modern French-Tamil",
        price: "₹₹₹",
        description:
          "Boutique hotel restaurant with tropical courtyard; lobster bouillabaisse.",
        area: "White Town",
      },
      {
        name: "Baker Street",
        cuisine: "Bakery / Café",
        price: "₹",
        description:
          "Loved for sourdough, butter cakes and strong filter coffee.",
        area: "Rue Romain Rolland",
      },
      {
        name: "Surguru",
        cuisine: "Tamil Vegetarian",
        price: "₹",
        description:
          "Institution for a complete South Indian banana-leaf meal with sambhar rice.",
        area: "Nehru Street",
      },
    ],
    Maldives: [
      {
        name: "Ithaa Undersea Restaurant",
        cuisine: "Modern European",
        price: "$$$",
        description:
          "World's first all-glass underwater restaurant; 5-metre ocean ceiling above diners.",
        area: "Conrad Maldives",
      },
      {
        name: "Ufaa by Jereme Leung",
        cuisine: "Chinese Fine Dining",
        price: "$$$",
        description:
          "Award-winning Chinese restaurant with overwater views and dim sum flights.",
        area: "Four Seasons Landaa",
      },
      {
        name: "Muraka",
        cuisine: "Seafood",
        price: "$$$",
        description:
          "Luxury underwater suite restaurant accessible by private elevator.",
        area: "Conrad Rangali",
      },
      {
        name: "Alfresco",
        cuisine: "International Buffet",
        price: "$$",
        description:
          "Nightly theme buffets — Mediterranean, Asian and BBQ nights under the stars.",
        area: "Veligandu Island",
      },
    ],
  };

  const defaultRestaurants: Restaurant[] = [
    {
      name: `${destination} Heritage Kitchen`,
      cuisine: "Local Cuisine",
      price: "₹₹",
      description: `The go-to spot for authentic ${destination} flavours; generous portions and warm service.`,
      area: `${destination} Old Town`,
    },
    {
      name: "The Spice Route",
      cuisine: "Indian Fusion",
      price: "₹₹",
      description:
        "Modern Indian cooking celebrating regional spices; standout thali and kebab platter.",
      area: `${destination} Centre`,
    },
    {
      name: "Café Wanderlust",
      cuisine: "Continental / Café",
      price: "₹₹",
      description:
        "Traveller-favourite café with fresh juices, sandwiches and reliable Wi-Fi.",
      area: `${destination} Tourist Zone`,
    },
    {
      name: "Street Food Lane",
      cuisine: "Street Food",
      price: "₹",
      description:
        "Legendary street-food strip where locals queue for evening chaat and snacks.",
      area: `${destination} Market`,
    },
  ];

  return map[destination] ?? defaultRestaurants;
}

interface Attraction {
  name: string;
  category: string;
  description: string;
  fee: string;
}

function getAttractions(destination: string): Attraction[] {
  const map: Record<string, Attraction[]> = {
    Goa: [
      {
        name: "Basilica of Bom Jesus",
        category: "Heritage",
        description:
          "UNESCO World Heritage church housing the mortal remains of St. Francis Xavier.",
        fee: "Free entry",
      },
      {
        name: "Chapora Fort",
        category: "Heritage",
        description:
          "16th-century hilltop fort with panoramic views of Vagator beach and the sea.",
        fee: "Free entry",
      },
      {
        name: "Dudhsagar Falls",
        category: "Nature",
        description:
          "Four-tiered milky-white waterfall among India's tallest; accessible by jeep safari.",
        fee: "₹400 entry",
      },
      {
        name: "Anjuna Flea Market",
        category: "Shopping",
        description:
          "Iconic Wednesday bazaar selling handicrafts, spices, tie-dye clothes and antiques.",
        fee: "Free entry",
      },
      {
        name: "Fort Aguada",
        category: "Heritage",
        description:
          "17th-century Portuguese fort and lighthouse overlooking the Arabian Sea.",
        fee: "₹25 entry",
      },
      {
        name: "Calangute–Baga Beach Belt",
        category: "Nature",
        description:
          "The most popular stretch of beach with watersports, shacks and a lively promenade.",
        fee: "Free entry",
      },
    ],
    Paris: [
      {
        name: "Eiffel Tower",
        category: "Heritage",
        description:
          "Iron lattice icon of Paris, best at dusk; take the lift to the summit for 360° views.",
        fee: "€29 (summit)",
      },
      {
        name: "Musée du Louvre",
        category: "Heritage",
        description:
          "World's largest museum; home to Mona Lisa, Venus de Milo and 35,000 other works.",
        fee: "€22 entry",
      },
      {
        name: "Palace of Versailles",
        category: "Heritage",
        description:
          "Baroque royal palace with Hall of Mirrors and 800 hectares of manicured gardens.",
        fee: "€20 entry",
      },
      {
        name: "Sacré-Cœur, Montmartre",
        category: "Spiritual",
        description:
          "White-domed basilica atop Paris's highest hill; free entry, sweeping city panorama.",
        fee: "Free entry",
      },
      {
        name: "Musée d'Orsay",
        category: "Heritage",
        description:
          "Impressionist masterworks by Monet and Van Gogh inside a converted railway station.",
        fee: "€16 entry",
      },
      {
        name: "Notre-Dame Cathedral",
        category: "Heritage",
        description:
          "Gothic masterpiece undergoing restoration; exterior and surrounding Île de la Cité free.",
        fee: "Free (exterior)",
      },
    ],
    Bali: [
      {
        name: "Tanah Lot Temple",
        category: "Spiritual",
        description:
          "Sea temple perched on a rock formation; most-photographed sunset spot in Bali.",
        fee: "IDR 60,000",
      },
      {
        name: "Tegallalang Rice Terraces",
        category: "Nature",
        description:
          "UNESCO-listed sculptural rice paddies best visited at dawn before the crowds.",
        fee: "Free entry",
      },
      {
        name: "Uluwatu Cliff Temple",
        category: "Spiritual",
        description:
          "Clifftop temple with dramatic ocean views; watch the Kecak fire dance at sunset.",
        fee: "IDR 50,000",
      },
      {
        name: "Sacred Monkey Forest, Ubud",
        category: "Nature",
        description:
          "Ancient temple complex surrounded by jungle and 700 free-roaming macaques.",
        fee: "IDR 80,000",
      },
      {
        name: "Seminyak Beach",
        category: "Nature",
        description:
          "Premium stretch of black-sand beach lined with beach clubs and surf breaks.",
        fee: "Free entry",
      },
      {
        name: "Tirta Empul",
        category: "Spiritual",
        description:
          "Holy spring water temple where Balinese Hindus perform purification rituals.",
        fee: "IDR 50,000",
      },
    ],
    Dubai: [
      {
        name: "Burj Khalifa",
        category: "Heritage",
        description:
          "World's tallest building at 828 m; take the 'At the Top' experience to level 124.",
        fee: "AED 159+",
      },
      {
        name: "Dubai Creek & Al Fahidi",
        category: "Heritage",
        description:
          "Historic dhow harbour and Al Fahidi fort museum; best explored by traditional abra.",
        fee: "Free (fort AED 3)",
      },
      {
        name: "Dubai Mall & Dubai Fountain",
        category: "Shopping",
        description:
          "World's largest mall with an indoor ice rink; free fountain show every evening.",
        fee: "Free entry",
      },
      {
        name: "Palm Jumeirah",
        category: "Nature",
        description:
          "Man-made palm island best seen from the Atlantis monorail or helicopter tour.",
        fee: "Free (monorail AED 25)",
      },
      {
        name: "Jumeirah Mosque",
        category: "Spiritual",
        description:
          "Dubai's most photographed mosque offering guided open-door tours for all faiths.",
        fee: "AED 35 guided tour",
      },
      {
        name: "Gold & Spice Souks",
        category: "Shopping",
        description:
          "Old Deira bazaars selling 22-carat gold and aromatic spices at negotiable prices.",
        fee: "Free entry",
      },
    ],
    Tokyo: [
      {
        name: "Senso-ji Temple, Asakusa",
        category: "Spiritual",
        description:
          "Tokyo's oldest Buddhist temple; bustling Nakamise shopping lane leads to main hall.",
        fee: "Free entry",
      },
      {
        name: "Shibuya Crossing",
        category: "Adventure",
        description:
          "World's busiest pedestrian scramble; best viewed from Starbucks or Mag's Park above.",
        fee: "Free entry",
      },
      {
        name: "Tokyo Skytree",
        category: "Heritage",
        description:
          "Second tallest structure in the world at 634 m; observation deck at 450 m.",
        fee: "¥2,100+",
      },
      {
        name: "Tsukiji Fish Market",
        category: "Heritage",
        description:
          "Outer market open to all; sample fresh tuna sashimi, tamagoyaki and sushi from 5 AM.",
        fee: "Free entry",
      },
      {
        name: "Meiji Shrine",
        category: "Spiritual",
        description:
          "Forested Shinto shrine dedicated to Emperor Meiji; peaceful walk through torii gates.",
        fee: "Free entry",
      },
      {
        name: "Odaiba Island",
        category: "Adventure",
        description:
          "Futuristic waterfront with teamLab digital art museum, Rainbow Bridge and Gundam statue.",
        fee: "Varies per attraction",
      },
    ],
    Manali: [
      {
        name: "Rohtang Pass",
        category: "Adventure",
        description:
          "Snow-covered mountain pass at 3,978 m; trekking, skiing and snowmobile rides.",
        fee: "₹500 permit",
      },
      {
        name: "Hadimba Temple",
        category: "Spiritual",
        description:
          "Ancient wooden temple nestled in cedar forest; dedicated to goddess Hadimba.",
        fee: "Free entry",
      },
      {
        name: "Solang Valley",
        category: "Adventure",
        description:
          "Year-round adventure hub for zorbing, paragliding, zip-lining and snowboarding.",
        fee: "Activity-based",
      },
      {
        name: "Old Manali Village",
        category: "Heritage",
        description:
          "Cobbled lanes, apple orchards and Tibetan-influenced cafes in the original settlement.",
        fee: "Free entry",
      },
      {
        name: "Jogini Waterfall",
        category: "Nature",
        description:
          "Scenic 160-ft waterfall accessible via a 2-km trek through Vashisht village.",
        fee: "Free entry",
      },
    ],
    Ladakh: [
      {
        name: "Pangong Lake",
        category: "Nature",
        description:
          "High-altitude salt lake at 4,350 m; changes colour from blue to green to red through the day.",
        fee: "₹400 permit",
      },
      {
        name: "Thikse Monastery",
        category: "Spiritual",
        description:
          "12-storey gompa overlooking the Indus Valley; morning prayers open to visitors.",
        fee: "₹30 entry",
      },
      {
        name: "Nubra Valley",
        category: "Adventure",
        description:
          "Cold desert with double-humped Bactrian camels; sand dunes at Hunder village.",
        fee: "₹400 permit",
      },
      {
        name: "Shanti Stupa, Leh",
        category: "Spiritual",
        description:
          "Japanese-built white stupa with panoramic valley and Stok Kangri mountain views.",
        fee: "Free entry",
      },
      {
        name: "Magnetic Hill",
        category: "Adventure",
        description:
          "Optical illusion where vehicles appear to roll uphill; a famous Ladakh curiosity.",
        fee: "Free entry",
      },
      {
        name: "Leh Palace",
        category: "Heritage",
        description:
          "Nine-storey ruined palace modelled on Potala Palace in Lhasa; city and Stok range views.",
        fee: "₹15 entry",
      },
    ],
    Jaipur: [
      {
        name: "Amber Fort",
        category: "Heritage",
        description:
          "Magnificent Rajput fort-palace with ornate Sheesh Mahal (Mirror Palace) and elephant rides.",
        fee: "₹500 entry",
      },
      {
        name: "Hawa Mahal",
        category: "Heritage",
        description:
          "Palace of Winds — five-storey honeycombed facade with 953 small windows for royal purdah.",
        fee: "₹200 entry",
      },
      {
        name: "City Palace",
        category: "Heritage",
        description:
          "Working royal palace with museum, peacock gates and royal courtyard at its heart.",
        fee: "₹700 entry",
      },
      {
        name: "Jantar Mantar",
        category: "Heritage",
        description:
          "UNESCO World Heritage astronomical observatory with the world's largest stone sundial.",
        fee: "₹200 entry",
      },
      {
        name: "Johari Bazaar",
        category: "Shopping",
        description:
          "Jaipur's grand jewellery and textile market; best for gemstones, bangles and block prints.",
        fee: "Free entry",
      },
      {
        name: "Nahargarh Fort",
        category: "Heritage",
        description:
          "Hilltop fort with stunning sunset panorama over the Pink City; rooftop café inside.",
        fee: "₹200 entry",
      },
    ],
    Kerala: [
      {
        name: "Alleppey Backwaters",
        category: "Nature",
        description:
          "Overnight houseboat cruise through a 900-km network of canals, lagoons and paddy fields.",
        fee: "₹8,000/night houseboat",
      },
      {
        name: "Munnar Tea Estates",
        category: "Nature",
        description:
          "Emerald-green hill station tea estates at 1,600 m; guided factory tour and tasting.",
        fee: "₹150 tea museum",
      },
      {
        name: "Periyar Wildlife Sanctuary",
        category: "Nature",
        description:
          "Boat safari spotting wild elephants, gaur and otters on a picturesque reservoir.",
        fee: "₹350 entry",
      },
      {
        name: "Fort Kochi",
        category: "Heritage",
        description:
          "Portuguese and Dutch colonial heritage; Chinese fishing nets, antique shops and street art.",
        fee: "Free entry",
      },
      {
        name: "Thrissur Pooram Grounds",
        category: "Heritage",
        description:
          "Venue for Kerala's grandest temple festival; year-round museum of caparisoned elephants.",
        fee: "Free entry",
      },
    ],
    Pondicherry: [
      {
        name: "Auroville",
        category: "Spiritual",
        description:
          "Experimental universal town built around the Matrimandir golden sphere and silent meditation.",
        fee: "Free (Matrimandir ₹10)",
      },
      {
        name: "French Quarter (White Town)",
        category: "Heritage",
        description:
          "Tree-lined streets with colonial villas, ashrams and quaint Franco-Tamil architecture.",
        fee: "Free entry",
      },
      {
        name: "Sri Aurobindo Ashram",
        category: "Spiritual",
        description:
          "Spiritual community founded in 1926; samadhi garden open to all faiths for meditation.",
        fee: "Free entry",
      },
      {
        name: "Promenade Beach",
        category: "Nature",
        description:
          "4-km beachfront boulevard closed to traffic at sunrise; perfect for cycling and breakfast.",
        fee: "Free entry",
      },
      {
        name: "Paradise Beach",
        category: "Nature",
        description:
          "Secluded backwater beach accessible only by ferry; clean sands and calm waters.",
        fee: "₹150 ferry",
      },
    ],
    Maldives: [
      {
        name: "Maafushi Beach",
        category: "Nature",
        description:
          "Most popular local island beach with crystal-clear lagoon and budget guesthouses nearby.",
        fee: "Free entry",
      },
      {
        name: "Whale Shark Snorkelling, South Ari",
        category: "Adventure",
        description:
          "Best spot in the world for guaranteed whale shark encounters from April to December.",
        fee: "USD 80 excursion",
      },
      {
        name: "Male Friday Mosque",
        category: "Spiritual",
        description:
          "17th-century coral-stone mosque with intricate local craftsmanship; UNESCO-listed.",
        fee: "Free entry",
      },
      {
        name: "Banana Reef Dive Site",
        category: "Adventure",
        description:
          "Iconic coral reef teeming with reef sharks, mantas and colourful marine life.",
        fee: "USD 60 guided dive",
      },
      {
        name: "Hulhumale Artificial Beach",
        category: "Nature",
        description:
          "Reclaimed island's public beach; free, clean and 15 minutes from Malé by ferry.",
        fee: "Free entry",
      },
    ],
  };

  const defaultAttractions: Attraction[] = [
    {
      name: `${destination} Old Town`,
      category: "Heritage",
      description:
        "The historic heart of the city with centuries of architecture, bazaars and street life.",
      fee: "Free entry",
    },
    {
      name: `${destination} National Museum`,
      category: "Heritage",
      description:
        "Comprehensive collection of local history, art and culture from the region.",
      fee: "₹100 entry",
    },
    {
      name: `${destination} Botanical Garden`,
      category: "Nature",
      description:
        "Lush green park and botanical garden ideal for morning walks and family picnics.",
      fee: "Free entry",
    },
    {
      name: "Local Spice & Craft Market",
      category: "Shopping",
      description:
        "Vibrant open-air market selling local handicrafts, spices and handwoven textiles.",
      fee: "Free entry",
    },
    {
      name: "Viewpoint Hill",
      category: "Nature",
      description:
        "The best panoramic viewpoint in the region; great for sunrise and sunset photography.",
      fee: "Free entry",
    },
  ];

  return map[destination] ?? defaultAttractions;
}

const CATEGORY_COLORS: Record<string, string> = {
  Heritage:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Nature:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Adventure:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  Spiritual:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

/** Convert backend Review to local Review shape */
function toLocalReview(r: BackendReview): Review {
  return {
    id: String(r.id),
    reviewerName: r.userName,
    reviewerInitials: r.userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    date: new Date(Number(r.createdAt) / 1_000_000).toLocaleDateString(
      "en-IN",
      { month: "long", year: "numeric" },
    ),
    rating: Number(r.rating),
    text: r.text,
  };
}

// ── Main Component ────────────────────────────────────────────────────────
export default function TravelPlanDetail() {
  const navigate = useNavigate();
  const { actor } = useActor(createActor);
  const { session } = useSession();

  // ── All state before any early return ─────────────────────────────────
  const [activeDay, setActiveDay] = useState(1);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "rv-001",
      reviewerName: "Priya Sharma",
      reviewerInitials: "PS",
      date: "March 2025",
      rating: 5,
      text: "Absolutely breathtaking experience! Every detail was perfectly arranged — from the hotel to the guided tours. The destination exceeded all my expectations. Will definitely book again!",
    },
    {
      id: "rv-002",
      reviewerName: "Arjun Mehta",
      reviewerInitials: "AM",
      date: "February 2025",
      rating: 4,
      text: "Great trip overall. The itinerary was well-paced and the local guide was knowledgeable. A few minor scheduling hiccups, but the WanderAssist team resolved everything quickly.",
    },
    {
      id: "rv-003",
      reviewerName: "Sofia Rodrigues",
      reviewerInitials: "SR",
      date: "January 2025",
      rating: 5,
      text: "One of the best travel experiences I've ever had. The food recommendations were spot-on and the accommodation was stunning. Highly recommend this plan to every traveller!",
    },
    {
      id: "rv-004",
      reviewerName: "Kiran Nair",
      reviewerInitials: "KN",
      date: "December 2024",
      rating: 4,
      text: "Smooth booking, excellent service on the ground. The surprise evening cruise on Day 1 was a standout moment. Perfect for couples and families alike.",
    },
  ]);

  const raw = sessionStorage.getItem("selectedPlan");
  const plan = raw
    ? (JSON.parse(raw) as {
        id: number;
        name: string;
        rating: number;
        reviews: number;
        price: number;
        days: number;
        nights: number;
        guided: boolean;
        destination: string;
        travelers?: number;
      })
    : null;

  const planId = plan?.id;
  const favPlanId = plan
    ? `plan-${plan.destination}-${plan.id ?? plan.name}`
    : "";
  // Load reviews from canister when plan is available
  useEffect(() => {
    if (!planId || !actor) return;
    const placeId = String(planId);
    setReviewsLoading(true);
    actor
      .getReviewsForPlace(placeId)
      .then((backendReviews) => {
        if (backendReviews.length > 0) {
          setReviews(backendReviews.map(toLocalReview));
        }
      })
      .catch((err) =>
        console.error("[TravelPlanDetail] getReviewsForPlace:", err),
      )
      .finally(() => setReviewsLoading(false));
  }, [actor, planId]);

  // ── Handlers (no plan dependency — safe before early return) ──────────
  async function handleSubmitReview() {
    if (newRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (reviewText.trim().length < 10) {
      setReviewError("Review must be at least 10 characters.");
      return;
    }
    setReviewError("");

    const userName = session?.userName ?? "Anonymous";
    const userId = session?.userId ?? "guest";
    const placeId = plan ? String(plan.id) : "unknown";

    // Optimistic local add
    const entry: Review = {
      id: `rv-user-${Date.now()}`,
      reviewerName: userName,
      reviewerInitials: userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      date: "Just now",
      rating: newRating,
      text: reviewText.trim(),
    };
    setReviews((prev) => [entry, ...prev]);
    setReviewText("");
    setNewRating(0);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);

    // Persist to canister
    if (actor) {
      actor
        .saveReview(
          placeId,
          userId,
          userName,
          BigInt(newRating),
          reviewText.trim(),
        )
        .catch((err) => console.error("[TravelPlanDetail] saveReview:", err));
    }
  }

  function handleCopyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No plan selected.</p>
          <Button onClick={() => navigate({ to: "/travel-plans/results" })}>
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const { destination, days, price, travelers = 2 } = plan;
  const nights = days - 1;
  const itinerary = buildItinerary(destination, days);
  const weather = getWeather(destination);
  const dressCode = getDressCode(destination);
  const photoSpots = getPhotoSpots(destination);
  const packingList = getPackingList(destination);
  const exchangeShops = getExchangeShops(destination);
  const restaurants = getRestaurants(destination);
  const attractions = getAttractions(destination);
  const totalPrice = price * travelers;
  const activeDayData =
    itinerary.find((d) => d.day === activeDay) ?? itinerary[0];

  const heroImg = getHeroImage(destination);

  const planUrl = `https://wanderassist.app/plan?id=${plan.id}`;

  function handleBook() {
    navigate({ to: "/flight-selection" });
  }

  function handleWhatsApp() {
    const text = `Check out this travel plan: ${plan!.name} - ${destination} for ${days} days. Book here: ${planUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleDownloadSummary() {
    void generatePDF();
  }

  async function generatePDF() {
    if (pdfGenerating) return;
    setPdfGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = 0;

      // Helper: add new page if content overflows
      function checkNewPage(needed = 10) {
        if (y + needed > 275) {
          doc.addPage();
          y = 20;
        }
      }

      // ── Header ─────────────────────────────────────────────────────
      doc.setFillColor(37, 99, 235); // blue-600
      doc.rect(0, 0, pageW, 28, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("WanderAssist", margin, 12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Your smart travel companion — wanderassist.app", margin, 20);

      y = 38;

      // ── Plan title ─────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(17, 24, 39);
      doc.text(plan!.name, margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(
        `${destination}  •  ${days} Days / ${nights} Nights  •  ${travelers} Traveler${travelers > 1 ? "s" : ""}`,
        margin,
        y,
      );
      y += 6;
      doc.text(
        `Total Cost: INR ${totalPrice.toLocaleString()}  (INR ${price.toLocaleString()} per person)`,
        margin,
        y,
      );
      y += 4;
      // Divider
      doc.setDrawColor(209, 213, 219);
      doc.line(margin, y + 2, pageW - margin, y + 2);
      y += 8;

      // ── Weather & Dress Code ───────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("Weather Conditions", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`Temperature: ${weather.temp}`, margin, y);
      y += 5;
      doc.text(`Condition: ${weather.condition}`, margin, y);
      y += 5;
      doc.text(
        `Humidity: ${weather.humidity}  |  Wind: ${weather.wind}`,
        margin,
        y,
      );
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("Dress Code", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const dressLines = doc.splitTextToSize(dressCode, contentW) as string[];
      doc.text(dressLines, margin, y);
      y += dressLines.length * 5 + 6;

      // ── Inclusions / Exclusions ────────────────────────────────────
      checkNewPage(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("What's Included", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const inclusions = [
        "Flight tickets",
        "Hotel accommodation",
        "Daily breakfast",
        "Airport transfers",
        "Sightseeing tours",
        "Travel insurance",
      ];
      for (const item of inclusions) {
        checkNewPage(6);
        doc.text(`✓  ${item}`, margin + 2, y);
        y += 5;
      }
      y += 4;

      checkNewPage(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("What's Not Included", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const exclusions = [
        "Personal expenses",
        "Optional activities",
        "Tips and gratuities",
        "Visa fees",
      ];
      for (const item of exclusions) {
        checkNewPage(6);
        doc.text(`✗  ${item}`, margin + 2, y);
        y += 5;
      }
      y += 6;

      // ── Day-by-Day Itinerary ───────────────────────────────────────
      checkNewPage(20);
      doc.setFillColor(243, 244, 246);
      doc.rect(0, y - 4, pageW, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text("Day-by-Day Itinerary", margin, y + 6);
      y += 18;

      for (const day of itinerary) {
        checkNewPage(24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.text(`Day ${day.day}: ${day.title}`, margin, y);
        y += 5;
        doc.setDrawColor(219, 234, 254);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        for (const act of day.activities) {
          checkNewPage(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(55, 65, 81);
          doc.text(`${act.period} — ${act.title}`, margin + 4, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(107, 114, 128);
          const descLines = doc.splitTextToSize(
            act.description,
            contentW - 8,
          ) as string[];
          doc.text(descLines, margin + 4, y);
          y += descLines.length * 4.5;
          doc.text(`📍 ${act.location}`, margin + 4, y);
          y += 6;
        }

        // Meals
        checkNewPage(12);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Meals — Breakfast: ${day.meals.breakfast}  |  Lunch: ${day.meals.lunch}  |  Dinner: ${day.meals.dinner}`,
          margin + 4,
          y,
        );
        y += 10;
      }

      // ── Footer ─────────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = 290;
        doc.setDrawColor(209, 213, 219);
        doc.line(margin, footerY - 4, pageW - margin, footerY - 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Generated by WanderAssist  •  wanderassist.app  •  Page ${i} of ${pageCount}`,
          margin,
          footerY,
        );
      }

      const fileName = `WanderAssist_Itinerary_${destination.replace(/\s+/g, "_")}_${plan!.id}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("[TravelPlanDetail] PDF generation failed:", err);
    } finally {
      setPdfGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-4 pt-5">
        <button
          type="button"
          onClick={() => navigate({ to: "/travel-plans/results" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-fast"
          data-ocid="back-to-plans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>
      </div>

      {/* Hero */}
      <div
        className="relative mt-4 mx-auto max-w-6xl rounded-2xl overflow-hidden h-72 shadow-hero"
        style={{
          backgroundImage: `url('${heroImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1a1a2e",
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
        {/* Favorite button — top right of hero */}
        {favPlanId && (
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton
              planId={favPlanId}
              size="lg"
              trip={{
                planId: favPlanId,
                planName: plan.name,
                destination,
                image: heroImg,
                pricePerPerson: price,
                days,
                travelers,
              }}
            />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
          <Badge className="bg-primary/80 text-white border-0 mb-2">
            {days}D / {nights}N
          </Badge>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white text-shadow-hero leading-tight">
            {plan.name}
          </h1>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i <= Math.round(plan.rating) ? "fill-amber-400 text-amber-400" : "text-white/40"}`}
              />
            ))}
            <span className="text-white/90 font-semibold text-sm">
              {plan.rating}
            </span>
            <span className="text-white/60 text-sm">
              ({plan.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day-by-day itinerary */}
          <Card className="border-border" data-ocid="itinerary-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">
                Day-by-Day Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-1 flex-wrap">
                {itinerary.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-fast border ${
                      activeDay === d.day
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    data-ocid={`day-tab-${d.day}`}
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>

              {activeDayData && (
                <div className="space-y-4 animate-fade-in" key={activeDay}>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Day {activeDayData.day}: {activeDayData.title}
                  </h3>
                  <div className="space-y-3">
                    {activeDayData.activities.map((act) => (
                      <div
                        key={act.period}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl ${act.color}`}
                        >
                          {act.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {act.period}
                            </Badge>
                          </div>
                          <p className="font-semibold text-sm text-foreground">
                            {act.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {act.description}
                          </p>
                          <p className="text-xs text-primary mt-1 font-medium">
                            📍 {act.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      {
                        label: "Breakfast",
                        icon: "🥐",
                        value: activeDayData.meals.breakfast,
                      },
                      {
                        label: "Lunch",
                        icon: "🍜",
                        value: activeDayData.meals.lunch,
                      },
                      {
                        label: "Dinner",
                        icon: "🍷",
                        value: activeDayData.meals.dinner,
                      },
                    ].map((meal) => (
                      <div
                        key={meal.label}
                        className="text-center p-3 rounded-xl bg-muted/40 border border-border"
                      >
                        <p className="text-xl mb-1">{meal.icon}</p>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {meal.label}
                        </p>
                        <p className="text-xs text-foreground mt-0.5 line-clamp-2">
                          {meal.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── PACKING LIST ─────────────────────────────────────────────── */}
          <Card className="border-border" data-ocid="packing-list-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Backpack className="w-5 h-5 text-primary" />
                Packing List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {packingList.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-muted/40 text-foreground"
                  >
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── CURRENCY EXCHANGE ────────────────────────────────────────── */}
          <Card className="border-border" data-ocid="exchange-shops-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                Currency Exchange
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exchangeShops.map((shop) => (
                <div
                  key={shop.name}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-fast"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {shop.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {shop.area}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        🕐 {shop.hours}
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {shop.note}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── POPULAR RESTAURANTS ──────────────────────────────────────── */}
          <Card className="border-border" data-ocid="restaurants-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-rose-500" />
                Popular Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {restaurants.map((r) => (
                  <div
                    key={r.name}
                    className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-fast space-y-2"
                    data-ocid="restaurant-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground leading-tight">
                        {r.name}
                      </p>
                      <span className="text-sm font-bold text-muted-foreground shrink-0">
                        {r.price}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {r.cuisine}
                    </Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {r.description}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      📍 {r.area}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── POPULAR PLACES & ATTRACTIONS ──────────────────────────────── */}
          <Card className="border-border" data-ocid="attractions-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-500" />
                Popular Places
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attractions.map((place, idx) => (
                <div
                  key={`${place.name}-${idx}`}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/20 transition-fast"
                  data-ocid="attraction-card"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-sm font-bold text-amber-700 dark:text-amber-300">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm text-foreground">
                        {place.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[place.category] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {place.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {place.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {place.fee}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inclusions */}
          <Card className="border-border" data-ocid="inclusions-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Flight tickets",
                  "Hotel accommodation",
                  "Daily breakfast",
                  "Airport transfers",
                  "Sightseeing tours",
                  "Travel insurance",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card className="border-border" data-ocid="exclusions-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                What's Not Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Personal expenses",
                  "Optional activities",
                  "Tips and gratuities",
                  "Visa fees",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Reviews & Ratings ──────────────────────────────────────────── */}
          <Card className="border-border" data-ocid="reviews-section">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Reviews & Ratings
                {reviewsLoading && (
                  <span className="ml-2 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="flex flex-col sm:flex-row gap-6 p-5 rounded-2xl bg-muted/30 border border-border">
                <div className="flex flex-col items-center justify-center min-w-[100px]">
                  <p className="font-display font-bold text-5xl text-primary leading-none">
                    {avgRating.toFixed(1)}
                  </p>
                  <div className="flex gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reviews.length} reviews
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  {starCounts.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-xs font-semibold w-4 text-right text-muted-foreground">
                        {star}
                      </span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{
                            width:
                              reviews.length > 0
                                ? `${(count / reviews.length) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-4">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl border border-border bg-card space-y-2"
                    data-ocid="review-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {review.reviewerInitials}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {review.reviewerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Success toast */}
              {reviewSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-sm font-medium animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Review posted! Thank you for sharing your experience.
                </div>
              )}

              {/* Write a Review */}
              <div
                className="space-y-4 p-5 rounded-2xl border border-primary/20 bg-primary/5"
                data-ocid="write-review-form"
              >
                <h4 className="font-display font-bold text-base text-foreground">
                  Write a Review
                </h4>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Your Rating
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(i)}
                        className="transition-transform hover:scale-110"
                        data-ocid="star-rating-btn"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors duration-150 ${
                            i <= (hoverRating || newRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Your Experience
                  </p>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience…"
                    rows={4}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-smooth"
                    data-ocid="review-textarea"
                  />
                </div>
                {reviewError && (
                  <p className="text-sm text-destructive font-medium">
                    {reviewError}
                  </p>
                )}
                <Button
                  onClick={handleSubmitReview}
                  className="gap-2 font-bold"
                  data-ocid="post-review-btn"
                >
                  <Send className="w-4 h-4" />
                  Post Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          {/* Pricing card */}
          <Card
            className="border-primary/30 shadow-elevated"
            data-ocid="pricing-card"
          >
            <div className="h-1 bg-gradient-to-r from-primary to-blue-400 rounded-t-xl" />
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Starting from
                </p>
                <p className="font-display font-bold text-3xl text-primary">
                  ₹{price.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">per person</p>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between border-t border-border pt-3">
                <span>
                  Total ({travelers} traveler{travelers > 1 ? "s" : ""})
                </span>
                <span className="font-bold text-foreground">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-bold text-base py-6"
                onClick={handleBook}
                data-ocid="book-this-plan-btn"
              >
                Book This Plan
              </Button>
            </CardContent>
          </Card>

          {/* Share This Trip */}
          <Card
            className="border-primary/20 bg-gradient-to-br from-primary/5 to-background"
            data-ocid="share-trip-card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary" /> Share This Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                type="button"
                onClick={() => handleCopyLink(planUrl)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-smooth text-left group"
                data-ocid="copy-link-btn"
              >
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Copy Link
                  </p>
                  {copySuccess ? (
                    <p className="text-xs text-green-500 font-medium animate-fade-in">
                      Link copied!
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Share a direct link
                    </p>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-green-500/5 hover:border-green-500/40 transition-smooth text-left group"
                data-ocid="whatsapp-share-btn"
              >
                <span className="text-lg shrink-0">💬</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Share via WhatsApp
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Send to friends & family
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDownloadSummary}
                disabled={pdfGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-smooth text-left group disabled:opacity-60 disabled:cursor-not-allowed"
                data-ocid="download-summary-btn"
              >
                {pdfGenerating ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {pdfGenerating ? "Generating PDF…" : "Download Itinerary"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pdfGenerating ? "Please wait…" : "Save as PDF file"}
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Weather */}
          <Card className="border-border" data-ocid="weather-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-blue-500" /> Weather
                Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-medium">{weather.temp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium">{weather.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Humidity
                </span>
                <span className="font-medium">{weather.humidity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" /> Wind
                </span>
                <span className="font-medium">{weather.wind}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dress Code */}
          <Card className="border-border" data-ocid="dress-code-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-indigo-500" /> Dress Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dressCode}
              </p>
            </CardContent>
          </Card>

          {/* Photography */}
          <Card className="border-border" data-ocid="photography-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" /> Best Photo Spots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {photoSpots.map((spot) => (
                  <li
                    key={spot}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-rose-400">📸</span> {spot}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Temples (India-specific) */}
          {[
            "Goa",
            "Kerala",
            "Jaipur",
            "Mumbai",
            "Delhi",
            "Manali",
            "Pondicherry",
            "Bangalore",
          ].includes(destination) && (
            <Card className="border-border" data-ocid="temples-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm">
                  🛕 Temples & Religious Sites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                <p>• Dress modestly — cover shoulders and knees.</p>
                <p>• Remove footwear before entering.</p>
                <p>• Photography may be restricted inside shrines.</p>
                <p>• Visiting hours: usually 6 AM – 12 PM &amp; 4 PM – 9 PM.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── FLOATING BOOK NOW BAR ───────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-3 bg-card/95 border-t border-border backdrop-blur-sm shadow-hero"
        data-ocid="floating-book-bar"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display font-bold text-foreground text-sm leading-tight truncate">
              {plan.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {destination} · {days}D/{nights}N · {travelers} traveler
              {travelers > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display font-bold text-primary text-lg">
                ₹{totalPrice.toLocaleString()}
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground font-bold px-6 py-5 text-base shadow-elevated"
              onClick={handleBook}
              data-ocid="floating-book-btn"
            >
              Book Now →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
