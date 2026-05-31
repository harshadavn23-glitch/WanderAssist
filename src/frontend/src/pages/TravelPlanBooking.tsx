// TravelPlanBooking.tsx — /travel-plans/book
// R2: Family booking — per-passenger Adult/Child toggle + First-Time Certificate checkbox for children.
// R3: Google Pay + PhonePe payment options with QR or Bank Transfer sub-flows.
// R4: Full validation on Step 1, Step 2, and Step 3 payment form.
// R5: Read flightSelection/hotelSelection from localStorage and travelPlanState from sessionStorage.
//     Show collapsible selections summary + final cost breakdown in Step 3.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useBookings } from "@/hooks/useBookings";
import { useSession } from "@/hooks/useSession";
import type { BookingDetails } from "@/types/travel";
import { formatCurrency } from "@/utils/formatCurrency";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Hotel,
  Plane,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface PassengerForm {
  pid: string;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  passportNo: string;
  passportExpiry: string;
  email: string;
  phone: string;
  passengerType: "adult" | "child";
  firstTimeCert: boolean;
}

interface ContactForm {
  email: string;
  phone: string;
  address: string;
  city: string;
  pin: string;
  emergencyName: string;
  emergencyPhone: string;
}

interface FlightSelection {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  /** Legacy single seat — kept for backward compat */
  seatNumber?: string;
  /** Multi-seat array (one per traveler) */
  seatNumbers?: string[];
  seatClass: string;
  pricePerPerson: number;
  totalPrice: number;
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

interface CertificateInfo {
  wantsCertificate: boolean;
  certBabyName: string;
  certBabyAgeInput: string;
  certDesign: string;
  childUnder5: boolean;
}

type PassengerFieldErrors = Record<string, string>;
type PassengerErrors = Record<string, PassengerFieldErrors>;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR + i);
const NATIONALITIES = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "UAE",
  "New Zealand",
  "South Africa",
  "Brazil",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Switzerland",
  "China",
];

const emptyPassenger = (): PassengerForm => ({
  pid: `pax-${Date.now()}-${Math.random()}`,
  title: "Mr",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  nationality: "India",
  passportNo: "",
  passportExpiry: "",
  email: "",
  phone: "",
  passengerType: "adult",
  firstTimeCert: false,
});

type PayMethod = "card" | "upi" | "netbanking" | "googlepay" | "phonepe";
type UpiSubMode = "qr" | "transfer" | null;

// ── Validation helpers ─────────────────────────────────────────────────────
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isValidPhone(v: string) {
  return /^\d{10}$/.test(v.replace(/[\s+\-()]/g, ""));
}
function isValidPassport(v: string) {
  return /^[A-Za-z0-9]{6,20}$/.test(v.trim());
}
function isPastDate(v: string) {
  if (!v) return false;
  return new Date(v) < new Date();
}
function isFutureDate(v: string) {
  if (!v) return false;
  return new Date(v) > new Date();
}

function validatePassenger(p: PassengerForm): PassengerFieldErrors {
  const errs: PassengerFieldErrors = {};
  if (!p.firstName.trim()) errs.firstName = "First name is required";
  if (!p.lastName.trim()) errs.lastName = "Last name is required";
  if (!p.dob) errs.dob = "Date of birth is required";
  else if (!isPastDate(p.dob)) errs.dob = "Must be a valid past date";
  if (!p.nationality) errs.nationality = "Nationality is required";
  if (!p.passportNo.trim()) errs.passportNo = "Valid passport number required";
  else if (!isValidPassport(p.passportNo))
    errs.passportNo = "Valid passport number required";
  if (!p.passportExpiry) errs.passportExpiry = "Passport must not be expired";
  else if (!isFutureDate(p.passportExpiry))
    errs.passportExpiry = "Passport must not be expired";
  if (!p.email.trim()) errs.email = "Valid email required";
  else if (!isValidEmail(p.email)) errs.email = "Valid email required";
  if (!p.phone.trim()) errs.phone = "Valid phone number required";
  else if (!isValidPhone(p.phone)) errs.phone = "Valid phone number required";
  return errs;
}

function validateContact(c: ContactForm): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!c.email.trim()) errs.email = "Valid email required";
  else if (!isValidEmail(c.email)) errs.email = "Valid email required";
  if (!c.phone.trim()) errs.phone = "Valid phone number required";
  else if (!isValidPhone(c.phone)) errs.phone = "Valid phone number required";
  if (!c.address.trim()) errs.address = "Address is required";
  if (!c.city.trim()) errs.city = "City is required";
  if (!c.pin.trim()) errs.pin = "Valid 6-digit PIN required";
  else if (!/^\d{6}$/.test(c.pin.trim()))
    errs.pin = "Valid 6-digit PIN required";
  if (!c.emergencyName.trim())
    errs.emergencyName = "Emergency contact name is required";
  if (!c.emergencyPhone.trim())
    errs.emergencyPhone = "Valid emergency phone required";
  else if (!isValidPhone(c.emergencyPhone))
    errs.emergencyPhone = "Valid emergency phone required";
  return errs;
}

// ── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const steps = ["Passenger Details", "Contact Info", "Payment"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-smooth ${done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
              <p
                className={`text-xs font-medium whitespace-nowrap ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 md:w-24 mx-2 mb-4 transition-smooth ${step > num ? "bg-green-500" : "bg-muted"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Collapsible Selections Summary ─────────────────────────────────────────
function SelectionsSummaryCard({
  flight,
  hotel,
  cert,
}: {
  flight: FlightSelection | null;
  hotel: HotelSelection | null;
  cert: CertificateInfo | null;
}) {
  const [open, setOpen] = useState(false);
  const hasAny = flight || hotel || cert?.wantsCertificate || cert?.childUnder5;
  if (!hasAny) return null;

  return (
    <Card
      className="border-primary/30 bg-primary/5 shadow-sm"
      data-ocid="selections-summary-card"
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        data-ocid="selections-summary-toggle"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Your Selections Summary
            </p>
            <p className="text-xs text-muted-foreground">
              {[
                flight && "Flight",
                hotel && "Hotel",
                cert?.wantsCertificate && "Certificate",
                cert?.childUnder5 && "Child Requirements",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-primary/20 pt-4">
          {/* Flight details */}
          {flight && (
            <div
              className="rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-2"
              data-ocid="selections-flight"
            >
              <div className="flex items-center gap-2 mb-1">
                <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  Flight
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Airline</p>
                  <p className="font-semibold text-foreground">
                    {flight.airline}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Flight No.</p>
                  <p className="font-mono font-semibold text-foreground">
                    {flight.flightNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="font-semibold text-foreground">
                    {flight.departure} → {flight.arrival}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Departure</p>
                  <p className="font-semibold text-foreground">
                    {flight.departureTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Seat</p>
                  <p className="font-mono font-semibold text-foreground">
                    {getSeatDisplay(flight)} · {flight.seatClass}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Flight Cost</p>
                  <p className="font-bold text-blue-700 dark:text-blue-300">
                    ₹{flight.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hotel details */}
          {hotel && (
            <div
              className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-2"
              data-ocid="selections-hotel"
            >
              <div className="flex items-center gap-2 mb-1">
                <Hotel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  Hotel
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Hotel</p>
                  <p className="font-semibold text-foreground">
                    {hotel.hotelName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold text-foreground">
                    {"⭐".repeat(Math.min(hotel.starRating, 5))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Room Type</p>
                  <p className="font-semibold text-foreground">
                    {hotel.roomType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bed Type</p>
                  <p className="font-semibold text-foreground">
                    {hotel.bedType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Per Night</p>
                  <p className="font-semibold text-foreground">
                    ₹{hotel.pricePerNight.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hotel Cost</p>
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    ₹{hotel.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Certificate */}
          {cert?.wantsCertificate && (
            <div
              className="rounded-xl border border-indigo-200 dark:border-indigo-700/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 space-y-1"
              data-ocid="selections-certificate"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎓</span>
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                  First-Time Baby Flight Certificate
                </p>
              </div>
              <p className="text-sm text-foreground">
                Baby Name: <strong>{cert.certBabyName || "—"}</strong>
              </p>
              <p className="text-sm text-foreground">
                Age: <strong>{cert.certBabyAgeInput || "—"} months</strong>
              </p>
              <p className="text-sm text-foreground">
                Design: <strong>{cert.certDesign || "Classic"}</strong>
              </p>
            </div>
          )}

          {/* Child Under 5 */}
          {cert?.childUnder5 && (
            <div
              className="flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-700/40 bg-green-50/60 dark:bg-green-950/20 px-4 py-3"
              data-ocid="selections-child-under5"
            >
              <span className="text-base">👶</span>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                Child Under 5 Requirements Applied
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Booking Summary Sidebar ────────────────────────────────────────────────
function BookingSummary({
  plan,
  flightCost,
  hotelCost,
}: {
  plan: { name: string; days: number; price: number; travelers: number };
  flightCost: number;
  hotelCost: number;
}) {
  const nights = plan.days - 1;
  const subtotal = plan.price * plan.travelers;
  const taxes = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + taxes + flightCost + hotelCost;
  return (
    <Card className="border-border shadow-elevated" data-ocid="booking-summary">
      <div className="h-1 bg-gradient-to-r from-primary to-blue-400 rounded-t-xl" />
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-semibold text-foreground leading-tight">
          {plan.name}
        </p>
        <p className="text-muted-foreground">
          {plan.days} Days / {nights} Nights
        </p>
        <Separator />
        <div className="space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>
              Plan cost ({plan.travelers}{" "}
              {plan.travelers === 1 ? "traveler" : "travelers"})
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxes &amp; Fees (18%)</span>
            <span>{formatCurrency(taxes)}</span>
          </div>
          {flightCost > 0 && (
            <div className="flex justify-between text-blue-600 dark:text-blue-400">
              <span>✈ Flight</span>
              <span>{formatCurrency(flightCost)}</span>
            </div>
          )}
          {hotelCost > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>🏨 Hotel</span>
              <span>{formatCurrency(hotelCost)}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(grandTotal)}</span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Free Cancellation within 24
          hours
        </p>
        <Separator />
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground uppercase tracking-wide text-xs mb-1">
            Inclusions
          </p>
          {[
            "✈ Flight tickets",
            "🏨 Hotel",
            "🍽 Daily breakfast",
            "🚌 Airport transfers",
            "🗺 Sightseeing",
            "🛡 Insurance",
          ].map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Final Trip Summary (Step 3) ────────────────────────────────────────────
function FinalTripSummary({
  plan,
  flight,
  hotel,
  cert,
  total,
  destination,
  travelers,
}: {
  plan: { name: string; days: number; price: number };
  flight: FlightSelection | null;
  hotel: HotelSelection | null;
  cert: CertificateInfo | null;
  total: number;
  destination: string;
  travelers: number;
}) {
  const baseCost = plan.price * travelers;
  const taxAmount = Math.round(baseCost * 0.18);
  const flightCost = flight?.totalPrice ?? 0;
  const hotelCost = hotel?.totalCost ?? 0;
  return (
    <Card className="border-border bg-muted/30" data-ocid="final-trip-summary">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Final Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Trip overview */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="font-semibold text-foreground">{destination}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold text-foreground">{plan.days} Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Travelers</p>
            <p className="font-semibold text-foreground">{travelers}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Package</p>
            <p className="font-semibold text-foreground truncate">
              {plan.name}
            </p>
          </div>
        </div>

        {/* Flight */}
        {flight && (
          <>
            <Separator />
            <div className="space-y-1" data-ocid="final-flight-details">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Flight Details
              </p>
              <p className="text-foreground">
                {flight.airline} ·{" "}
                <span className="font-mono">{flight.flightNumber}</span>
              </p>
              <p className="text-muted-foreground">
                {flight.departure} → {flight.arrival} · {flight.departureTime}
              </p>
              <p className="text-muted-foreground">
                Seat{" "}
                <span className="font-mono font-semibold text-foreground">
                  {getSeatDisplay(flight)}
                </span>{" "}
                · {flight.seatClass}
              </p>
              <p className="font-semibold text-blue-700 dark:text-blue-300">
                Flight Cost: {formatCurrency(flight.totalPrice)}
              </p>
            </div>
          </>
        )}

        {/* Hotel */}
        {hotel && (
          <>
            <Separator />
            <div className="space-y-1" data-ocid="final-hotel-details">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5" /> Hotel Details
              </p>
              <p className="text-foreground">
                {hotel.hotelName} · {"⭐".repeat(Math.min(hotel.starRating, 5))}
              </p>
              <p className="text-muted-foreground">
                {hotel.roomType} · {hotel.bedType}
              </p>
              <p className="text-muted-foreground">
                {formatCurrency(hotel.pricePerNight)}/night
              </p>
              <p className="font-semibold text-amber-700 dark:text-amber-300">
                Hotel Cost: {formatCurrency(hotel.totalCost)}
              </p>
            </div>
          </>
        )}

        {/* Certificate */}
        {cert?.wantsCertificate && (
          <>
            <Separator />
            <div className="space-y-1" data-ocid="final-certificate-details">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                🎓 Baby Flight Certificate
              </p>
              <p className="text-foreground">
                Baby: <strong>{cert.certBabyName || "—"}</strong> · Age:{" "}
                <strong>{cert.certBabyAgeInput || "—"} months</strong>
              </p>
              <p className="text-muted-foreground">
                Design: {cert.certDesign || "Classic"}
              </p>
            </div>
          </>
        )}

        {/* Child under 5 */}
        {cert?.childUnder5 && (
          <>
            <Separator />
            <div
              className="flex items-center gap-2"
              data-ocid="final-child-under5"
            >
              <span>👶</span>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Child Under 5 Requirements Applied
              </p>
            </div>
          </>
        )}

        {/* Itemized cost breakdown */}
        <Separator />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>
              Plan cost ({travelers}{" "}
              {travelers === 1 ? "traveler" : "travelers"})
            </span>
            <span>{formatCurrency(baseCost)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxes (18%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          {flightCost > 0 && (
            <div className="flex justify-between text-blue-600 dark:text-blue-400">
              <span>✈ Flight</span>
              <span>{formatCurrency(flightCost)}</span>
            </div>
          )}
          {hotelCost > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>🏨 Hotel</span>
              <span>{formatCurrency(hotelCost)}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex justify-between items-center font-bold text-base">
          <span>Grand Total</span>
          <span className="text-primary text-lg">{formatCurrency(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Includes package cost, taxes, flight &amp; hotel
        </p>
      </CardContent>
    </Card>
  );
}

// ── Field error helper ─────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

// ── Passenger Form Block ───────────────────────────────────────────────────
function PassengerBlock({
  idx,
  data,
  isFamily,
  showCertPrompt,
  fieldErrors,
  onChange,
}: {
  idx: number;
  data: PassengerForm;
  isFamily: boolean;
  showCertPrompt?: boolean;
  fieldErrors?: PassengerFieldErrors;
  onChange: (field: keyof PassengerForm, value: string | boolean) => void;
}) {
  const errs = fieldErrors ?? {};
  const isChild = data.passengerType === "child";
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-muted/40 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="font-semibold text-sm text-foreground">
          Passenger {idx + 1}
          {idx === 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              (Lead Traveler)
            </span>
          )}
        </p>
        {isFamily && (
          <span
            className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${isChild ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700/40" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/40"}`}
          >
            {isChild ? "👶 Child" : "👨 Adult"}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {isFamily && (
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
              <span>👨‍👩‍👧‍👦</span> Select Passenger Type
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChange("passengerType", "adult")}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isChild ? "border-blue-500 bg-blue-500 text-white shadow-md" : "border-border bg-background text-foreground hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"}`}
                data-ocid={`p${idx}-type-adult`}
              >
                <span className="text-base">👨</span> Adult
              </button>
              <button
                type="button"
                onClick={() => onChange("passengerType", "child")}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${isChild ? "border-violet-500 bg-violet-500 text-white shadow-md" : "border-border bg-background text-foreground hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"}`}
                data-ocid={`p${idx}-type-child`}
              >
                <span className="text-base">👶</span> Child
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <select
              value={data.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {["Mr", "Mrs", "Ms", "Dr"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Gender</Label>
            <select
              value={data.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {["Male", "Female", "Other"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">First Name *</Label>
            <Input
              placeholder="John"
              value={data.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              className={errs.firstName ? "border-red-500" : ""}
              data-ocid={`p${idx}-fname`}
            />
            <FieldError msg={errs.firstName} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Last Name *</Label>
            <Input
              placeholder="Doe"
              value={data.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              className={errs.lastName ? "border-red-500" : ""}
              data-ocid={`p${idx}-lname`}
            />
            <FieldError msg={errs.lastName} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Date of Birth *</Label>
            <Input
              type="date"
              value={data.dob}
              onChange={(e) => onChange("dob", e.target.value)}
              className={errs.dob ? "border-red-500" : ""}
            />
            <FieldError msg={errs.dob} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nationality *</Label>
            <select
              value={data.nationality}
              onChange={(e) => onChange("nationality", e.target.value)}
              className={`w-full h-9 rounded-md border bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring ${errs.nationality ? "border-red-500" : "border-input"}`}
            >
              {NATIONALITIES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <FieldError msg={errs.nationality} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Passport Number *</Label>
            <Input
              placeholder="A1234567"
              value={data.passportNo}
              onChange={(e) => onChange("passportNo", e.target.value)}
              className={`font-mono uppercase ${errs.passportNo ? "border-red-500" : ""}`}
            />
            <FieldError msg={errs.passportNo} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Passport Expiry *</Label>
            <Input
              type="date"
              value={data.passportExpiry}
              onChange={(e) => onChange("passportExpiry", e.target.value)}
              className={errs.passportExpiry ? "border-red-500" : ""}
            />
            <FieldError msg={errs.passportExpiry} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Email *</Label>
            <Input
              type="email"
              placeholder="john@email.com"
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={errs.email ? "border-red-500" : ""}
              data-ocid={`p${idx}-email`}
            />
            <FieldError msg={errs.email} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phone *</Label>
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={errs.phone ? "border-red-500" : ""}
              data-ocid={`p${idx}-phone`}
            />
            <FieldError msg={errs.phone} />
          </div>
        </div>

        {isFamily && isChild && showCertPrompt && (
          <div
            className="rounded-xl border-2 border-indigo-300 dark:border-indigo-600/60 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-4 space-y-3"
            data-ocid={`p${idx}-cert-section`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎓</span>
              <div>
                <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                  First-Time Travel Certificate
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Mark this child's first journey with a special keepsake
                </p>
              </div>
            </div>
            <label
              className="flex items-start gap-3 cursor-pointer group"
              data-ocid={`p${idx}-first-time-cert`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${data.firstTimeCert ? "bg-indigo-600 border-indigo-600" : "border-indigo-300 dark:border-indigo-600 bg-white dark:bg-indigo-950/50 group-hover:border-indigo-500"}`}
              >
                {data.firstTimeCert && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                )}
                <input
                  type="checkbox"
                  checked={data.firstTimeCert}
                  onChange={(e) => onChange("firstTimeCert", e.target.checked)}
                  className="sr-only"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                  Yes, generate a First-Time Travel Certificate 📜
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                  A personalized commemorative certificate to mark this child's
                  very first travel memory
                </p>
              </div>
            </label>
            {data.firstTimeCert && (
              <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700/50 rounded-lg px-3 py-2">
                <span className="text-base">✅</span>
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Certificate included! Will be sent with your booking
                  confirmation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── QR Code Display ────────────────────────────────────────────────────────
function DummyQR({
  provider,
  amount,
}: { provider: "Google Pay" | "PhonePe"; amount: number }) {
  const dots: { x: number; y: number }[] = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      const hash = (r * 31 + c * 17 + r * c) % 7;
      const isFinder =
        (r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8);
      if (isFinder || hash < 4) dots.push({ x: c, y: r });
    }
  }
  const color = provider === "PhonePe" ? "#5f259f" : "#1a73e8";
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-2xl border-4 p-3 bg-white shadow-lg"
        style={{ borderColor: color }}
      >
        <svg
          width={168}
          height={168}
          viewBox="0 0 21 21"
          role="img"
          aria-label={`${provider} payment QR code`}
        >
          <title>{provider} payment QR code</title>
          <rect width={21} height={21} fill="white" />
          {dots.map((d) => (
            <rect
              key={`${d.x}-${d.y}`}
              x={d.x}
              y={d.y}
              width={0.9}
              height={0.9}
              fill={color}
            />
          ))}
        </svg>
      </div>
      <p className="text-sm font-bold text-foreground text-center">
        Scan with <span style={{ color }}>{provider}</span> app
      </p>
      <p className="text-xs text-muted-foreground">
        Amount:{" "}
        <strong className="text-foreground">₹{amount.toLocaleString()}</strong>
      </p>
      <p className="text-xs text-muted-foreground italic">
        This is a demo QR code for simulation.
      </p>
    </div>
  );
}

// ── Bank Details Card ──────────────────────────────────────────────────────
function BankDetails({ amount }: { amount: number }) {
  const details = [
    { label: "Account Name", value: "WanderAssist Travel Pvt Ltd" },
    { label: "Account Number", value: "9876543210123456" },
    { label: "IFSC Code", value: "WAND0001234" },
    { label: "Bank Name", value: "WanderAssist Bank" },
    { label: "Amount", value: `₹${amount.toLocaleString()}` },
  ];
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
      <p className="font-bold text-sm text-foreground flex items-center gap-2">
        <Building2 className="w-4 h-4 text-primary" /> Bank Transfer Details
      </p>
      {details.map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center gap-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-mono font-semibold text-foreground">
            {value}
          </span>
        </div>
      ))}
      <p className="text-xs text-amber-600 dark:text-amber-400">
        ⚠️ This is a simulated bank transfer — no real payment required.
      </p>
    </div>
  );
}

// ── Seat display helper ────────────────────────────────────────────────────
function getSeatDisplay(flight: FlightSelection): string {
  if (flight.seatNumbers && flight.seatNumbers.length > 0) {
    return flight.seatNumbers.join(", ");
  }
  return flight.seatNumber ?? "—";
}

function SeatBadges({ flight }: { flight: FlightSelection }) {
  const seats =
    flight.seatNumbers && flight.seatNumbers.length > 0
      ? flight.seatNumbers
      : flight.seatNumber
        ? [flight.seatNumber]
        : [];
  if (seats.length === 0)
    return <span className="font-mono font-semibold text-foreground">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {seats.map((s) => (
        <span
          key={s}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold"
        >
          {s}
        </span>
      ))}
      <span className="text-muted-foreground text-xs self-center">
        · {flight.seatClass}
      </span>
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function TravelPlanBooking() {
  const navigate = useNavigate();
  const { addBooking, saveToBackend } = useBookings();
  const { session } = useSession();

  // Hoist plan + travelers BEFORE any useState that references them
  // to avoid the temporal dead zone (TDZ) error at runtime.
  const raw = sessionStorage.getItem("selectedPlan");
  const plan = raw
    ? (JSON.parse(raw) as {
        name: string;
        days: number;
        price: number;
        travelers?: number;
        destination?: string;
        travelType?: string;
        id?: number;
        wantsCertificate?: boolean;
        maleTravelers?: number;
        femaleTravelers?: number;
      })
    : { name: "Travel Plan", days: 5, price: 45000, travelers: 2 };

  const travelers = plan.travelers ?? 2;

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Read flight/hotel/cert selections from storage
  const [flightSelection, setFlightSelection] =
    useState<FlightSelection | null>(null);
  const [hotelSelection, setHotelSelection] = useState<HotelSelection | null>(
    null,
  );
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);

  useEffect(() => {
    try {
      const rawFlight = localStorage.getItem("flightSelection");
      if (rawFlight)
        setFlightSelection(JSON.parse(rawFlight) as FlightSelection);
    } catch {
      /* ignore */
    }
    try {
      const rawHotel = localStorage.getItem("hotelSelection");
      if (rawHotel) setHotelSelection(JSON.parse(rawHotel) as HotelSelection);
    } catch {
      /* ignore */
    }
    try {
      const rawState = sessionStorage.getItem("travelPlanState");
      if (rawState) {
        const state = JSON.parse(rawState) as Record<string, unknown>;
        setCertInfo({
          wantsCertificate: Boolean(state.wantsCertificate),
          certBabyName: String(state.certBabyName ?? ""),
          certBabyAgeInput: String(state.certBabyAgeInput ?? ""),
          certDesign: String(state.certDesign ?? "Classic"),
          childUnder5: Boolean(state.childUnder5),
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Initialize passengers array to match traveler count from the plan.
  // travelers is already declared above so there is no TDZ risk here.
  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const count = Math.max(1, travelers);
    return Array.from({ length: count }, () => emptyPassenger());
  });
  const [contact, setContact] = useState<ContactForm>({
    email: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const contactSynced = useRef(false);

  const [passengerErrors, setPassengerErrors] = useState<PassengerErrors>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>(
    {},
  );
  const [paySubmitAttempted, setPaySubmitAttempted] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("card");
  const [upiSubMode, setUpiSubMode] = useState<UpiSubMode>(null);
  const [cardNo, setCardNo] = useState("");
  const [expMonth, setExpMonth] = useState("January");
  const [expYear, setExpYear] = useState(String(CURRENT_YEAR + 1));
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("SBI");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFamily = plan.travelType === "family";
  const planWantsCertificate = plan.wantsCertificate ?? false;

  const flightCost = flightSelection?.totalPrice ?? 0;
  const hotelCost = hotelSelection?.totalCost ?? 0;
  const subtotal = plan.price * travelers;
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + taxes + flightCost + hotelCost;
  // Persist grand total — use useEffect to avoid side-effects in render body
  useEffect(() => {
    sessionStorage.setItem("wanderassist-booking-total", String(total));
  }, [total]);

  const destination = plan.destination ?? "Unknown";
  const surprisePlanCode =
    sessionStorage.getItem("surprisePlanCode") ?? undefined;

  useEffect(() => {
    if (!contactSynced.current && passengers[0].email) {
      setContact((c) => ({
        ...c,
        email: passengers[0].email,
        phone: passengers[0].phone,
      }));
      contactSynced.current = true;
    }
  }, [passengers]);

  function updatePassenger(
    idx: number,
    field: keyof PassengerForm,
    value: string | boolean,
  ) {
    setPassengers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    );
    if (typeof value === "string" && passengerErrors[passengers[idx]?.pid]) {
      setPassengerErrors((prev) => ({
        ...prev,
        [passengers[idx].pid]: { ...prev[passengers[idx].pid], [field]: "" },
      }));
    }
  }

  function addPassenger() {
    setPassengers((prev) => [...prev, emptyPassenger()]);
  }

  function handleStep1Continue() {
    const allErrors: PassengerErrors = {};
    let hasError = false;
    for (const p of passengers) {
      const errs = validatePassenger(p);
      if (Object.keys(errs).length > 0) {
        allErrors[p.pid] = errs;
        hasError = true;
      }
    }
    setPassengerErrors(allErrors);
    if (hasError) return;
    setContact((c) => ({
      ...c,
      email: passengers[0].email,
      phone: passengers[0].phone,
    }));
    setStep(2);
  }

  function handleStep2Continue() {
    const errs = validateContact(contact);
    setContactErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(3);
  }

  function validatePayment(): boolean {
    const errs: Record<string, string> = {};
    if (paymentMethod === "card") {
      if (cardNo.replace(/\s/g, "").length !== 16)
        errs.cardNo = "Card number must be exactly 16 digits";
      const monthIdx = MONTHS.indexOf(expMonth) + 1;
      const expDate = new Date(Number(expYear), monthIdx, 1);
      if (expDate <= new Date())
        errs.expiry = "Card expiry date must be in the future";
      if (!cvv || !/^\d{3,4}$/.test(cvv)) errs.cvv = "CVV must be 3–4 digits";
      if (!cardName.trim() || cardName.trim().length < 2)
        errs.cardName = "Cardholder name must be at least 2 characters";
    } else if (paymentMethod === "upi") {
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId.trim()))
        errs.upiId = "Invalid UPI ID format (e.g. name@upi)";
    } else if (paymentMethod === "googlepay" || paymentMethod === "phonepe") {
      if (!upiSubMode) errs.upiSubMode = "Choose QR Code or Bank Transfer";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function formatCard(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  async function handlePay() {
    setPaySubmitAttempted(true);
    if (!validatePayment()) return;
    setProcessing(true);
    await new Promise((res) => setTimeout(res, 2200));
    const ref = `WA${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(ref);
    const booking: BookingDetails = {
      id: ref,
      destination,
      travelers,
      days: plan.days,
      tourType: "guided",
      totalCost: total,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      reference: ref,
      paymentRef: ref,
      costPerPerson: plan.price,
      surprisePlanCode,
    };
    addBooking(booking);
    saveToBackend({
      ...booking,
      userId: session?.userId ?? "guest",
      startDate: new Date().toISOString().split("T")[0],
    })
      .then((canisterId) => {
        if (canisterId != null) addBooking({ ...booking, canisterId });
      })
      .catch(() => {
        /* backend save failed — local booking already stored */
      });
    setProcessing(false);
    setConfirmed(true);
  }

  const hasPayErrors = paySubmitAttempted && Object.keys(errors).length > 0;

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center shadow-elevated">
          <CardContent className="p-10 space-y-5">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Processing Payment
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your booking...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmed) {
    const email = contact.email || passengers[0]?.email || "your email";
    const passengerNames = passengers.map(
      (p) => `${p.title} ${p.firstName} ${p.lastName}`,
    );
    const payMethodLabel = {
      card: "Credit/Debit Card",
      upi: "UPI",
      netbanking: `Net Banking (${bank})`,
      googlepay: "Google Pay",
      phonepe: "PhonePe",
    }[paymentMethod];

    return (
      <div className="min-h-screen bg-background px-4 py-12 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-hero">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl text-foreground">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your trip has been successfully booked
            </p>
          </div>

          {/* Booking confirmation component */}
          <BookingConfirmationInline
            bookingRef={bookingId}
            destination={destination}
            travelers={travelers}
            days={plan.days}
            totalCost={total}
            costPerPerson={plan.price}
            passengerNames={passengerNames}
            contactEmail={email}
            contactPhone={contact.phone}
            paymentMethod={payMethodLabel}
            flight={flightSelection}
            hotel={hotelSelection}
            cert={certInfo}
            planWantsCertificate={planWantsCertificate}
          />

          <div className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-4 text-sm text-foreground flex items-center gap-2">
            📧 Confirmation email sent to{" "}
            <span className="font-semibold">{email}</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: "/booking-history" })}
              data-ocid="view-history-btn"
            >
              View Booking History
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground font-bold"
              onClick={() => navigate({ to: "/" })}
              data-ocid="back-dashboard-btn"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gpayActive = paymentMethod === "googlepay";
  const phonepeActive = paymentMethod === "phonepe";
  const upiProvider: "Google Pay" | "PhonePe" = gpayActive
    ? "Google Pay"
    : "PhonePe";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
            Complete Your Booking
          </h1>
          <p className="text-muted-foreground text-sm">
            {plan.name} · {plan.days} Days
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <StepIndicator step={step} />

        {/* Selections summary — visible on all steps */}
        <div className="mb-6">
          <SelectionsSummaryCard
            flight={flightSelection}
            hotel={hotelSelection}
            cert={certInfo}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in" data-ocid="step-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Passenger Details
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {passengers.length} / {travelers} passenger
                    {travelers !== 1 ? "s" : ""}
                  </span>
                </div>
                {isFamily && (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3"
                    data-ocid="family-banner"
                  >
                    <span className="text-xl shrink-0">👨‍👩‍👧‍👦</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                        Family Booking
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        For each traveler, select <strong>Adult</strong> or{" "}
                        <strong>Child</strong>. Children can receive a{" "}
                        <strong>First-Time Travel Certificate</strong> 🎓
                      </p>
                    </div>
                  </div>
                )}
                {passengers.map((p, i) => (
                  <PassengerBlock
                    key={p.pid}
                    idx={i}
                    data={p}
                    isFamily={isFamily}
                    showCertPrompt={false}
                    fieldErrors={passengerErrors[p.pid]}
                    onChange={(f, v) => updatePassenger(i, f, v)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={addPassenger}
                  data-ocid="add-passenger-btn"
                >
                  <User className="w-4 h-4" />+ Add Another Passenger
                </Button>
                <Button
                  className="w-full bg-primary text-primary-foreground font-bold py-6 text-base gap-2"
                  onClick={handleStep1Continue}
                  data-ocid="step1-continue-btn"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in" data-ocid="step-2">
                <h2 className="font-display font-bold text-lg text-foreground">
                  Contact Information
                </h2>
                <Card className="border-border">
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Email Address *</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => {
                            setContact({ ...contact, email: e.target.value });
                            if (contactErrors.email)
                              setContactErrors({ ...contactErrors, email: "" });
                          }}
                          className={
                            contactErrors.email ? "border-red-500" : ""
                          }
                          data-ocid="contact-email"
                        />
                        <FieldError msg={contactErrors.email} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone Number *</Label>
                        <Input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => {
                            setContact({ ...contact, phone: e.target.value });
                            if (contactErrors.phone)
                              setContactErrors({ ...contactErrors, phone: "" });
                          }}
                          className={
                            contactErrors.phone ? "border-red-500" : ""
                          }
                          data-ocid="contact-phone"
                        />
                        <FieldError msg={contactErrors.phone} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Address *</Label>
                      <Textarea
                        rows={2}
                        value={contact.address}
                        onChange={(e) => {
                          setContact({ ...contact, address: e.target.value });
                          if (contactErrors.address)
                            setContactErrors({ ...contactErrors, address: "" });
                        }}
                        className={
                          contactErrors.address ? "border-red-500" : ""
                        }
                      />
                      <FieldError msg={contactErrors.address} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">City *</Label>
                        <Input
                          value={contact.city}
                          onChange={(e) => {
                            setContact({ ...contact, city: e.target.value });
                            if (contactErrors.city)
                              setContactErrors({ ...contactErrors, city: "" });
                          }}
                          className={contactErrors.city ? "border-red-500" : ""}
                        />
                        <FieldError msg={contactErrors.city} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">PIN Code *</Label>
                        <Input
                          value={contact.pin}
                          onChange={(e) => {
                            setContact({ ...contact, pin: e.target.value });
                            if (contactErrors.pin)
                              setContactErrors({ ...contactErrors, pin: "" });
                          }}
                          maxLength={6}
                          className={`font-mono ${contactErrors.pin ? "border-red-500" : ""}`}
                        />
                        <FieldError msg={contactErrors.pin} />
                      </div>
                    </div>
                    <Separator />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Emergency Contact
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                          value={contact.emergencyName}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              emergencyName: e.target.value,
                            });
                            if (contactErrors.emergencyName)
                              setContactErrors({
                                ...contactErrors,
                                emergencyName: "",
                              });
                          }}
                          className={
                            contactErrors.emergencyName ? "border-red-500" : ""
                          }
                          data-ocid="emergency-name"
                        />
                        <FieldError msg={contactErrors.emergencyName} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone *</Label>
                        <Input
                          type="tel"
                          value={contact.emergencyPhone}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              emergencyPhone: e.target.value,
                            });
                            if (contactErrors.emergencyPhone)
                              setContactErrors({
                                ...contactErrors,
                                emergencyPhone: "",
                              });
                          }}
                          className={
                            contactErrors.emergencyPhone ? "border-red-500" : ""
                          }
                          data-ocid="emergency-phone"
                        />
                        <FieldError msg={contactErrors.emergencyPhone} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  className="w-full bg-primary text-primary-foreground font-bold py-6 text-base gap-2"
                  onClick={handleStep2Continue}
                  data-ocid="step2-continue-btn"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* STEP 3 — Payment */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in" data-ocid="step-3">
                {/* Final trip summary before payment form */}
                <FinalTripSummary
                  plan={{ name: plan.name, days: plan.days, price: plan.price }}
                  flight={flightSelection}
                  hotel={hotelSelection}
                  cert={certInfo}
                  total={total}
                  destination={destination}
                  travelers={travelers}
                />

                <h2 className="font-display font-bold text-lg text-foreground">
                  Payment Method
                </h2>

                {/* Method grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      key: "card" as PayMethod,
                      label: "Credit / Debit Card",
                      sub: "Visa · Mastercard · RuPay",
                      icon: <CreditCard className="w-5 h-5" />,
                    },
                    {
                      key: "upi" as PayMethod,
                      label: "UPI",
                      sub: "Any UPI ID",
                      icon: <Smartphone className="w-5 h-5" />,
                    },
                    {
                      key: "netbanking" as PayMethod,
                      label: "Net Banking",
                      sub: "All major banks",
                      icon: <Building2 className="w-5 h-5" />,
                    },
                    {
                      key: "googlepay" as PayMethod,
                      label: "Google Pay",
                      sub: "Scan QR or Transfer",
                      icon: (
                        <span className="text-sm font-black text-green-600 dark:text-green-400">
                          G Pay
                        </span>
                      ),
                    },
                    {
                      key: "phonepe" as PayMethod,
                      label: "PhonePe",
                      sub: "Scan QR or Transfer",
                      icon: (
                        <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                          Ph Pe
                        </span>
                      ),
                    },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.key);
                        setUpiSubMode(null);
                        setErrors({});
                      }}
                      className={`rounded-xl border-2 p-3 text-center transition-smooth ${paymentMethod === m.key ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/50"}`}
                      data-ocid={`pay-method-${m.key}`}
                    >
                      <div
                        className={`mx-auto mb-1.5 flex justify-center ${paymentMethod === m.key ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {m.icon}
                      </div>
                      <p className="text-xs font-semibold leading-tight">
                        {m.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.sub}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Card form */}
                {paymentMethod === "card" && (
                  <Card
                    className="border-border animate-fade-in"
                    data-ocid="card-form"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Card Number *</Label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={cardNo}
                          onChange={(e) => {
                            setCardNo(formatCard(e.target.value));
                            if (errors.cardNo)
                              setErrors({ ...errors, cardNo: "" });
                          }}
                          className={`font-mono tracking-widest ${errors.cardNo ? "border-red-500" : ""}`}
                          maxLength={19}
                          data-ocid="card-number"
                        />
                        <FieldError msg={errors.cardNo} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Expiry Month *</Label>
                          <select
                            value={expMonth}
                            onChange={(e) => {
                              setExpMonth(e.target.value);
                              if (errors.expiry)
                                setErrors({ ...errors, expiry: "" });
                            }}
                            className={`w-full h-9 rounded-md border bg-background text-foreground px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring ${errors.expiry ? "border-red-500" : "border-input"}`}
                          >
                            {MONTHS.map((m) => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Expiry Year *</Label>
                          <select
                            value={expYear}
                            onChange={(e) => {
                              setExpYear(e.target.value);
                              if (errors.expiry)
                                setErrors({ ...errors, expiry: "" });
                            }}
                            className={`w-full h-9 rounded-md border bg-background text-foreground px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring ${errors.expiry ? "border-red-500" : "border-input"}`}
                          >
                            {YEARS.map((y) => (
                              <option key={y}>{y}</option>
                            ))}
                          </select>
                          <FieldError msg={errors.expiry} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">CVV *</Label>
                          <Input
                            type="password"
                            placeholder="•••"
                            value={cvv}
                            onChange={(e) => {
                              setCvv(
                                e.target.value.replace(/\D/g, "").slice(0, 4),
                              );
                              if (errors.cvv) setErrors({ ...errors, cvv: "" });
                            }}
                            className={`font-mono ${errors.cvv ? "border-red-500" : ""}`}
                            maxLength={4}
                            data-ocid="cvv-input"
                          />
                          <FieldError msg={errors.cvv} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cardholder Name *</Label>
                        <Input
                          placeholder="JOHN DOE"
                          value={cardName}
                          onChange={(e) => {
                            setCardName(e.target.value.toUpperCase());
                            if (errors.cardName)
                              setErrors({ ...errors, cardName: "" });
                          }}
                          className={`uppercase font-mono ${errors.cardName ? "border-red-500" : ""}`}
                          data-ocid="card-name"
                        />
                        <FieldError msg={errors.cardName} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* UPI form */}
                {paymentMethod === "upi" && (
                  <Card
                    className="border-border animate-fade-in"
                    data-ocid="upi-form"
                  >
                    <CardContent className="p-5 space-y-1">
                      <Label className="text-xs">UPI ID *</Label>
                      <Input
                        placeholder="9999999999@upi"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          if (errors.upiId) setErrors({ ...errors, upiId: "" });
                        }}
                        className={errors.upiId ? "border-red-500" : ""}
                        data-ocid="upi-id"
                      />
                      <FieldError msg={errors.upiId} />
                    </CardContent>
                  </Card>
                )}

                {/* Net Banking */}
                {paymentMethod === "netbanking" && (
                  <Card
                    className="border-border animate-fade-in"
                    data-ocid="netbanking-form"
                  >
                    <CardContent className="p-5 space-y-1">
                      <Label className="text-xs">Select Bank</Label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        data-ocid="bank-select"
                      >
                        {[
                          "SBI",
                          "HDFC",
                          "ICICI",
                          "Axis",
                          "Kotak",
                          "PNB",
                          "Yes Bank",
                          "Canara",
                          "Union Bank",
                          "Bank of Baroda",
                        ].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </CardContent>
                  </Card>
                )}

                {/* Google Pay / PhonePe */}
                {(gpayActive || phonepeActive) && (
                  <Card
                    className="border-border animate-fade-in"
                    data-ocid="upi-app-form"
                  >
                    <CardContent className="p-5 space-y-4">
                      <p className="text-sm font-bold text-foreground">
                        Choose payment method for {upiProvider}:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setUpiSubMode("qr");
                            if (errors.upiSubMode)
                              setErrors({ ...errors, upiSubMode: "" });
                          }}
                          className={`rounded-xl border-2 p-4 text-center transition-smooth ${upiSubMode === "qr" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                          data-ocid="upi-qr-btn"
                        >
                          <div className="text-2xl mb-1">📷</div>
                          <p className="text-sm font-semibold text-foreground">
                            QR Code
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scan to pay
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpiSubMode("transfer");
                            if (errors.upiSubMode)
                              setErrors({ ...errors, upiSubMode: "" });
                          }}
                          className={`rounded-xl border-2 p-4 text-center transition-smooth ${upiSubMode === "transfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                          data-ocid="upi-transfer-btn"
                        >
                          <div className="text-2xl mb-1">🏦</div>
                          <p className="text-sm font-semibold text-foreground">
                            Bank Transfer
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Manual transfer
                          </p>
                        </button>
                      </div>
                      <FieldError msg={errors.upiSubMode} />
                      {upiSubMode === "qr" && (
                        <DummyQR provider={upiProvider} amount={total} />
                      )}
                      {upiSubMode === "transfer" && (
                        <BankDetails amount={total} />
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/60 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                  <Shield className="w-4 h-4 shrink-0" />🔒 Secure Payment —
                  Your payment information is encrypted
                </div>

                <Button
                  className={`w-full bg-primary text-primary-foreground font-bold py-6 text-base ${hasPayErrors ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handlePay}
                  data-ocid="pay-btn"
                >
                  {(gpayActive || phonepeActive) && upiSubMode === "qr"
                    ? "Payment Done"
                    : (gpayActive || phonepeActive) && upiSubMode === "transfer"
                      ? "I've Transferred"
                      : `Pay ${formatCurrency(total)}`}
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT — summary sidebar */}
          <div className="lg:sticky lg:top-4 self-start">
            <BookingSummary
              plan={{
                name: plan.name,
                days: plan.days,
                price: plan.price,
                travelers,
              }}
              flightCost={flightCost}
              hotelCost={hotelCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline Booking Confirmation (shown after successful payment) ────────────
function BookingConfirmationInline({
  bookingRef,
  destination,
  travelers,
  days,
  totalCost,
  costPerPerson,
  passengerNames,
  contactEmail,
  contactPhone,
  paymentMethod,
  flight,
  hotel,
  cert,
  planWantsCertificate,
}: {
  bookingRef: string;
  destination: string;
  travelers: number;
  days: number;
  totalCost: number;
  costPerPerson: number;
  passengerNames?: string[];
  contactEmail?: string;
  contactPhone?: string;
  paymentMethod?: string;
  flight: FlightSelection | null;
  hotel: HotelSelection | null;
  cert: CertificateInfo | null;
  planWantsCertificate: boolean;
}) {
  return (
    <Card
      className="border-green-300 dark:border-green-700 bg-green-50/60 dark:bg-green-950/20 text-left"
      data-ocid="booking-confirmation"
    >
      <CardContent className="p-6 space-y-4">
        {/* Booking ID */}
        <div className="flex items-center gap-3 rounded-lg bg-background border border-border p-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Booking Reference</p>
            <p className="font-mono font-bold text-lg tracking-wider text-primary">
              {bookingRef}
            </p>
          </div>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/40 shrink-0">
            Confirmed
          </span>
        </div>

        {/* Trip overview */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="font-semibold">{destination}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold">{days} days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Travelers</p>
            <p className="font-semibold">
              {travelers} {travelers === 1 ? "person" : "people"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="font-bold text-primary">
              {formatCurrency(totalCost)}
            </p>
          </div>
        </div>

        {/* Passengers */}
        {passengerNames && passengerNames.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Passengers
              </p>
              <div className="space-y-1">
                {passengerNames.map((name, idx) => (
                  <p
                    key={`pax-${name || idx}`}
                    className="text-sm text-foreground"
                  >
                    • {name}
                  </p>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Flight details */}
        {flight && (
          <>
            <Separator />
            <div data-ocid="confirmation-flight">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Plane className="w-3.5 h-3.5" /> Your Flight
              </p>
              <div className="rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Airline</span>
                  <span className="font-semibold text-foreground">
                    {flight.airline}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flight No.</span>
                  <span className="font-mono font-semibold text-foreground">
                    {flight.flightNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-semibold text-foreground">
                    {flight.departure} → {flight.arrival}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departure</span>
                  <span className="font-semibold text-foreground">
                    {flight.departureTime}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground shrink-0">Seat</span>
                  <span className="ml-2 text-right">
                    <SeatBadges flight={flight} />
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hotel details */}
        {hotel && (
          <>
            <Separator />
            <div data-ocid="confirmation-hotel">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Hotel className="w-3.5 h-3.5" /> Your Hotel
              </p>
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hotel</span>
                  <span className="font-semibold text-foreground">
                    {hotel.hotelName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-semibold text-foreground">
                    {hotel.roomType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bed Type</span>
                  <span className="font-semibold text-foreground">
                    {hotel.bedType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-semibold text-foreground">
                    ₹{hotel.pricePerNight.toLocaleString()}/night
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hotel Total</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    ₹{hotel.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Baby Certificate */}
        {(cert?.wantsCertificate || planWantsCertificate) && (
          <>
            <Separator />
            <div data-ocid="confirmation-certificate">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                🎓 Baby Flight Certificate
              </p>
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-700/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 space-y-1 text-sm">
                {cert?.certBabyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Baby Name</span>
                    <span className="font-semibold text-foreground">
                      {cert.certBabyName}
                    </span>
                  </div>
                )}
                {cert?.certDesign && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Design Selected
                    </span>
                    <span className="font-semibold text-foreground">
                      {cert.certDesign}
                    </span>
                  </div>
                )}
                <p className="text-xs text-indigo-600 dark:text-indigo-400 pt-1">
                  Certificate will be included with your booking confirmation.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Child under 5 */}
        {cert?.childUnder5 && (
          <>
            <Separator />
            <div
              className="flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-700/40 bg-green-50/40 dark:bg-green-950/20 px-4 py-3"
              data-ocid="confirmation-child-under5"
            >
              <span className="text-base">👶</span>
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Child Under 5 Requirements
                </p>
                <p className="text-xs text-muted-foreground">
                  Special in-flight requirements have been applied for your
                  child.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Cost summary */}
        <Separator />
        <div className="space-y-1.5 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Cost Breakdown
          </p>
          <div className="flex justify-between text-muted-foreground">
            <span>
              Plan cost ({travelers}{" "}
              {travelers === 1 ? "traveler" : "travelers"})
            </span>
            <span>{formatCurrency(costPerPerson * travelers)}</span>
          </div>
          {flight && (
            <div className="flex justify-between text-blue-600 dark:text-blue-400">
              <span>✈ Flight</span>
              <span>{formatCurrency(flight.totalPrice)}</span>
            </div>
          )}
          {hotel && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>🏨 Hotel</span>
              <span>{formatCurrency(hotel.totalCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Taxes (18%)</span>
            <span>{formatCurrency(Math.round((totalCost / 1.18) * 0.18))}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total Paid</span>
            <span className="text-primary">{formatCurrency(totalCost)}</span>
          </div>
        </div>

        {paymentMethod && (
          <p className="text-xs text-muted-foreground">
            Payment via:{" "}
            <strong className="text-foreground">{paymentMethod}</strong>
          </p>
        )}
        {contactEmail && (
          <p className="text-xs text-muted-foreground">
            Contact: <strong className="text-foreground">{contactEmail}</strong>
            {contactPhone ? ` · ${contactPhone}` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
