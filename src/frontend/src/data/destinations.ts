import type { Destination } from "@/types/travel";

export const destinations: Destination[] = [
  // International Destinations
  {
    id: "bali",
    name: "Bali",
    type: "international",
    region: "Southeast Asia, Indonesia",
    costPerPerson: 35000,
    description:
      "The Island of the Gods — lush terraced rice fields, ancient temples, vibrant arts, and world-class surf breaks.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    tags: ["Beach", "Culture", "Spiritual", "Adventure"],
    duration: 7,
    highlights: [
      "Ubud Rice Terraces",
      "Tanah Lot Temple",
      "Seminyak Beach",
      "Mount Batur Trek",
    ],
  },
  {
    id: "paris",
    name: "Paris",
    type: "international",
    region: "Western Europe, France",
    costPerPerson: 85000,
    description:
      "The City of Light — iconic landmarks, world-class art, haute cuisine, and romantic boulevards.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    tags: ["Culture", "Romantic", "History", "Food"],
    duration: 6,
    highlights: [
      "Eiffel Tower",
      "Louvre Museum",
      "Montmartre",
      "Seine River Cruise",
    ],
  },
  {
    id: "dubai",
    name: "Dubai",
    type: "international",
    region: "Middle East, UAE",
    costPerPerson: 65000,
    description:
      "Where the desert meets the future — towering skyscrapers, lavish malls, and timeless desert safaris.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    tags: ["Luxury", "Shopping", "Adventure", "Modern"],
    duration: 5,
    highlights: [
      "Burj Khalifa",
      "Desert Safari",
      "Palm Jumeirah",
      "Dubai Mall",
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    type: "international",
    region: "East Asia, Japan",
    costPerPerson: 75000,
    description:
      "A seamless blend of ancient tradition and dazzling innovation — neon lights, zen gardens, and incredible food.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    tags: ["Culture", "Food", "Tech", "Nature"],
    duration: 8,
    highlights: [
      "Shibuya Crossing",
      "Mount Fuji",
      "Senso-ji Temple",
      "Akihabara",
    ],
  },
  {
    id: "new-york",
    name: "New York",
    type: "international",
    region: "North America, USA",
    costPerPerson: 120000,
    description:
      "The city that never sleeps — iconic skyline, Broadway shows, world-class museums, and diverse neighborhoods.",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    tags: ["City", "Culture", "Food", "Entertainment"],
    duration: 7,
    highlights: [
      "Times Square",
      "Central Park",
      "Statue of Liberty",
      "Brooklyn Bridge",
    ],
  },
  {
    id: "london",
    name: "London",
    type: "international",
    region: "Western Europe, UK",
    costPerPerson: 95000,
    description:
      "A city steeped in history and culture — royal palaces, world-famous museums, theatres, and vibrant street markets.",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    tags: ["History", "Culture", "Royal", "Food"],
    duration: 6,
    highlights: [
      "Big Ben",
      "Tower of London",
      "Buckingham Palace",
      "Notting Hill",
    ],
  },
  {
    id: "singapore",
    name: "Singapore",
    type: "international",
    region: "Southeast Asia",
    costPerPerson: 55000,
    description:
      "The Lion City — gleaming skyline, lush gardens by the bay, hawker centres, and multicultural heritage.",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    tags: ["Modern", "Food", "Shopping", "Family"],
    duration: 5,
    highlights: [
      "Gardens by the Bay",
      "Marina Bay Sands",
      "Sentosa Island",
      "Hawker Food Tour",
    ],
  },
  {
    id: "maldives",
    name: "Maldives",
    type: "international",
    region: "South Asia, Indian Ocean",
    costPerPerson: 90000,
    description:
      "Paradise on Earth — crystalline lagoons, overwater bungalows, spectacular coral reefs, and pristine white sands.",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    tags: ["Luxury", "Beach", "Romantic", "Diving"],
    duration: 6,
    highlights: [
      "Overwater Bungalows",
      "Snorkeling & Diving",
      "Private Island",
      "Sunset Cruise",
    ],
  },

  // Indian Destinations
  {
    id: "goa",
    name: "Goa",
    type: "indian",
    region: "Western India",
    costPerPerson: 12000,
    description:
      "India's beach paradise — golden sands, Portuguese heritage, vibrant nightlife, and fresh seafood on the coast.",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    tags: ["Beach", "Nightlife", "Heritage", "Food"],
    duration: 4,
    highlights: [
      "Baga Beach",
      "Old Goa Churches",
      "Dudhsagar Falls",
      "Spice Plantation",
    ],
  },
  {
    id: "kerala",
    name: "Kerala",
    type: "indian",
    region: "South India",
    costPerPerson: 15000,
    description:
      "God's Own Country — tranquil backwaters, lush green hill stations, Ayurvedic spas, and diverse wildlife.",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    tags: ["Nature", "Wellness", "Culture", "Wildlife"],
    duration: 6,
    highlights: [
      "Alleppey Backwaters",
      "Munnar Tea Estates",
      "Periyar Wildlife Sanctuary",
      "Kovalam Beach",
    ],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    type: "indian",
    region: "Western India, Maharashtra",
    costPerPerson: 10000,
    description:
      "The City of Dreams — Bollywood glamour, colonial architecture, street food culture, and the spirit of ambition.",
    image:
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80",
    tags: ["City", "Food", "Culture", "Bollywood"],
    duration: 3,
    highlights: [
      "Gateway of India",
      "Marine Drive",
      "Dharavi",
      "Elephanta Caves",
    ],
  },
  {
    id: "chennai",
    name: "Chennai",
    type: "indian",
    region: "South India, Tamil Nadu",
    costPerPerson: 8000,
    description:
      "Gateway to South India — ancient Dravidian temples, long Marina Beach, classical arts, and spicy Chettinad cuisine.",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    tags: ["Culture", "Heritage", "Food", "Beach"],
    duration: 3,
    highlights: [
      "Mahabalipuram",
      "Marina Beach",
      "Kapaleeshwarar Temple",
      "DakshinaChitra",
    ],
  },
  {
    id: "delhi",
    name: "Delhi",
    type: "indian",
    region: "North India",
    costPerPerson: 9000,
    description:
      "India's capital — millennia of history from Mughal forts to colonial boulevards, bustling bazaars, and street food.",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    tags: ["History", "Food", "Culture", "Heritage"],
    duration: 3,
    highlights: ["Red Fort", "India Gate", "Qutub Minar", "Chandni Chowk"],
  },
  {
    id: "jaipur",
    name: "Jaipur",
    type: "indian",
    region: "North India, Rajasthan",
    costPerPerson: 11000,
    description:
      "The Pink City — majestic forts, ornate palaces, vibrant bazaars, and the royal Rajasthani experience.",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    tags: ["History", "Heritage", "Culture", "Royal"],
    duration: 4,
    highlights: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar"],
  },
  {
    id: "manali",
    name: "Manali",
    type: "indian",
    region: "North India, Himachal Pradesh",
    costPerPerson: 13000,
    description:
      "Adventure in the Himalayas — snow-capped peaks, roaring rivers, paragliding, and ancient Buddhist monasteries.",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    tags: ["Adventure", "Mountains", "Nature", "Snow"],
    duration: 5,
    highlights: [
      "Rohtang Pass",
      "Solang Valley",
      "Hadimba Temple",
      "Beas River Rafting",
    ],
  },
  {
    id: "ladakh",
    name: "Ladakh",
    type: "indian",
    region: "North India, J&K",
    costPerPerson: 18000,
    description:
      "Land of High Passes — stark Himalayan landscapes, turquoise lakes, ancient monasteries, and extreme adventure.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    tags: ["Adventure", "Mountains", "Culture", "Photography"],
    duration: 7,
    highlights: [
      "Pangong Lake",
      "Khardung La Pass",
      "Thiksey Monastery",
      "Nubra Valley",
    ],
  },
  {
    id: "pondicherry",
    name: "Pondicherry",
    type: "indian",
    region: "South India",
    costPerPerson: 9000,
    description:
      "The French Riviera of the East — charming colonial streets, tranquil Auroville, beaches, and yogic retreat.",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    tags: ["Heritage", "Wellness", "Beach", "Culture"],
    duration: 3,
    highlights: [
      "French Quarter",
      "Auroville",
      "Promenade Beach",
      "Sri Aurobindo Ashram",
    ],
  },
  {
    id: "bangalore",
    name: "Bangalore",
    type: "indian",
    region: "South India, Karnataka",
    costPerPerson: 8500,
    description:
      "India's Silicon Valley — garden city vibes, thriving café culture, tech innovation, and lush green parks.",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    tags: ["City", "Food", "Modern", "Gardens"],
    duration: 3,
    highlights: [
      "Lalbagh Botanical Garden",
      "Nandi Hills",
      "ISKCON Temple",
      "Cubbon Park",
    ],
  },
];

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function getDestinationByName(name: string): Destination | undefined {
  return destinations.find((d) => d.name.toLowerCase() === name.toLowerCase());
}

export function searchDestinations(query: string): Destination[] {
  const q = query.toLowerCase();
  return destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)) ||
      d.description.toLowerCase().includes(q),
  );
}

export function getDestinationsByBudget(
  budget: number,
  travelers = 1,
): Destination[] {
  const perPersonBudget = budget / travelers;
  return destinations
    .filter(
      (d) => (d.costPerPerson ?? d.pricePerPerson ?? 0) <= perPersonBudget,
    )
    .sort(
      (a, b) =>
        (b.costPerPerson ?? b.pricePerPerson ?? 0) -
        (a.costPerPerson ?? a.pricePerPerson ?? 0),
    );
}

export function getRandomDestination(): Destination {
  return destinations[Math.floor(Math.random() * destinations.length)];
}
