// FlightSelection.tsx — /flight-selection
// Step inserted between TravelPlanDetail and HotelSelection in the booking flow.
// Reads plan state from sessionStorage ("selectedPlan") or localStorage ("travelPlanState").
// Saves selection to localStorage + sessionStorage key "flightSelection".

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Plane,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Flight {
  id: string;
  airline: string;
  logo: string;
  flightNumber: string;
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  economyPrice: number;
  businessPrice: number;
}

interface SeatInfo {
  id: string;
  label: string;
  position: "Window" | "Middle" | "Aisle";
  taken: boolean;
}

type SeatClass = "Economy" | "Business";

// Departure city options
const DEPARTURE_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Goa",
  "Jaipur",
];

// ── Mock flight data keyed by (destination, departureCity) ─────────────────────
function getMockFlights(destination: string, fromCity: string): Flight[] {
  const dest = destination.split(",")[0].trim();
  const from = fromCity.trim();

  const flightMap: Record<string, Flight[]> = {
    Goa: [
      {
        id: "f1",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-312",
        departureCity: "Mumbai",
        destinationCity: "Goa",
        departureTime: "06:15",
        arrivalTime: "07:30",
        duration: "1h 15m",
        economyPrice: 3200,
        businessPrice: 8900,
      },
      {
        id: "f2",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-831",
        departureCity: "Delhi",
        destinationCity: "Goa",
        departureTime: "09:45",
        arrivalTime: "12:10",
        duration: "2h 25m",
        economyPrice: 4800,
        businessPrice: 12500,
      },
      {
        id: "f3",
        airline: "SpiceJet",
        logo: "SG",
        flightNumber: "SG-143",
        departureCity: "Bangalore",
        destinationCity: "Goa",
        departureTime: "14:20",
        arrivalTime: "15:15",
        duration: "55m",
        economyPrice: 2900,
        businessPrice: 7800,
      },
      {
        id: "f4",
        airline: "Vistara",
        logo: "UK",
        flightNumber: "UK-880",
        departureCity: "Mumbai",
        destinationCity: "Goa",
        departureTime: "18:00",
        arrivalTime: "19:15",
        duration: "1h 15m",
        economyPrice: 4200,
        businessPrice: 11000,
      },
      {
        id: "f5",
        airline: "SpiceJet",
        logo: "SG",
        flightNumber: "SG-722",
        departureCity: "Chennai",
        destinationCity: "Goa",
        departureTime: "10:30",
        arrivalTime: "12:00",
        duration: "1h 30m",
        economyPrice: 3100,
        businessPrice: 8200,
      },
      {
        id: "f6",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-901",
        departureCity: "Hyderabad",
        destinationCity: "Goa",
        departureTime: "12:45",
        arrivalTime: "14:15",
        duration: "1h 30m",
        economyPrice: 3400,
        businessPrice: 9000,
      },
      {
        id: "f7",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-452",
        departureCity: "Kolkata",
        destinationCity: "Goa",
        departureTime: "07:20",
        arrivalTime: "10:40",
        duration: "3h 20m",
        economyPrice: 5200,
        businessPrice: 14000,
      },
      {
        id: "f8",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-741",
        departureCity: "Pune",
        destinationCity: "Goa",
        departureTime: "08:00",
        arrivalTime: "09:05",
        duration: "1h 05m",
        economyPrice: 2600,
        businessPrice: 7200,
      },
    ],
    Bali: [
      {
        id: "f1",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-368",
        departureCity: "Delhi",
        destinationCity: "Denpasar",
        departureTime: "01:30",
        arrivalTime: "13:45",
        duration: "8h 15m",
        economyPrice: 28000,
        businessPrice: 72000,
      },
      {
        id: "f2",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1701",
        departureCity: "Mumbai",
        destinationCity: "Denpasar",
        departureTime: "09:10",
        arrivalTime: "18:30",
        duration: "9h 20m",
        economyPrice: 24500,
        businessPrice: 65000,
      },
      {
        id: "f3",
        airline: "Emirates",
        logo: "EK",
        flightNumber: "EK-502",
        departureCity: "Mumbai",
        destinationCity: "Denpasar",
        departureTime: "14:55",
        arrivalTime: "04:25+1",
        duration: "9h 30m",
        economyPrice: 32000,
        businessPrice: 98000,
      },
      {
        id: "f4",
        airline: "Singapore Airlines",
        logo: "SQ",
        flightNumber: "SQ-511",
        departureCity: "Delhi",
        destinationCity: "Denpasar",
        departureTime: "23:20",
        arrivalTime: "12:10+1",
        duration: "8h 50m",
        economyPrice: 35000,
        businessPrice: 105000,
      },
      {
        id: "f5",
        airline: "Vistara",
        logo: "UK",
        flightNumber: "UK-113",
        departureCity: "Mumbai",
        destinationCity: "Denpasar",
        departureTime: "06:45",
        arrivalTime: "16:00",
        duration: "9h 15m",
        economyPrice: 27000,
        businessPrice: 78000,
      },
      {
        id: "f6",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-372",
        departureCity: "Bangalore",
        destinationCity: "Denpasar",
        departureTime: "11:00",
        arrivalTime: "20:30",
        duration: "9h 30m",
        economyPrice: 26000,
        businessPrice: 70000,
      },
      {
        id: "f7",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1820",
        departureCity: "Chennai",
        destinationCity: "Denpasar",
        departureTime: "08:45",
        arrivalTime: "18:15",
        duration: "9h 30m",
        economyPrice: 25000,
        businessPrice: 68000,
      },
    ],
    Paris: [
      {
        id: "f1",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-142",
        departureCity: "Delhi",
        destinationCity: "Paris CDG",
        departureTime: "02:45",
        arrivalTime: "07:30",
        duration: "8h 45m",
        economyPrice: 45000,
        businessPrice: 145000,
      },
      {
        id: "f2",
        airline: "Emirates",
        logo: "EK",
        flightNumber: "EK-196",
        departureCity: "Mumbai",
        destinationCity: "Paris CDG",
        departureTime: "09:30",
        arrivalTime: "14:20",
        duration: "9h 50m",
        economyPrice: 52000,
        businessPrice: 165000,
      },
      {
        id: "f3",
        airline: "Lufthansa",
        logo: "LH",
        flightNumber: "LH-760",
        departureCity: "Delhi",
        destinationCity: "Paris CDG",
        departureTime: "14:10",
        arrivalTime: "18:55",
        duration: "8h 45m",
        economyPrice: 49000,
        businessPrice: 158000,
      },
      {
        id: "f4",
        airline: "Air France",
        logo: "AF",
        flightNumber: "AF-226",
        departureCity: "Delhi",
        destinationCity: "Paris CDG",
        departureTime: "20:15",
        arrivalTime: "01:30+1",
        duration: "9h 15m",
        economyPrice: 47000,
        businessPrice: 152000,
      },
      {
        id: "f5",
        airline: "Air France",
        logo: "AF",
        flightNumber: "AF-229",
        departureCity: "Mumbai",
        destinationCity: "Paris CDG",
        departureTime: "15:00",
        arrivalTime: "21:30",
        duration: "10h 30m",
        economyPrice: 54000,
        businessPrice: 170000,
      },
      {
        id: "f6",
        airline: "Lufthansa",
        logo: "LH",
        flightNumber: "LH-764",
        departureCity: "Bangalore",
        destinationCity: "Paris CDG",
        departureTime: "22:10",
        arrivalTime: "07:30+1",
        duration: "10h 20m",
        economyPrice: 51000,
        businessPrice: 162000,
      },
    ],
    Dubai: [
      {
        id: "f1",
        airline: "Emirates",
        logo: "EK",
        flightNumber: "EK-502",
        departureCity: "Mumbai",
        destinationCity: "Dubai",
        departureTime: "06:30",
        arrivalTime: "08:40",
        duration: "3h 10m",
        economyPrice: 14000,
        businessPrice: 48000,
      },
      {
        id: "f2",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1406",
        departureCity: "Delhi",
        destinationCity: "Dubai",
        departureTime: "10:45",
        arrivalTime: "13:00",
        duration: "3h 15m",
        economyPrice: 10500,
        businessPrice: 32000,
      },
      {
        id: "f3",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-995",
        departureCity: "Delhi",
        destinationCity: "Dubai",
        departureTime: "15:30",
        arrivalTime: "17:45",
        duration: "3h 15m",
        economyPrice: 12000,
        businessPrice: 38000,
      },
      {
        id: "f4",
        airline: "SpiceJet",
        logo: "SG",
        flightNumber: "SG-7451",
        departureCity: "Mumbai",
        destinationCity: "Dubai",
        departureTime: "20:15",
        arrivalTime: "22:20",
        duration: "3h 05m",
        economyPrice: 9800,
        businessPrice: 28000,
      },
      {
        id: "f5",
        airline: "Emirates",
        logo: "EK",
        flightNumber: "EK-514",
        departureCity: "Bangalore",
        destinationCity: "Dubai",
        departureTime: "08:00",
        arrivalTime: "10:05",
        duration: "3h 05m",
        economyPrice: 13500,
        businessPrice: 46000,
      },
      {
        id: "f6",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-983",
        departureCity: "Chennai",
        destinationCity: "Dubai",
        departureTime: "14:00",
        arrivalTime: "16:15",
        duration: "3h 15m",
        economyPrice: 11500,
        businessPrice: 36000,
      },
      {
        id: "f7",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1505",
        departureCity: "Hyderabad",
        destinationCity: "Dubai",
        departureTime: "09:30",
        arrivalTime: "11:30",
        duration: "3h 00m",
        economyPrice: 11000,
        businessPrice: 34000,
      },
      {
        id: "f8",
        airline: "SpiceJet",
        logo: "SG",
        flightNumber: "SG-7452",
        departureCity: "Kolkata",
        destinationCity: "Dubai",
        departureTime: "22:00",
        arrivalTime: "01:00+1",
        duration: "5h 00m",
        economyPrice: 12000,
        businessPrice: 38000,
      },
    ],
    Tokyo: [
      {
        id: "f1",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-307",
        departureCity: "Delhi",
        destinationCity: "Tokyo Narita",
        departureTime: "01:20",
        arrivalTime: "14:10",
        duration: "8h 50m",
        economyPrice: 42000,
        businessPrice: 135000,
      },
      {
        id: "f2",
        airline: "Japan Airlines",
        logo: "JL",
        flightNumber: "JL-798",
        departureCity: "Delhi",
        destinationCity: "Tokyo Haneda",
        departureTime: "09:55",
        arrivalTime: "22:10",
        duration: "8h 15m",
        economyPrice: 55000,
        businessPrice: 175000,
      },
      {
        id: "f3",
        airline: "Singapore Airlines",
        logo: "SQ",
        flightNumber: "SQ-425",
        departureCity: "Mumbai",
        destinationCity: "Tokyo Narita",
        departureTime: "14:30",
        arrivalTime: "04:50+1",
        duration: "9h 20m",
        economyPrice: 49000,
        businessPrice: 162000,
      },
      {
        id: "f4",
        airline: "Vistara",
        logo: "UK",
        flightNumber: "UK-015",
        departureCity: "Delhi",
        destinationCity: "Tokyo Narita",
        departureTime: "22:50",
        arrivalTime: "11:40+1",
        duration: "8h 50m",
        economyPrice: 44000,
        businessPrice: 140000,
      },
      {
        id: "f5",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-309",
        departureCity: "Mumbai",
        destinationCity: "Tokyo Narita",
        departureTime: "07:30",
        arrivalTime: "20:00",
        duration: "8h 30m",
        economyPrice: 47000,
        businessPrice: 152000,
      },
      {
        id: "f6",
        airline: "Singapore Airlines",
        logo: "SQ",
        flightNumber: "SQ-427",
        departureCity: "Chennai",
        destinationCity: "Tokyo Narita",
        departureTime: "18:00",
        arrivalTime: "08:30+1",
        duration: "10h 30m",
        economyPrice: 45000,
        businessPrice: 148000,
      },
    ],
    Manali: [
      {
        id: "f1",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-2341",
        departureCity: "Delhi",
        destinationCity: "Kullu Manali",
        departureTime: "07:00",
        arrivalTime: "08:05",
        duration: "1h 05m",
        economyPrice: 5500,
        businessPrice: 14000,
      },
      {
        id: "f2",
        airline: "SpiceJet",
        logo: "SG",
        flightNumber: "SG-212",
        departureCity: "Delhi",
        destinationCity: "Kullu Manali",
        departureTime: "12:30",
        arrivalTime: "13:40",
        duration: "1h 10m",
        economyPrice: 4800,
        businessPrice: 12000,
      },
      {
        id: "f3",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-446",
        departureCity: "Mumbai",
        destinationCity: "Kullu Manali",
        departureTime: "09:15",
        arrivalTime: "11:20",
        duration: "2h 05m",
        economyPrice: 7200,
        businessPrice: 18500,
      },
      {
        id: "f4",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-2355",
        departureCity: "Bangalore",
        destinationCity: "Kullu Manali",
        departureTime: "06:00",
        arrivalTime: "09:30",
        duration: "3h 30m",
        economyPrice: 8500,
        businessPrice: 22000,
      },
    ],
    Kerala: [
      {
        id: "f1",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-455",
        departureCity: "Mumbai",
        destinationCity: "Kochi",
        departureTime: "07:30",
        arrivalTime: "09:25",
        duration: "1h 55m",
        economyPrice: 4200,
        businessPrice: 11000,
      },
      {
        id: "f2",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-542",
        departureCity: "Delhi",
        destinationCity: "Trivandrum",
        departureTime: "11:10",
        arrivalTime: "14:00",
        duration: "2h 50m",
        economyPrice: 5800,
        businessPrice: 15500,
      },
      {
        id: "f3",
        airline: "Vistara",
        logo: "UK",
        flightNumber: "UK-733",
        departureCity: "Mumbai",
        destinationCity: "Kochi",
        departureTime: "16:40",
        arrivalTime: "18:30",
        duration: "1h 50m",
        economyPrice: 4900,
        businessPrice: 13000,
      },
      {
        id: "f4",
        airline: "SpiceJet",
        logo: "SG",
        flightNumber: "SG-688",
        departureCity: "Bangalore",
        destinationCity: "Kochi",
        departureTime: "20:00",
        arrivalTime: "21:15",
        duration: "1h 15m",
        economyPrice: 2800,
        businessPrice: 8000,
      },
      {
        id: "f5",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-470",
        departureCity: "Chennai",
        destinationCity: "Kochi",
        departureTime: "08:00",
        arrivalTime: "09:10",
        duration: "1h 10m",
        economyPrice: 2500,
        businessPrice: 7000,
      },
      {
        id: "f6",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-560",
        departureCity: "Hyderabad",
        destinationCity: "Kochi",
        departureTime: "10:30",
        arrivalTime: "12:00",
        duration: "1h 30m",
        economyPrice: 3200,
        businessPrice: 8800,
      },
      {
        id: "f7",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-455",
        departureCity: "Kolkata",
        destinationCity: "Kochi",
        departureTime: "07:00",
        arrivalTime: "09:30",
        duration: "2h 30m",
        economyPrice: 4800,
        businessPrice: 13000,
      },
    ],
    Ladakh: [
      {
        id: "f1",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-2201",
        departureCity: "Delhi",
        destinationCity: "Leh",
        departureTime: "06:00",
        arrivalTime: "07:55",
        duration: "1h 55m",
        economyPrice: 6800,
        businessPrice: 18000,
      },
      {
        id: "f2",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-445",
        departureCity: "Delhi",
        destinationCity: "Leh",
        departureTime: "08:30",
        arrivalTime: "10:25",
        duration: "1h 55m",
        economyPrice: 7500,
        businessPrice: 20000,
      },
      {
        id: "f3",
        airline: "Vistara",
        logo: "UK",
        flightNumber: "UK-615",
        departureCity: "Delhi",
        destinationCity: "Leh",
        departureTime: "14:15",
        arrivalTime: "16:10",
        duration: "1h 55m",
        economyPrice: 8200,
        businessPrice: 22000,
      },
      {
        id: "f4",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-449",
        departureCity: "Mumbai",
        destinationCity: "Leh",
        departureTime: "07:45",
        arrivalTime: "11:00",
        duration: "3h 15m",
        economyPrice: 9500,
        businessPrice: 25000,
      },
    ],
    Singapore: [
      {
        id: "f1",
        airline: "Singapore Airlines",
        logo: "SQ",
        flightNumber: "SQ-408",
        departureCity: "Mumbai",
        destinationCity: "Singapore",
        departureTime: "08:20",
        arrivalTime: "18:55",
        duration: "5h 35m",
        economyPrice: 22000,
        businessPrice: 75000,
      },
      {
        id: "f2",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1001",
        departureCity: "Delhi",
        destinationCity: "Singapore",
        departureTime: "11:35",
        arrivalTime: "22:40",
        duration: "5h 05m",
        economyPrice: 18500,
        businessPrice: 60000,
      },
      {
        id: "f3",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-381",
        departureCity: "Chennai",
        destinationCity: "Singapore",
        departureTime: "15:10",
        arrivalTime: "22:30",
        duration: "3h 20m",
        economyPrice: 16000,
        businessPrice: 54000,
      },
      {
        id: "f4",
        airline: "Singapore Airlines",
        logo: "SQ",
        flightNumber: "SQ-412",
        departureCity: "Bangalore",
        destinationCity: "Singapore",
        departureTime: "10:00",
        arrivalTime: "17:40",
        duration: "4h 40m",
        economyPrice: 19500,
        businessPrice: 64000,
      },
      {
        id: "f5",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1003",
        departureCity: "Hyderabad",
        destinationCity: "Singapore",
        departureTime: "09:00",
        arrivalTime: "16:30",
        duration: "4h 30m",
        economyPrice: 18000,
        businessPrice: 58000,
      },
    ],
    Maldives: [
      {
        id: "f1",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1311",
        departureCity: "Mumbai",
        destinationCity: "Malé",
        departureTime: "09:00",
        arrivalTime: "11:45",
        duration: "2h 45m",
        economyPrice: 15000,
        businessPrice: 45000,
      },
      {
        id: "f2",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-202",
        departureCity: "Delhi",
        destinationCity: "Malé",
        departureTime: "13:20",
        arrivalTime: "18:30",
        duration: "5h 10m",
        economyPrice: 19000,
        businessPrice: 58000,
      },
      {
        id: "f3",
        airline: "Emirates",
        logo: "EK",
        flightNumber: "EK-387",
        departureCity: "Mumbai",
        destinationCity: "Malé",
        departureTime: "18:40",
        arrivalTime: "21:30",
        duration: "2h 50m",
        economyPrice: 18000,
        businessPrice: 62000,
      },
      {
        id: "f4",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-206",
        departureCity: "Bangalore",
        destinationCity: "Malé",
        departureTime: "10:30",
        arrivalTime: "13:00",
        duration: "2h 30m",
        economyPrice: 14500,
        businessPrice: 43000,
      },
      {
        id: "f5",
        airline: "IndiGo",
        logo: "6E",
        flightNumber: "6E-1315",
        departureCity: "Chennai",
        destinationCity: "Malé",
        departureTime: "07:15",
        arrivalTime: "09:30",
        duration: "2h 15m",
        economyPrice: 12000,
        businessPrice: 38000,
      },
    ],
    "New York": [
      {
        id: "f1",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-101",
        departureCity: "Delhi",
        destinationCity: "New York JFK",
        departureTime: "02:00",
        arrivalTime: "08:30",
        duration: "14h 30m",
        economyPrice: 65000,
        businessPrice: 210000,
      },
      {
        id: "f2",
        airline: "United Airlines",
        logo: "UA",
        flightNumber: "UA-83",
        departureCity: "Mumbai",
        destinationCity: "New York EWR",
        departureTime: "22:00",
        arrivalTime: "04:30+1",
        duration: "16h 30m",
        economyPrice: 72000,
        businessPrice: 235000,
      },
    ],
    London: [
      {
        id: "f1",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-111",
        departureCity: "Delhi",
        destinationCity: "London Heathrow",
        departureTime: "01:30",
        arrivalTime: "06:45",
        duration: "9h 15m",
        economyPrice: 55000,
        businessPrice: 175000,
      },
      {
        id: "f2",
        airline: "British Airways",
        logo: "BA",
        flightNumber: "BA-141",
        departureCity: "Mumbai",
        destinationCity: "London Heathrow",
        departureTime: "14:15",
        arrivalTime: "20:00",
        duration: "9h 45m",
        economyPrice: 58000,
        businessPrice: 185000,
      },
      {
        id: "f3",
        airline: "Air India",
        logo: "AI",
        flightNumber: "AI-115",
        departureCity: "Bangalore",
        destinationCity: "London Heathrow",
        departureTime: "23:00",
        arrivalTime: "05:30+1",
        duration: "10h 30m",
        economyPrice: 57000,
        businessPrice: 182000,
      },
    ],
  };

  const allFlights = flightMap[dest] ?? [
    {
      id: "f1",
      airline: "IndiGo",
      logo: "6E",
      flightNumber: "6E-441",
      departureCity: "Delhi",
      destinationCity: dest,
      departureTime: "07:15",
      arrivalTime: "09:30",
      duration: "2h 15m",
      economyPrice: 5500,
      businessPrice: 15000,
    },
    {
      id: "f2",
      airline: "Air India",
      logo: "AI",
      flightNumber: "AI-332",
      departureCity: "Mumbai",
      destinationCity: dest,
      departureTime: "11:00",
      arrivalTime: "13:20",
      duration: "2h 20m",
      economyPrice: 6800,
      businessPrice: 18000,
    },
    {
      id: "f3",
      airline: "SpiceJet",
      logo: "SG",
      flightNumber: "SG-211",
      departureCity: "Bangalore",
      destinationCity: dest,
      departureTime: "15:45",
      arrivalTime: "17:55",
      duration: "2h 10m",
      economyPrice: 4900,
      businessPrice: 13500,
    },
    {
      id: "f4",
      airline: "Vistara",
      logo: "UK",
      flightNumber: "UK-770",
      departureCity: "Delhi",
      destinationCity: dest,
      departureTime: "19:30",
      arrivalTime: "21:45",
      duration: "2h 15m",
      economyPrice: 7200,
      businessPrice: 20000,
    },
  ];

  // Filter by selected departure city
  const filtered = allFlights.filter(
    (f) => f.departureCity.toLowerCase() === from.toLowerCase(),
  );

  // If exact city match found, return those flights
  if (filtered.length > 0) return filtered;

  // Otherwise synthesize flights from the chosen city using the base data
  return allFlights.slice(0, 3).map((f, i) => ({
    ...f,
    id: `${from.slice(0, 3).toLowerCase()}-${i + 1}`,
    flightNumber: `${f.logo}-${String(200 + i * 111).slice(-3)}`,
    departureCity: from,
  }));
}

// ── Seat map generation ─────────────────────────────────────────────────────
// Generates seats row-by-row in strict A B C | gap | D E F order:
//   Left side : A (window) → B (middle) → C (aisle)
//   Right side: D (aisle) → E (middle) → F (window)
function generateSeats(seatClass: SeatClass): SeatInfo[] {
  const rows = seatClass === "Economy" ? 30 : 8;
  const leftCols: Array<{ col: string; pos: "Window" | "Middle" | "Aisle" }> = [
    { col: "A", pos: "Window" },
    { col: "B", pos: "Middle" },
    { col: "C", pos: "Aisle" },
  ];
  const rightCols: Array<{ col: string; pos: "Window" | "Middle" | "Aisle" }> =
    [
      { col: "D", pos: "Aisle" },
      { col: "E", pos: "Middle" },
      { col: "F", pos: "Window" },
    ];

  const takenSeats = new Set(
    seatClass === "Economy"
      ? [
          "1A",
          "1C",
          "2B",
          "2E",
          "3A",
          "3F",
          "4D",
          "5B",
          "5E",
          "6C",
          "7A",
          "8D",
          "9B",
          "10F",
          "11C",
          "12E",
          "14A",
          "15D",
          "18B",
          "20F",
          "22A",
          "25C",
          "27E",
          "29D",
        ]
      : ["1A", "1D", "2B", "3A", "4D", "5F", "6C"],
  );

  const seats: SeatInfo[] = [];
  // Always iterate: A, B, C, D, E, F — in this exact order per row
  for (let r = 1; r <= rows; r++) {
    for (const { col, pos } of leftCols) {
      const id = `${r}${col}`;
      seats.push({ id, label: id, position: pos, taken: takenSeats.has(id) });
    }
    for (const { col, pos } of rightCols) {
      const id = `${r}${col}`;
      seats.push({ id, label: id, position: pos, taken: takenSeats.has(id) });
    }
  }
  return seats;
}

// ── Airline logo badge ────────────────────────────────────────────────────
function AirlineBadge({ code }: { code: string }) {
  const colors: Record<string, string> = {
    "6E": "bg-indigo-600",
    AI: "bg-orange-600",
    EK: "bg-red-700",
    SG: "bg-yellow-600",
    UK: "bg-purple-600",
    LH: "bg-yellow-500",
    AF: "bg-blue-700",
    JL: "bg-red-600",
    SQ: "bg-yellow-600",
    BA: "bg-blue-800",
    UA: "bg-blue-600",
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-xs font-bold ${
        colors[code] ?? "bg-muted-foreground"
      }`}
    >
      {code}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────────
export default function FlightSelection() {
  const navigate = useNavigate();

  // ── Read plan state ────────────────────────────────────────────────────────────
  const planData = useMemo(() => {
    const raw =
      sessionStorage.getItem("selectedPlan") ??
      localStorage.getItem("travelPlanState");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        destination?: string;
        travelers?: number;
        days?: number;
        name?: string;
        startDate?: string;
        travelDates?: string;
      };
    } catch {
      return null;
    }
  }, []);

  const destination = planData?.destination ?? "Your Destination";
  const travelers = planData?.travelers ?? 1;

  // Pre-fill departure date from plan's start date when available
  const planStartDate = useMemo(() => {
    if (planData?.startDate) return planData.startDate;
    if (planData?.travelDates) {
      return planData.travelDates.split(" ")[0] ?? "";
    }
    return "";
  }, [planData]);

  // ── State ───────────────────────────────────────────────────────────────
  const [departureDate, setDepartureDate] = useState<string>(planStartDate);
  const [departureCity, setDepartureCity] = useState<string>("Mumbai");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [seatClass, setSeatClass] = useState<SeatClass>("Economy");
  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([]);
  const [maxReachedFlash, setMaxReachedFlash] = useState(false);
  const [dateError, setDateError] = useState("");

  const seats = useMemo(() => generateSeats(seatClass), [seatClass]);

  // Re-derive flights whenever departure city changes
  const flights = useMemo(
    () => getMockFlights(destination, departureCity),
    [destination, departureCity],
  );

  // Reset seats when class changes
  function handleClassChange(cls: SeatClass) {
    setSeatClass(cls);
    setSelectedSeats([]);
  }

  function handleFlightSelect(flight: Flight) {
    setSelectedFlight(flight);
    setSelectedSeats([]);
  }

  // When departure city changes, reset flight selection
  function handleCityChange(city: string) {
    setDepartureCity(city);
    setSelectedFlight(null);
    setSelectedSeats([]);
  }

  function handleSeatClick(seat: SeatInfo) {
    if (seat.taken) return;
    const alreadySelected = selectedSeats.some((s) => s.id === seat.id);
    if (alreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
    } else if (selectedSeats.length >= travelers) {
      setMaxReachedFlash(true);
      setTimeout(() => setMaxReachedFlash(false), 1500);
    } else {
      setSelectedSeats((prev) => [...prev, seat]);
    }
  }

  const pricePerPerson = selectedFlight
    ? seatClass === "Economy"
      ? selectedFlight.economyPrice
      : selectedFlight.businessPrice
    : 0;
  const totalPrice = pricePerPerson * travelers;

  function handleNext() {
    if (!departureDate) {
      setDateError("Please select a departure date.");
      return;
    }
    if (!selectedFlight) return;
    if (selectedSeats.length !== travelers) return;

    const seatLabels = selectedSeats.map((s) => s.label);
    const selection = {
      airline: selectedFlight.airline,
      flightNumber: selectedFlight.flightNumber,
      departure: departureCity,
      arrival: selectedFlight.destinationCity,
      departureTime: selectedFlight.departureTime,
      arrivalTime: selectedFlight.arrivalTime,
      duration: selectedFlight.duration,
      departureDate,
      departureCity,
      // Multi-seat array
      seatNumbers: seatLabels,
      // Backward-compat single seat
      seatNumber: seatLabels[0] ?? "",
      seatPosition: selectedSeats[0]?.position ?? "",
      seatClass,
      pricePerPerson,
      totalPrice,
    };
    localStorage.setItem("flightSelection", JSON.stringify(selection));
    sessionStorage.setItem("flightSelection", JSON.stringify(selection));
    navigate({ to: "/hotel-selection" });
  }

  const canProceed =
    !!departureDate && !!selectedFlight && selectedSeats.length === travelers;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/travel-plans/detail" })}
            data-ocid="flight.back_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              Select Your Flight
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                {departureCity}
              </span>
              <span className="text-muted-foreground/50">→</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {destination.split(",")[0]}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {travelers} traveler{travelers !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            Step 1 of 3
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-1 bg-primary w-1/3 transition-all" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Departure City & Date ──────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Departure Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Departure City */}
              <div>
                <label
                  htmlFor="departure-city"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                    Departure City
                  </span>
                </label>
                <select
                  id="departure-city"
                  value={departureCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="flight.departure_city_select"
                >
                  {DEPARTURE_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departure Date */}
              <div>
                <label
                  htmlFor="departure-date"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Departure Date
                  </span>
                </label>
                <input
                  id="departure-date"
                  type="date"
                  value={departureDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDepartureDate(e.target.value);
                    setDateError("");
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="flight.date_input"
                />
                {dateError && (
                  <p className="text-destructive text-xs mt-1">{dateError}</p>
                )}
              </div>
            </div>

            {/* Dynamic filter hint */}
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 flex-wrap">
              <Plane className="w-3 h-3 shrink-0" />
              Showing flights from{" "}
              <strong className="text-foreground">{departureCity}</strong> →{" "}
              <strong className="text-foreground">
                {destination.split(",")[0]}
              </strong>
              {departureDate && (
                <>
                  {" "}
                  on{" "}
                  <strong className="text-foreground">
                    {new Date(`${departureDate}T00:00:00`).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </strong>
                </>
              )}
              . Change city above to see different flights.
            </p>
          </CardContent>
        </Card>

        {/* ── Flight Cards ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" /> Available Flights —{" "}
            {departureCity} → {destination.split(",")[0]}
          </h2>

          {flights.length === 0 && (
            <div
              className="text-center text-muted-foreground py-10 border rounded-xl bg-card"
              data-ocid="flight.list.empty_state"
            >
              <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">
                No direct flights found from {departureCity}
              </p>
              <p className="text-xs mt-1">
                Try selecting a different departure city above.
              </p>
            </div>
          )}

          <div className="space-y-3" data-ocid="flight.list">
            {flights.map((flight, idx) => {
              const isSelected = selectedFlight?.id === flight.id;
              return (
                <button
                  key={flight.id}
                  type="button"
                  onClick={() => handleFlightSelect(flight)}
                  className={`w-full text-left border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  }`}
                  data-ocid={`flight.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Airline */}
                    <div className="flex items-center gap-3 min-w-0">
                      <AirlineBadge code={flight.logo} />
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {flight.airline}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {flight.flightNumber}
                        </p>
                      </div>
                    </div>

                    {/* Route & Times */}
                    <div className="flex items-center gap-2 text-sm flex-1 justify-center min-w-[200px]">
                      <div className="text-center">
                        <p className="font-bold text-foreground text-base">
                          {flight.departureTime}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                          {flight.departureCity}
                        </p>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-2">
                        <p className="text-xs text-muted-foreground">
                          {flight.duration}
                        </p>
                        <div className="flex items-center w-full gap-1">
                          <div className="flex-1 h-px bg-border" />
                          <Plane className="w-3 h-3 text-primary rotate-90" />
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <p className="text-xs text-muted-foreground">Direct</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground text-base">
                          {flight.arrivalTime}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                          {flight.destinationCity}
                        </p>
                      </div>
                    </div>

                    {/* Price & Select */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-bold text-primary text-lg">
                        ₹{flight.economyPrice.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per person
                      </p>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Seat Selection (shown when a flight is selected) ────────────────── */}
        {selectedFlight && (
          <Card data-ocid="flight.seat_section">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Choose Your Seat — {selectedFlight.flightNumber}
              </CardTitle>
              {/* Class selector */}
              <div className="flex gap-2 mt-2">
                {(["Economy", "Business"] as SeatClass[]).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleClassChange(cls)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      seatClass === cls
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    data-ocid={`flight.class.${cls.toLowerCase()}`}
                  >
                    {cls} — ₹
                    {(cls === "Economy"
                      ? selectedFlight.economyPrice
                      : selectedFlight.businessPrice
                    ).toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {/* Seat count progress indicator */}
              <div
                className={`flex items-center justify-between mb-4 rounded-lg px-3 py-2 border transition-all ${
                  maxReachedFlash
                    ? "border-destructive bg-destructive/10"
                    : selectedSeats.length === travelers
                      ? "border-green-500 bg-green-500/10"
                      : "border-primary/30 bg-primary/5"
                }`}
                data-ocid="flight.seat_count_indicator"
              >
                <span className="text-sm font-medium text-foreground">
                  {maxReachedFlash
                    ? `Max ${travelers} seat${travelers !== 1 ? "s" : ""} reached`
                    : `Select seats for ${travelers} traveler${
                        travelers !== 1 ? "s" : ""
                      }`}
                </span>
                <span
                  className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                    maxReachedFlash
                      ? "bg-destructive text-destructive-foreground"
                      : selectedSeats.length === travelers
                        ? "bg-green-500 text-white"
                        : "bg-primary text-primary-foreground"
                  }`}
                >
                  {selectedSeats.length} / {travelers}
                </span>
              </div>

              {/* Seat map legend */}
              <div className="flex gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-muted-foreground/30 border" />{" "}
                  Taken
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />{" "}
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-primary border border-primary" />{" "}
                  Selected
                </span>
              </div>

              {/* ── Seat grid: strict A B C | aisle | D E F per row ─────────────── */}
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  {/* Column headers */}
                  <div className="flex items-center gap-1.5 mb-2 pl-8">
                    {/* Left group headers: A B C */}
                    {["A", "B", "C"].map((col) => (
                      <div
                        key={col}
                        className="w-8 text-center text-xs font-semibold text-muted-foreground"
                      >
                        {col}
                      </div>
                    ))}
                    {/* Aisle gap header */}
                    <div className="w-5 text-center text-xs text-muted-foreground/30">
                      |
                    </div>
                    {/* Right group headers: D E F */}
                    {["D", "E", "F"].map((col) => (
                      <div
                        key={col}
                        className="w-8 text-center text-xs font-semibold text-muted-foreground"
                      >
                        {col}
                      </div>
                    ))}
                  </div>

                  {/* Rows — max-height scrollable */}
                  <div
                    className="max-h-72 overflow-y-auto pr-1 space-y-1.5"
                    data-ocid="flight.seat_grid"
                  >
                    {Array.from(
                      { length: seatClass === "Economy" ? 30 : 8 },
                      (_, rowIdx) => {
                        const rowNum = rowIdx + 1;
                        // seats array is ordered: [rowABC, rowDEF] — each row occupies 6 consecutive entries
                        const base = rowIdx * 6;
                        const rowABC = seats.slice(base, base + 3); // A, B, C
                        const rowDEF = seats.slice(base + 3, base + 6); // D, E, F

                        return (
                          <div
                            key={rowNum}
                            className="flex items-center gap-1.5"
                          >
                            {/* Row number */}
                            <div className="w-7 text-center text-xs text-muted-foreground font-medium shrink-0">
                              {rowNum}
                            </div>

                            {/* Left group: A, B, C */}
                            {rowABC.map((seat) => {
                              const isChosen = selectedSeats.some(
                                (s) => s.id === seat.id,
                              );
                              const colLetter = seat.id.replace(
                                String(rowNum),
                                "",
                              );
                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={seat.taken}
                                  onClick={() => handleSeatClick(seat)}
                                  title={`Seat ${seat.label} — ${seat.position}`}
                                  className={`w-8 h-8 rounded text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-primary shrink-0
                                    ${
                                      seat.taken
                                        ? "bg-muted-foreground/20 border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                                        : isChosen
                                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                                          : "bg-green-500/15 border-green-500 text-green-700 dark:text-green-400 hover:bg-green-500/30 cursor-pointer"
                                    }`}
                                  data-ocid={`flight.seat.${seat.id}`}
                                >
                                  {colLetter}
                                </button>
                              );
                            })}

                            {/* Aisle visual gap */}
                            <div className="w-5 flex items-center justify-center shrink-0">
                              <div className="w-px h-6 bg-border/50" />
                            </div>

                            {/* Right group: D, E, F */}
                            {rowDEF.map((seat) => {
                              const isChosen = selectedSeats.some(
                                (s) => s.id === seat.id,
                              );
                              const colLetter = seat.id.replace(
                                String(rowNum),
                                "",
                              );
                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={seat.taken}
                                  onClick={() => handleSeatClick(seat)}
                                  title={`Seat ${seat.label} — ${seat.position}`}
                                  className={`w-8 h-8 rounded text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-primary shrink-0
                                    ${
                                      seat.taken
                                        ? "bg-muted-foreground/20 border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                                        : isChosen
                                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                                          : "bg-green-500/15 border-green-500 text-green-700 dark:text-green-400 hover:bg-green-500/30 cursor-pointer"
                                    }`}
                                  data-ocid={`flight.seat.${seat.id}`}
                                >
                                  {colLetter}
                                </button>
                              );
                            })}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* Selected seats summary */}
              {selectedSeats.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium">
                      Seat{selectedSeats.length !== 1 ? "s" : ""} selected:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold"
                          data-ocid={`flight.selected_seat_chip.${s.id}`}
                        >
                          {s.label}
                          <span className="ml-1 text-muted-foreground font-normal">
                            {s.position[0]}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedSeats.length < travelers && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <span>⚠️</span>
                      {travelers - selectedSeats.length} more seat
                      {travelers - selectedSeats.length !== 1 ? "s" : ""} needed
                    </p>
                  )}
                </div>
              ) : (
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-ocid="flight.seat.empty_state"
                >
                  Click green seats to select {travelers} seat
                  {travelers !== 1 ? "s" : ""} — one per traveler.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Price Summary ────────────────────────────────────────────────── */}
        {selectedFlight && (
          <Card
            className="border-primary/30 bg-primary/5"
            data-ocid="flight.price_summary"
          >
            <CardContent className="py-4 space-y-2">
              <h3 className="font-semibold text-foreground text-sm">
                Price Summary
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ₹{pricePerPerson.toLocaleString("en-IN")} × {travelers}{" "}
                  traveler{travelers !== 1 ? "s" : ""}
                </span>
                <span className="font-medium text-foreground">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
                <span className="font-semibold text-foreground">
                  Total Flight Cost
                </span>
                <span className="font-bold text-primary text-base">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              {seatClass === "Business" && (
                <p className="text-xs text-muted-foreground">
                  Business class includes extra legroom, priority boarding &
                  meals.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Validation hint */}
        {!canProceed && (
          <div
            className="text-sm text-muted-foreground text-center"
            data-ocid="flight.validation_hint"
          >
            {!departureDate
              ? "Select a departure date to continue."
              : !selectedFlight
                ? "Select a flight to continue."
                : `Select ${travelers - selectedSeats.length} more seat${
                    travelers - selectedSeats.length !== 1 ? "s" : ""
                  } to continue.`}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/travel-plans/detail" })}
            data-ocid="flight.footer_back_button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="flex items-center gap-3">
            {selectedFlight && selectedSeats.length === travelers && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-bold text-primary">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            )}
            <Button
              disabled={!canProceed}
              onClick={handleNext}
              className="min-w-[140px]"
              data-ocid="flight.next_button"
            >
              Next: Hotel <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
