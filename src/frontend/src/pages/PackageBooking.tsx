/**
 * PackageBooking — /package-booking
 * R2: Family booking — per-passenger Adult/Child toggle + First-Time Certificate.
 * R3: Google Pay + PhonePe with QR / Bank Transfer options.
 * R4: Full validation on Step 1, Step 2, and Step 3 payment form.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useBookings } from "@/hooks/useBookings";
import { useSession } from "@/hooks/useSession";
import type { BookingDetails } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PackageData {
  id: string;
  name: string;
  destination: string;
  pricePerPerson: number;
  duration: number;
}

interface TripDetails {
  numPeople: number;
  petFriendly: boolean;
  numDays: number;
  travelDate: string;
  pkg: PackageData;
  isFamily?: boolean;
}

interface PassengerForm {
  pid: string;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
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
  emergencyName: string;
  emergencyPhone: string;
}

type PassengerFieldErrors = Record<string, string>;
type PassengerErrors = Record<string, PassengerFieldErrors>;

type PayMethod = "card" | "upi" | "netbanking" | "googlepay" | "phonepe";
type UpiSubMode = "qr" | "transfer" | null;

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
];

const emptyPassenger = (): PassengerForm => ({
  pid: `pax-${Date.now()}-${Math.random()}`,
  title: "Mr",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  nationality: "India",
  email: "",
  phone: "",
  passengerType: "adult",
  firstTimeCert: false,
});

// ── Validation helpers ─────────────────────────────────────────────────────
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isValidPhone(v: string) {
  return /^\d{10}$/.test(v.replace(/[\s+\-()]/g, ""));
}
function isPastDate(v: string) {
  if (!v) return false;
  return new Date(v) < new Date();
}

function validatePassenger(p: PassengerForm): PassengerFieldErrors {
  const errs: PassengerFieldErrors = {};
  if (!p.firstName.trim()) errs.firstName = "First name is required";
  if (!p.lastName.trim()) errs.lastName = "Last name is required";
  if (!p.dob) errs.dob = "Date of birth is required";
  else if (!isPastDate(p.dob)) errs.dob = "Must be a valid past date";
  if (!p.nationality) errs.nationality = "Nationality is required";
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
  if (!c.emergencyName.trim())
    errs.emergencyName = "Emergency contact name is required";
  if (!c.emergencyPhone.trim())
    errs.emergencyPhone = "Valid emergency phone required";
  else if (!isValidPhone(c.emergencyPhone))
    errs.emergencyPhone = "Valid emergency phone required";
  return errs;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

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
        ⚠️ This is a simulated bank transfer.
      </p>
    </div>
  );
}

export default function PackageBooking() {
  const navigate = useNavigate();
  const { addBooking, saveToBackend } = useBookings();
  const { session } = useSession();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);

  const [passengers, setPassengers] = useState<PassengerForm[]>([
    emptyPassenger(),
  ]);
  const [contact, setContact] = useState<ContactForm>({
    email: "",
    phone: "",
    address: "",
    city: "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const contactSynced = useRef(false);

  // Validation state
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

  useEffect(() => {
    const raw = sessionStorage.getItem("packageTripDetails");
    if (raw) {
      try {
        const details = JSON.parse(raw) as TripDetails;
        setTripDetails(details);
        // Initialize passengers to match traveler count
        const count = Math.max(1, details.numPeople);
        setPassengers(Array.from({ length: count }, () => emptyPassenger()));
      } catch {
        navigate({ to: "/package-tours" });
      }
    } else {
      navigate({ to: "/package-tours" });
    }
  }, [navigate]);

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

  if (!tripDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const { numPeople, numDays, pkg, isFamily } = tripDetails;
  const subtotal = pkg.pricePerPerson * numPeople;
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + taxes;

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
        [passengers[idx].pid]: {
          ...prev[passengers[idx].pid],
          [field]: "",
        },
      }));
    }
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

  function formatCard(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
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

  async function handlePay() {
    setPaySubmitAttempted(true);
    if (!validatePayment()) return;
    setProcessing(true);
    await new Promise((res) => setTimeout(res, 2200));
    const ref = `PKG-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(ref);
    const booking: BookingDetails = {
      id: ref,
      destination: pkg.destination,
      travelers: numPeople,
      days: numDays,
      tourType: "package",
      totalCost: total,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      reference: ref,
      paymentRef: ref,
      costPerPerson: pkg.pricePerPerson,
    };
    addBooking(booking);
    saveToBackend({
      ...booking,
      userId: session?.userId ?? "guest",
      startDate:
        tripDetails?.travelDate || new Date().toISOString().split("T")[0],
    })
      .then((canisterId) => {
        if (canisterId != null) addBooking({ ...booking, canisterId });
      })
      .catch((err) => console.error("[PackageBooking] backend save:", err));
    setProcessing(false);
    setConfirmed(true);
  }

  const gpayActive = paymentMethod === "googlepay";
  const phonepeActive = paymentMethod === "phonepe";
  const upiProvider: "Google Pay" | "PhonePe" = gpayActive
    ? "Google Pay"
    : "PhonePe";
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6 text-center animate-slide-up">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-hero">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-bold text-3xl text-foreground">
              Package Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your package tour has been successfully booked
            </p>
          </div>
          <Card className="border-border shadow-elevated text-left">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Booking ID
                </span>
                <span className="font-mono font-bold text-primary text-lg">
                  {bookingId}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-medium text-sm">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Destination
                </span>
                <span className="font-medium text-sm">{pkg.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Travelers</span>
                <span className="font-medium">
                  {numPeople} {numPeople > 1 ? "people" : "person"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Amount
                </span>
                <span className="font-bold text-foreground">
                  ₹{total.toLocaleString()}
                </span>
              </div>
              {passengers.some((p) => p.firstTimeCert) && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                  🎓 First-Time Travel Certificate(s) included.
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: "/booking-history" })}
            >
              View Bookings
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground font-bold"
              onClick={() => navigate({ to: "/" })}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
            Package Booking
          </h1>
          <p className="text-muted-foreground text-sm">
            {pkg.name} · {pkg.destination} · {numDays} Days
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <StepIndicator step={step} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Passenger Details
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {passengers.length} / {numPeople} passenger
                    {numPeople !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Family booking banner */}
                {isFamily && (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3"
                    data-ocid="pkg-family-banner"
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

                {passengers.map((p, i) => {
                  const isChild = p.passengerType === "child";
                  const pErrs = passengerErrors[p.pid] ?? {};
                  return (
                    <div
                      key={p.pid}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      {/* Passenger header */}
                      <div className="flex items-center gap-2 px-5 py-3 bg-muted/40 border-b border-border">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="font-semibold text-sm text-foreground">
                          Passenger {i + 1}
                          {i === 0 && (
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
                        {/* Adult/Child toggle — prominent for family bookings */}
                        {isFamily && (
                          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-2">
                            <p className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                              <span>👨‍👩‍👧‍👦</span> Select Passenger Type
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  updatePassenger(i, "passengerType", "adult")
                                }
                                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isChild ? "border-blue-500 bg-blue-500 text-white shadow-md" : "border-border bg-background text-foreground hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"}`}
                                data-ocid={`pkg-p${i}-type-adult`}
                              >
                                <span className="text-base">👨</span> Adult
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updatePassenger(i, "passengerType", "child")
                                }
                                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${isChild ? "border-violet-500 bg-violet-500 text-white shadow-md" : "border-border bg-background text-foreground hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"}`}
                                data-ocid={`pkg-p${i}-type-child`}
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
                              value={p.title}
                              onChange={(e) =>
                                updatePassenger(i, "title", e.target.value)
                              }
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                            >
                              {["Mr", "Mrs", "Ms", "Dr"].map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Gender</Label>
                            <select
                              value={p.gender}
                              onChange={(e) =>
                                updatePassenger(i, "gender", e.target.value)
                              }
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
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
                              value={p.firstName}
                              onChange={(e) =>
                                updatePassenger(i, "firstName", e.target.value)
                              }
                              className={
                                pErrs.firstName ? "border-red-500" : ""
                              }
                            />
                            <FieldError msg={pErrs.firstName} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Last Name *</Label>
                            <Input
                              placeholder="Doe"
                              value={p.lastName}
                              onChange={(e) =>
                                updatePassenger(i, "lastName", e.target.value)
                              }
                              className={pErrs.lastName ? "border-red-500" : ""}
                            />
                            <FieldError msg={pErrs.lastName} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Date of Birth *</Label>
                            <Input
                              type="date"
                              value={p.dob}
                              onChange={(e) =>
                                updatePassenger(i, "dob", e.target.value)
                              }
                              className={pErrs.dob ? "border-red-500" : ""}
                            />
                            <FieldError msg={pErrs.dob} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nationality *</Label>
                            <select
                              value={p.nationality}
                              onChange={(e) =>
                                updatePassenger(
                                  i,
                                  "nationality",
                                  e.target.value,
                                )
                              }
                              className={`w-full h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground ${pErrs.nationality ? "border-red-500" : "border-input"}`}
                            >
                              {NATIONALITIES.map((n) => (
                                <option key={n}>{n}</option>
                              ))}
                            </select>
                            <FieldError msg={pErrs.nationality} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Email *</Label>
                            <Input
                              type="email"
                              placeholder="john@email.com"
                              value={p.email}
                              onChange={(e) =>
                                updatePassenger(i, "email", e.target.value)
                              }
                              className={pErrs.email ? "border-red-500" : ""}
                            />
                            <FieldError msg={pErrs.email} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Phone *</Label>
                            <Input
                              type="tel"
                              placeholder="+91 9876543210"
                              value={p.phone}
                              onChange={(e) =>
                                updatePassenger(i, "phone", e.target.value)
                              }
                              className={pErrs.phone ? "border-red-500" : ""}
                            />
                            <FieldError msg={pErrs.phone} />
                          </div>
                        </div>

                        {/* First-Time Travel Certificate — prominent for children */}
                        {isFamily && isChild && (
                          <div
                            className="rounded-xl border-2 border-indigo-300 dark:border-indigo-600/60 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-4 space-y-3"
                            data-ocid={`pkg-p${i}-cert-section`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">🎓</span>
                              <div>
                                <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                                  First-Time Travel Certificate
                                </p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                  Mark this child's first journey with a special
                                  keepsake
                                </p>
                              </div>
                            </div>
                            <label
                              className="flex items-start gap-3 cursor-pointer group"
                              data-ocid={`pkg-p${i}-first-time-cert`}
                            >
                              <div
                                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${p.firstTimeCert ? "bg-indigo-600 border-indigo-600" : "border-indigo-300 dark:border-indigo-600 bg-white dark:bg-indigo-950/50 group-hover:border-indigo-500"}`}
                              >
                                {p.firstTimeCert && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={p.firstTimeCert}
                                  onChange={(e) =>
                                    updatePassenger(
                                      i,
                                      "firstTimeCert",
                                      e.target.checked,
                                    )
                                  }
                                  className="sr-only"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                                  Yes, generate a First-Time Travel Certificate
                                  📜
                                </p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                                  A personalized commemorative certificate to
                                  mark this child's very first travel memory
                                </p>
                              </div>
                            </label>
                            {p.firstTimeCert && (
                              <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700/50 rounded-lg px-3 py-2">
                                <span className="text-base">✅</span>
                                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                  Certificate included! Will be sent with your
                                  booking confirmation.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() =>
                    setPassengers((prev) => [...prev, emptyPassenger()])
                  }
                  data-ocid="pkg-add-passenger-btn"
                >
                  <User className="w-4 h-4" />+ Add Another Passenger
                </Button>
                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground font-bold py-6 text-base gap-2"
                  onClick={handleStep1Continue}
                  data-ocid="pkg-step1-continue"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
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
                        />
                        <FieldError msg={contactErrors.emergencyPhone} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  className="w-full bg-primary text-primary-foreground font-bold py-6 text-base gap-2"
                  onClick={handleStep2Continue}
                  data-ocid="pkg-step2-continue"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display font-bold text-lg text-foreground">
                  Payment Method
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      key: "card" as PayMethod,
                      label: "Credit / Debit Card",
                      sub: "Visa · Mastercard",
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
                      sub: "QR or Transfer",
                      icon: (
                        <span className="text-sm font-black text-green-600 dark:text-green-400">
                          G Pay
                        </span>
                      ),
                    },
                    {
                      key: "phonepe" as PayMethod,
                      label: "PhonePe",
                      sub: "QR or Transfer",
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
                      data-ocid={`pkg-pay-${m.key}`}
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
                {paymentMethod === "card" && (
                  <Card className="border-border animate-fade-in">
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
                          data-ocid="pkg-card-number"
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
                            className={`w-full h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground ${errors.expiry ? "border-red-500" : "border-input"}`}
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
                            className={`w-full h-9 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground ${errors.expiry ? "border-red-500" : "border-input"}`}
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
                            data-ocid="pkg-cvv"
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
                          data-ocid="pkg-card-name"
                        />
                        <FieldError msg={errors.cardName} />
                      </div>
                    </CardContent>
                  </Card>
                )}
                {paymentMethod === "upi" && (
                  <Card className="border-border animate-fade-in">
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
                        data-ocid="pkg-upi-id"
                      />
                      <FieldError msg={errors.upiId} />
                    </CardContent>
                  </Card>
                )}
                {paymentMethod === "netbanking" && (
                  <Card className="border-border animate-fade-in">
                    <CardContent className="p-5 space-y-1">
                      <Label className="text-xs">Select Bank</Label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                        data-ocid="pkg-bank-select"
                      >
                        {[
                          "SBI",
                          "HDFC",
                          "ICICI",
                          "Axis",
                          "Kotak",
                          "PNB",
                          "Yes Bank",
                        ].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </CardContent>
                  </Card>
                )}
                {(gpayActive || phonepeActive) && (
                  <Card className="border-border animate-fade-in">
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
                          data-ocid="pkg-upi-qr-btn"
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
                          data-ocid="pkg-upi-transfer-btn"
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
                  <Shield className="w-4 h-4 shrink-0" /> 🔒 Secure Payment —
                  Your information is encrypted
                </div>
                <Button
                  className={`w-full bg-primary text-primary-foreground font-bold py-6 text-base ${hasPayErrors ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handlePay}
                  data-ocid="pkg-pay-btn"
                >
                  {(gpayActive || phonepeActive) && upiSubMode === "qr"
                    ? "Payment Done"
                    : (gpayActive || phonepeActive) && upiSubMode === "transfer"
                      ? "I've Transferred"
                      : `Pay ₹${total.toLocaleString()}`}
                </Button>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-4 self-start">
            <Card className="border-border shadow-elevated">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl" />
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-semibold text-foreground leading-tight">
                  {pkg.name}
                </p>
                <p className="text-muted-foreground">
                  {pkg.destination} · {numDays} Days
                </p>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Price per person</span>
                    <span>₹{pkg.pricePerPerson.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Travelers</span>
                    <span>{numPeople}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes (18%)</span>
                    <span>₹{taxes.toLocaleString()}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
