// HotelSelection.tsx — /hotel-selection
// Appears between FlightSelection and TravelPlanBooking in the booking flow.
// Reads plan state from localStorage, shows hotel grid with room selection,
// saves choice to localStorage as 'hotelSelection' then navigates to /travel-plans/book.

import { ImageWithFallback } from "@/components/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bed,
  CheckCircle2,
  Coffee,
  MapPin,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface RoomType {
  id: string;
  type: "Standard" | "Deluxe" | "Suite";
  bedType: "Single" | "Double" | "King";
  maxOccupancy: number;
  pricePerNight: number;
  amenities: string[];
  image: string;
}

interface Hotel {
  id: string;
  name: string;
  starRating: 3 | 4 | 5;
  location: string;
  description: string;
  priceFrom: number;
  image: string;
  rooms: RoomType[];
}

interface HotelSelection {
  hotelName: string;
  starRating: number;
  location: string;
  roomType: string;
  bedType: string;
  pricePerNight: number;
  totalCost: number;
  amenities: string[];
}

// ── Hotel Data per destination ─────────────────────────────────────────────
const HOTEL_DATA: Record<string, Hotel[]> = {
  default: [
    {
      id: "h1",
      name: "Grand Horizon Hotel",
      starRating: 5,
      location: "City Center",
      description:
        "Luxury 5-star property with panoramic city views, rooftop pool, and world-class dining.",
      priceFrom: 8500,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      rooms: [
        {
          id: "r1-1",
          type: "Standard",
          bedType: "Double",
          maxOccupancy: 2,
          pricePerNight: 8500,
          amenities: ["Free WiFi", "Air Conditioning", "Daily Breakfast"],
          image:
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
        },
        {
          id: "r1-2",
          type: "Deluxe",
          bedType: "King",
          maxOccupancy: 3,
          pricePerNight: 12000,
          amenities: [
            "Free WiFi",
            "Air Conditioning",
            "Breakfast + Dinner",
            "City View",
          ],
          image:
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80",
        },
        {
          id: "r1-3",
          type: "Suite",
          bedType: "King",
          maxOccupancy: 4,
          pricePerNight: 22000,
          amenities: [
            "Free WiFi",
            "Private Balcony",
            "All Meals Included",
            "Butler Service",
          ],
          image:
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80",
        },
      ],
    },
    {
      id: "h2",
      name: "The Seaside Retreat",
      starRating: 4,
      location: "Near Beach",
      description:
        "Elegant beachfront resort with private beach access, spa, and multiple dining options.",
      priceFrom: 5200,
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
      rooms: [
        {
          id: "r2-1",
          type: "Standard",
          bedType: "Double",
          maxOccupancy: 2,
          pricePerNight: 5200,
          amenities: ["Free WiFi", "Air Conditioning", "Breakfast Included"],
          image:
            "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&q=80",
        },
        {
          id: "r2-2",
          type: "Deluxe",
          bedType: "King",
          maxOccupancy: 3,
          pricePerNight: 7800,
          amenities: [
            "Free WiFi",
            "Sea View",
            "Breakfast Included",
            "Mini Bar",
          ],
          image:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
        },
        {
          id: "r2-3",
          type: "Suite",
          bedType: "King",
          maxOccupancy: 4,
          pricePerNight: 14500,
          amenities: [
            "Free WiFi",
            "Private Pool",
            "All Meals",
            "Airport Transfer",
          ],
          image:
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
        },
      ],
    },
    {
      id: "h3",
      name: "Heritage Palace Inn",
      starRating: 4,
      location: "Old Town",
      description:
        "Boutique heritage hotel in a restored palace with cultural ambience and heritage walks.",
      priceFrom: 4200,
      image:
        "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&q=80",
      rooms: [
        {
          id: "r3-1",
          type: "Standard",
          bedType: "Double",
          maxOccupancy: 2,
          pricePerNight: 4200,
          amenities: ["Free WiFi", "Air Conditioning", "Continental Breakfast"],
          image:
            "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=400&q=80",
        },
        {
          id: "r3-2",
          type: "Deluxe",
          bedType: "King",
          maxOccupancy: 3,
          pricePerNight: 6500,
          amenities: [
            "Free WiFi",
            "Heritage View",
            "Breakfast Included",
            "Guided Tour",
          ],
          image:
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80",
        },
        {
          id: "r3-3",
          type: "Suite",
          bedType: "King",
          maxOccupancy: 4,
          pricePerNight: 11000,
          amenities: [
            "Free WiFi",
            "Royal Suite",
            "All Meals",
            "Personal Butler",
          ],
          image:
            "https://images.unsplash.com/photo-1552566969-c7c05c5f1c3b?w=400&q=80",
        },
      ],
    },
    {
      id: "h4",
      name: "Urban Nest Boutique",
      starRating: 3,
      location: "Business District",
      description:
        "Modern boutique hotel with stylish rooms, co-working spaces, and gourmet café.",
      priceFrom: 2800,
      image:
        "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80",
      rooms: [
        {
          id: "r4-1",
          type: "Standard",
          bedType: "Single",
          maxOccupancy: 1,
          pricePerNight: 2800,
          amenities: ["Free WiFi", "Air Conditioning", "Coffee Maker"],
          image:
            "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80",
        },
        {
          id: "r4-2",
          type: "Deluxe",
          bedType: "Double",
          maxOccupancy: 2,
          pricePerNight: 4500,
          amenities: [
            "Free WiFi",
            "City View",
            "Breakfast Included",
            "Work Desk",
          ],
          image:
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80",
        },
        {
          id: "r4-3",
          type: "Suite",
          bedType: "King",
          maxOccupancy: 3,
          pricePerNight: 8200,
          amenities: [
            "Free WiFi",
            "Lounge Access",
            "All Day Dining",
            "Concierge",
          ],
          image:
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80",
        },
      ],
    },
    {
      id: "h5",
      name: "Mountain View Resort",
      starRating: 5,
      location: "Hilltop",
      description:
        "Exclusive hillside resort offering breathtaking mountain vistas, trekking, and spa facilities.",
      priceFrom: 9800,
      image:
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
      rooms: [
        {
          id: "r5-1",
          type: "Standard",
          bedType: "Double",
          maxOccupancy: 2,
          pricePerNight: 9800,
          amenities: ["Free WiFi", "Mountain View", "Breakfast Included"],
          image:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
        },
        {
          id: "r5-2",
          type: "Deluxe",
          bedType: "King",
          maxOccupancy: 3,
          pricePerNight: 15000,
          amenities: [
            "Free WiFi",
            "Panoramic View",
            "Breakfast + Dinner",
            "Spa Access",
          ],
          image:
            "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&q=80",
        },
        {
          id: "r5-3",
          type: "Suite",
          bedType: "King",
          maxOccupancy: 4,
          pricePerNight: 28000,
          amenities: [
            "Free WiFi",
            "Private Infinity Pool",
            "All Inclusive",
            "Helipad Transfer",
          ],
          image:
            "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=400&q=80",
        },
      ],
    },
  ],
};

function getHotels(_destination: string): Hotel[] {
  return HOTEL_DATA.default;
}

const STAR_KEYS = ["star-1", "star-2", "star-3", "star-4", "star-5"] as const;

// ── Star Rating ────────────────────────────────────────────────────────────
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {STAR_KEYS.map((key, i) => (
        <Star
          key={key}
          className={`w-3.5 h-3.5 ${i < count ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// ── Room Type Icon ─────────────────────────────────────────────────────────
function AmenityIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5 shrink-0" />;
  if (
    lower.includes("breakfast") ||
    lower.includes("meal") ||
    lower.includes("dining")
  )
    return <Coffee className="w-3.5 h-3.5 shrink-0" />;
  if (lower.includes("bed") || lower.includes("suite"))
    return <Bed className="w-3.5 h-3.5 shrink-0" />;
  return <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />;
}

// ── Room Card ──────────────────────────────────────────────────────────────
function RoomCard({
  room,
  selected,
  nights,
  onSelect,
  idx,
}: {
  room: RoomType;
  selected: boolean;
  nights: number;
  onSelect: () => void;
  idx: number;
}) {
  const total = room.pricePerNight * nights;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? "border-primary shadow-md bg-primary/5"
          : "border-border bg-card hover:border-primary/40"
      }`}
      data-ocid={`room-card.item.${idx + 1}`}
      aria-pressed={selected}
    >
      <div className="relative h-32 overflow-hidden">
        <ImageWithFallback
          src={room.image}
          alt={`${room.type} room`}
          fallbackLabel={`${room.type} Room`}
          className="w-full h-full object-cover"
        />
        {selected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 text-xs font-bold ${
            room.type === "Suite"
              ? "bg-accent text-accent-foreground"
              : room.type === "Deluxe"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
          }`}
        >
          {room.type}
        </Badge>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm text-foreground">
              {room.type} Room
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Bed className="w-3 h-3" /> {room.bedType} Bed ·{" "}
              <Users className="w-3 h-3" /> Max {room.maxOccupancy}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-primary text-sm">
              ₹{room.pricePerNight.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">/ night</p>
          </div>
        </div>
        <Separator />
        <ul className="space-y-1">
          {room.amenities.map((a) => (
            <li
              key={a}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <AmenityIcon label={a} />
              {a}
            </li>
          ))}
        </ul>
        {selected && nights > 0 && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 mt-1">
            <p className="text-xs font-semibold text-primary">
              Total for {nights} night{nights !== 1 ? "s" : ""}: ₹
              {total.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Hotel Card ─────────────────────────────────────────────────────────────
function HotelCard({
  hotel,
  isExpanded,
  nights,
  selectedRoomId,
  onExpand,
  onSelectRoom,
  hotelIdx,
}: {
  hotel: Hotel;
  isExpanded: boolean;
  nights: number;
  selectedRoomId: string | null;
  onExpand: () => void;
  onSelectRoom: (roomId: string) => void;
  hotelIdx: number;
}) {
  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        isExpanded
          ? "border-primary shadow-elevated"
          : "border-border shadow-sm hover:border-primary/40 hover:shadow-md"
      }`}
      data-ocid={`hotel-card.item.${hotelIdx + 1}`}
    >
      {/* Hotel header — clickable */}
      <button
        type="button"
        className="w-full text-left"
        onClick={onExpand}
        aria-expanded={isExpanded}
        data-ocid={`hotel-expand.${hotelIdx + 1}`}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-52 h-44 sm:h-auto shrink-0 overflow-hidden">
            <ImageWithFallback
              src={hotel.image}
              alt={hotel.name}
              fallbackLabel={hotel.name}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          </div>
          <div className="flex-1 p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-foreground leading-tight">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating count={hotel.starRating} />
                  <span className="text-xs text-muted-foreground">
                    {hotel.starRating}-star hotel
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-bold text-lg text-primary">
                  ₹{hotel.priceFrom.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">/night</p>
              </div>
            </div>

            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
              {hotel.location}
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {hotel.description}
            </p>

            <div className="flex items-center justify-between pt-1">
              <Badge variant="outline" className="text-xs">
                {hotel.rooms.length} room types
              </Badge>
              <span
                className={`text-xs font-semibold transition-colors ${isExpanded ? "text-primary" : "text-muted-foreground"}`}
              >
                {isExpanded ? "▲ Hide rooms" : "▼ View rooms & select"}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Room selection panel */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-4 space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground">
            Choose Your Room Type
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {hotel.rooms.map((room, rIdx) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={selectedRoomId === room.id}
                nights={nights}
                onSelect={() => onSelectRoom(room.id)}
                idx={rIdx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function HotelSelection() {
  const navigate = useNavigate();

  // Read plan state from localStorage
  const planRaw = sessionStorage.getItem("selectedPlan");
  const plan = planRaw
    ? (JSON.parse(planRaw) as {
        name?: string;
        destination?: string;
        days?: number;
        travelers?: number;
      })
    : {
        name: "Travel Plan",
        destination: "Destination",
        days: 5,
        travelers: 2,
      };

  const destination = plan.destination ?? "Destination";
  const days = plan.days ?? 5;
  const nights = Math.max(1, days - 1);
  const travelers = plan.travelers ?? 2;

  // Flight selection from localStorage
  const flightRaw = localStorage.getItem("flightSelection");
  const flightData = flightRaw ? JSON.parse(flightRaw) : null;

  const hotels = useMemo(() => getHotels(destination), [destination]);

  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  function handleExpandHotel(hotelId: string) {
    setExpandedHotelId((prev) => (prev === hotelId ? null : hotelId));
  }

  function handleSelectRoom(hotel: Hotel, roomId: string) {
    setSelectedRoomId(roomId);
    setSelectedHotelId(hotel.id);
    // Keep the hotel expanded so user sees their selection
    setExpandedHotelId(hotel.id);
  }

  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) ?? null;
  const selectedRoom =
    selectedHotel?.rooms.find((r) => r.id === selectedRoomId) ?? null;
  const totalCost = selectedRoom ? selectedRoom.pricePerNight * nights : 0;

  function handleConfirm() {
    if (!selectedHotel || !selectedRoom) return;
    const selection: HotelSelection = {
      hotelName: selectedHotel.name,
      starRating: selectedHotel.starRating,
      location: selectedHotel.location,
      roomType: selectedRoom.type,
      bedType: selectedRoom.bedType,
      pricePerNight: selectedRoom.pricePerNight,
      totalCost,
      amenities: selectedRoom.amenities,
    };
    localStorage.setItem("hotelSelection", JSON.stringify(selection));
    navigate({ to: "/travel-plans/book" });
  }

  // Check-in / check-out — derive from flight or use today+1
  const today = new Date();
  const checkIn = flightData?.departureDate
    ? flightData.departureDate
    : new Date(today.getTime() + 86400000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  const checkOut = (() => {
    const base = flightData?.departureDate
      ? new Date(flightData.departureDate)
      : new Date(today.getTime() + 86400000);
    base.setDate(base.getDate() + nights);
    return base.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  })();

  const canConfirm = !!selectedHotel && !!selectedRoom;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Page Header */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={() => navigate({ to: "/flight-selection" })}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Back to flight selection"
              data-ocid="hotel-back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl md:text-2xl text-foreground leading-tight">
                Select Your Hotel
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span className="font-medium text-foreground">
                  {destination}
                </span>
                <span>·</span>
                <span>Check-in: {checkIn}</span>
                <span>·</span>
                <span>Check-out: {checkOut}</span>
                <span>·</span>
                <span>
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>

          {/* Breadcrumb progress */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground overflow-x-auto pb-1">
            <span className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
              ✓ Plan Selected
            </span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
              ✓ Flight Selected
            </span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-primary font-bold whitespace-nowrap">
              → Hotel Selection
            </span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="whitespace-nowrap">Booking</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Info strip */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {travelers} traveler{travelers !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Bed className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {nights} night{nights !== 1 ? "s" : ""}
            </span>
          </div>
          {flightData && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700/40 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400 text-xs font-medium">
                Flight: {flightData.airline ?? "Selected"} —{" "}
                {flightData.flightNumber ?? ""}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Click a hotel card to expand and choose your preferred room type.
        </p>

        {/* Hotel grid */}
        <div className="space-y-4" data-ocid="hotel-list">
          {hotels.map((hotel, idx) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isExpanded={expandedHotelId === hotel.id}
              nights={nights}
              selectedRoomId={
                selectedHotelId === hotel.id ? selectedRoomId : null
              }
              onExpand={() => handleExpandHotel(hotel.id)}
              onSelectRoom={(roomId) => handleSelectRoom(hotel, roomId)}
              hotelIdx={idx}
            />
          ))}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-30 px-4 py-3 safe-area-bottom">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {selectedHotel && selectedRoom ? (
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate text-sm">
                {selectedHotel.name} — {selectedRoom.type} Room
              </p>
              <p className="text-xs text-muted-foreground">
                ₹{selectedRoom.pricePerNight.toLocaleString()}/night × {nights}{" "}
                nights ={" "}
                <span className="font-bold text-primary">
                  ₹{totalCost.toLocaleString()}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a hotel and room to continue
            </p>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/flight-selection" })}
              data-ocid="hotel-back-footer-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="bg-primary text-primary-foreground font-bold gap-2 min-w-[140px]"
              data-ocid="hotel-confirm-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Hotel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need ChevronRight locally
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Next</title>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
