import type { TourPackage } from "@/types/travel";

export const tourPackages: TourPackage[] = [
  // Family packages
  {
    id: "pkg-family-001",
    title: "Kerala Family Bliss",
    type: "family",
    destination: "Kerala",
    duration: 7,
    pricePerPerson: 18000,
    includes: [
      "Houseboat stay (2 nights)",
      "All meals",
      "Wildlife safari",
      "Elephant interaction",
      "Kids activity camp",
    ],
    itinerary: [
      "Day 1: Arrive Kochi, heritage walk",
      "Day 2: Munnar hill station, tea factory tour",
      "Day 3: Periyar Wildlife Sanctuary boat safari",
      "Day 4: Alleppey houseboat boarding",
      "Day 5: Backwater village experience",
      "Day 6: Kovalam Beach family fun",
      "Day 7: Departure",
    ],
    highlights: [
      "Houseboat experience",
      "Elephant interaction",
      "Wildlife safari",
    ],
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
  },
  {
    id: "pkg-family-002",
    title: "Rajasthan Royal Family Tour",
    type: "family",
    destination: "Jaipur",
    duration: 6,
    pricePerPerson: 15000,
    includes: [
      "Palace hotel stay",
      "Breakfast & dinner",
      "Elephant ride (Amber Fort)",
      "Camel cart ride",
      "Cultural show",
    ],
    itinerary: [
      "Day 1: Arrive Jaipur, City Palace",
      "Day 2: Amber Fort elephant ride & Hawa Mahal",
      "Day 3: Jaisalmer Sam Sand Dunes, camel safari",
      "Day 4: Jodhpur Blue City, Mehrangarh Fort",
      "Day 5: Pushkar Fair & Brahma Temple",
      "Day 6: Return Jaipur, departure",
    ],
    highlights: ["Elephant ride", "Palace hotel", "Camel safari"],
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
  },
  // Couples packages
  {
    id: "pkg-couples-001",
    title: "Maldives Romance Escape",
    type: "couples",
    destination: "Maldives",
    duration: 5,
    pricePerPerson: 95000,
    includes: [
      "Overwater bungalow (4 nights)",
      "Breakfast & candlelit dinner",
      "Couple spa session",
      "Snorkeling tour",
      "Sunset cruise",
    ],
    itinerary: [
      "Day 1: Arrive Malé, speedboat to resort",
      "Day 2: Private beach, water sports",
      "Day 3: Snorkeling & dolphin watching",
      "Day 4: Couple spa & sandbank picnic",
      "Day 5: Sunrise beach breakfast, departure",
    ],
    highlights: ["Overwater bungalow", "Candlelit dinner", "Sunset cruise"],
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
  },
  {
    id: "pkg-couples-002",
    title: "Bali Romantic Retreat",
    type: "couples",
    destination: "Bali",
    duration: 6,
    pricePerPerson: 45000,
    includes: [
      "Private villa with pool",
      "Daily breakfast",
      "Couples cooking class",
      "Temple blessing ceremony",
      "Sunset dinner at Jimbaran",
    ],
    itinerary: [
      "Day 1: Arrive Denpasar, villa check-in",
      "Day 2: Ubud rice terraces & monkey forest",
      "Day 3: Temple visits, couples cooking class",
      "Day 4: Nusa Penida island day trip",
      "Day 5: Spa day & sunset at Tanah Lot",
      "Day 6: Seminyak beach, departure",
    ],
    highlights: ["Private pool villa", "Temple blessing", "Sunset dinner"],
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
  },
  // Adventure packages
  {
    id: "pkg-adventure-001",
    title: "Ladakh Extreme Adventure",
    type: "adventure",
    destination: "Ladakh",
    duration: 9,
    pricePerPerson: 28000,
    includes: [
      "Camping & guesthouses",
      "All meals",
      "Bike rental (optional)",
      "White water rafting",
      "Himalayan trekking guide",
    ],
    itinerary: [
      "Day 1: Arrive Leh, acclimatization",
      "Day 2: Shanti Stupa & local market",
      "Day 3: Khardung La pass (world's highest motorable road)",
      "Day 4: Nubra Valley & Hunder sand dunes",
      "Day 5: Pangong Lake overnight camping",
      "Day 6: Pangong sunrise photography",
      "Day 7: Zanskar Valley trek",
      "Day 8: Indus River white water rafting",
      "Day 9: Departure",
    ],
    highlights: ["Khardung La pass", "Pangong Lake camping", "River rafting"],
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
  },
  {
    id: "pkg-adventure-002",
    title: "Manali Snow & Thrills",
    type: "adventure",
    destination: "Manali",
    duration: 6,
    pricePerPerson: 16000,
    includes: [
      "Mountain lodge stay",
      "All meals",
      "Paragliding session",
      "Snow activities",
      "ATV ride",
    ],
    itinerary: [
      "Day 1: Arrive Manali, Old Manali walk",
      "Day 2: Solang Valley skiing & snow activities",
      "Day 3: Rohtang Pass excursion",
      "Day 4: Paragliding & ATV adventure",
      "Day 5: Beas River rafting & Hadimba Temple",
      "Day 6: Local market & departure",
    ],
    highlights: ["Paragliding", "Rohtang Pass", "River rafting"],
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
  },
  // Senior packages
  {
    id: "pkg-senior-001",
    title: "Goa Gentle Coastal Retreat",
    type: "senior",
    destination: "Goa",
    duration: 5,
    pricePerPerson: 14000,
    includes: [
      "4-star beach resort",
      "All meals",
      "Medical assistance on call",
      "Air-conditioned coach",
      "Accessible beaches",
    ],
    itinerary: [
      "Day 1: Arrive Goa, resort check-in & rest",
      "Day 2: North Goa heritage — Old Goa churches, leisurely cruise",
      "Day 3: Relaxed beach day, yoga & wellness",
      "Day 4: Spice plantation tour, Dudhsagar waterfalls",
      "Day 5: Shopping at Anjuna market, departure",
    ],
    highlights: ["4-star resort", "Medical assistance", "Accessible beaches"],
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
  },
  {
    id: "pkg-senior-002",
    title: "Singapore Comfort Explorer",
    type: "senior",
    destination: "Singapore",
    duration: 5,
    pricePerPerson: 60000,
    includes: [
      "5-star hotel",
      "Breakfast & dinner",
      "Wheelchair-accessible transport",
      "Personal escort guide",
      "Medical travel insurance",
    ],
    itinerary: [
      "Day 1: Arrive Singapore, hotel check-in, Gardens by the Bay evening",
      "Day 2: Sentosa Island — cable car, accessible beaches",
      "Day 3: Marina Bay Sands observation deck, hawker centre lunch",
      "Day 4: Singapore Zoo & Night Safari (easy walking)",
      "Day 5: Orchard Road shopping, departure",
    ],
    highlights: [
      "5-star hotel",
      "Personal escort guide",
      "Wheelchair accessible",
    ],
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
  },
];

export function getPackageById(id: string): TourPackage | undefined {
  return tourPackages.find((p) => p.id === id);
}

export function getPackagesByType(type: TourPackage["type"]): TourPackage[] {
  return tourPackages.filter((p) => p.type === type);
}
