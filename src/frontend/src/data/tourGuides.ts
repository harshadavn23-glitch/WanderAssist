import type { TourGuide } from "@/types/travel";

export const tourGuides: TourGuide[] = [
  {
    id: "tg-001",
    name: "Arjun Sharma",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    languages: ["Hindi", "English", "Punjabi"],
    specialty: "Himalayan Trek & Adventure",
    rating: 4.9,
    reviews: 312,
    experience: 12,
    destinations: ["Manali", "Ladakh", "Rishikesh"],
  },
  {
    id: "tg-002",
    name: "Priya Nair",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    languages: ["Malayalam", "Tamil", "English"],
    specialty: "Culture & Backwaters",
    rating: 4.8,
    reviews: 278,
    experience: 9,
    destinations: ["Kerala", "Pondicherry", "Chennai"],
  },
  {
    id: "tg-003",
    name: "Raj Patel",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    languages: ["Gujarati", "Hindi", "English"],
    specialty: "Heritage & Royal Tours",
    rating: 4.7,
    reviews: 195,
    experience: 8,
    destinations: ["Jaipur", "Delhi", "Mumbai"],
  },
  {
    id: "tg-004",
    name: "Maya Krishnan",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    languages: ["English", "Japanese", "French"],
    specialty: "Luxury International Tours",
    rating: 4.9,
    reviews: 421,
    experience: 15,
    destinations: ["Bali", "Tokyo", "Singapore", "Paris"],
  },
  {
    id: "tg-005",
    name: "Ahmed Al-Rashid",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    languages: ["Arabic", "English", "Urdu"],
    specialty: "Desert Safari & Middle East",
    rating: 4.8,
    reviews: 256,
    experience: 11,
    destinations: ["Dubai", "Maldives"],
  },
  {
    id: "tg-006",
    name: "Sarah Thompson",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    languages: ["English", "Spanish", "Portuguese"],
    specialty: "European City & Art History",
    rating: 4.7,
    reviews: 334,
    experience: 10,
    destinations: ["Paris", "London", "New York"],
  },
  {
    id: "tg-007",
    name: "Vikram Reddy",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    languages: ["Telugu", "Hindi", "English"],
    specialty: "Wildlife & Photography Tours",
    rating: 4.8,
    reviews: 189,
    experience: 7,
    destinations: ["Kerala", "Ladakh", "Bangalore"],
  },
  {
    id: "tg-008",
    name: "Meera Iyer",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    languages: ["Tamil", "Kannada", "English", "French"],
    specialty: "Food & Wine Experiences",
    rating: 4.9,
    reviews: 367,
    experience: 13,
    destinations: ["Goa", "Mumbai", "Singapore", "Paris"],
  },
];

export function getTourGuideById(id: string): TourGuide | undefined {
  return tourGuides.find((g) => g.id === id);
}

export function getGuidesByDestination(destination: string): TourGuide[] {
  return tourGuides.filter((g) =>
    g.destinations.some((d) =>
      d.toLowerCase().includes(destination.toLowerCase()),
    ),
  );
}
