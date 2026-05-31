export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  lastLogin: number;
}

export interface Session {
  userId: string;
  userName: string;
  userEmail: string;
  loggedIn: boolean;
}

export interface Destination {
  id: string;
  name: string;
  country?: string;
  region: string;
  type: "indian" | "international";
  image: string;
  description: string;
  pricePerPerson?: number;
  currency?: string;
  season?: string[];
  visaType?: string;
  languages?: string[];
  highlights: string[];
  tags: string[];
  coordinates?: { lat: number; lng: number };
  // legacy alias (kept for backwards compat)
  costPerPerson?: number;
  duration?: number;
}

export interface TourGuide {
  id: string;
  name: string;
  photo: string;
  languages: string[];
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  destinations: string[];
}

export interface TourPackage {
  id: string;
  title: string;
  type: "family" | "couples" | "adventure" | "senior";
  destination: string;
  duration: number;
  pricePerPerson: number;
  includes: string[];
  itinerary: string[];
  highlights: string[];
  image: string;
  rating: number;
  // legacy fields
  name?: string;
  description?: string;
  reviewCount?: number;
}

export interface BookingDetails {
  id: string;
  destination: string;
  travelers: number;
  days: number;
  tourType: string;
  guideId?: string;
  totalCost: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  reference: string;
  paymentRef: string;
  costPerPerson?: number;
  specialRequests?: string;
  surprisePlanCode?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  /** Canister bigint ID returned from createBooking — used for accurate cancellation */
  canisterId?: bigint;
  // legacy aliases
  bookingRef?: string;
  bookingReference?: string;
}

export interface SurprisePlan {
  code: string;
  destination: string;
  occasion: string;
  description: string;
  cost: number;
  decorations: string[];
  days: number;
  itinerary: string[];
  // legacy alias
  bookingCode?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category: string;
}

export interface ChatMessage {
  id: string;
  room: string;
  sender: string;
  avatar: string;
  message: string;
  timestamp: string;
  isSelf?: boolean;
}

export interface FavoriteTrip {
  id: string;
  /** Unique plan identifier used to prevent duplicate favorites */
  planId: string;
  destination: string;
  planName?: string;
  savedAt: string;
  image?: string;
  description?: string;
  pricePerPerson?: number;
  days?: number;
  travelers?: number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // vs INR
}

export interface EmergencyContact {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  embassy: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerInitials: string;
  date: string;
  rating: number;
  text: string;
}

export interface FlightSelectionData {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration?: string;
  departureDate?: string;
  /** Legacy single-seat field — kept for backward compatibility */
  seatNumber?: string;
  /** Multi-seat array — one entry per traveler */
  seatNumbers?: string[];
  seatPosition?: string;
  seatClass: string;
  pricePerPerson: number;
  totalPrice: number;
}
