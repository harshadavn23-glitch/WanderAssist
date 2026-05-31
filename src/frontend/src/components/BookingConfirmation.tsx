import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SurprisePlan } from "@/types/travel";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Calendar,
  CheckCircle2,
  Download,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Receipt,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { CancellationModal } from "./CancellationModal";

interface FlightDetails {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime?: string;
  seatNumber: string;
  seatNumbers?: string[];
  seatClass: string;
  pricePerPerson?: number;
  totalPrice: number;
}

interface HotelDetails {
  hotelName: string;
  starRating?: number;
  location?: string;
  roomType: string;
  bedType?: string;
  pricePerNight: number;
  totalCost: number;
  amenities?: string[];
}

interface CertificateDetails {
  wantsCertificate: boolean;
  certBabyName?: string;
  certBabyAgeInput?: string;
  certDesign?: string;
  childUnder5: boolean;
}

interface BookingConfirmationProps {
  bookingRef: string;
  destination: string;
  travelers: number;
  days: number;
  totalCost: number;
  costPerPerson: number;
  travelStyle: string;
  specialRequests: string;
  surprisePlan?: SurprisePlan | null;
  passengerNames?: string[];
  contactEmail?: string;
  contactPhone?: string;
  travelDate?: string;
  paymentMethod?: string;
  guideName?: string;
  onCancelled?: () => void;
  // New: flight, hotel, certificate
  flight?: FlightDetails | null;
  hotel?: HotelDetails | null;
  cert?: CertificateDetails | null;
}

export function BookingConfirmation({
  bookingRef,
  destination,
  travelers,
  days,
  totalCost,
  costPerPerson,
  travelStyle,
  specialRequests,
  surprisePlan,
  passengerNames,
  contactEmail,
  contactPhone,
  travelDate,
  paymentMethod,
  guideName,
  onCancelled,
  flight,
  hotel,
  cert,
}: BookingConfirmationProps) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  async function handleDownloadPDF() {
    if (pdfGenerating) return;
    setPdfGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = 0;

      // ── Header ──────────────────────────────────────────────────────────
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("WanderAssist", margin, 12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Booking Confirmation — wanderassist.app", margin, 20);

      y = 38;

      // ── Confirmation title ───────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(22, 163, 74); // green-600
      doc.text("✓  Booking Confirmed!", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text("Your trip is all set. Safe travels!", margin, y);
      y += 5;
      doc.setDrawColor(209, 213, 219);
      doc.line(margin, y + 2, pageW - margin, y + 2);
      y += 10;

      // ── Booking reference ───────────────────────────────────────────────
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y, contentW, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text("Booking Reference:", margin + 4, y + 7);
      doc.setFont("courier", "bold");
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(bookingRef, margin + 52, y + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(22, 163, 74);
      doc.text("Status: CONFIRMED", margin + 4, y + 13);
      y += 22;

      // ── Trip details ─────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("Trip Details", margin, y);
      y += 7;

      const details: Array<[string, string]> = [
        ["Destination", destination],
        ["Duration", `${days} day${days > 1 ? "s" : ""}`],
        ["Travelers", `${travelers} ${travelers === 1 ? "person" : "people"}`],
        ["Travel Style", travelStyle],
      ];
      if (travelDate) details.push(["Travel Date", travelDate]);
      if (guideName) details.push(["Assigned Guide", guideName]);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const [label, value] of details) {
        doc.setTextColor(107, 114, 128);
        doc.text(`${label}:`, margin + 2, y);
        doc.setTextColor(17, 24, 39);
        doc.text(value, margin + 48, y);
        y += 6;
      }
      y += 4;

      // ── Passengers ──────────────────────────────────────────────────────
      if (passengerNames && passengerNames.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        doc.text("Passengers", margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        for (const name of passengerNames) {
          doc.text(`• ${name}`, margin + 2, y);
          y += 5.5;
        }
        y += 4;
      }

      // ── Contact Info ────────────────────────────────────────────────────
      if (contactEmail || contactPhone) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        doc.text("Contact Information", margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        if (contactEmail) {
          doc.text(`Email: ${contactEmail}`, margin + 2, y);
          y += 5.5;
        }
        if (contactPhone) {
          doc.text(`Phone: ${contactPhone}`, margin + 2, y);
          y += 5.5;
        }
        y += 4;
      }

      // ── Cost breakdown ──────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("Cost Breakdown", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text("Base cost / person:", margin + 2, y);
      doc.text(`INR ${costPerPerson.toLocaleString()}`, pageW - margin - 2, y, {
        align: "right",
      });
      y += 5.5;
      doc.text(
        `${travelers} traveler${travelers > 1 ? "s" : ""} × INR ${costPerPerson.toLocaleString()}:`,
        margin + 2,
        y,
      );
      doc.text(
        `INR ${(costPerPerson * travelers).toLocaleString()}`,
        pageW - margin - 2,
        y,
        { align: "right" },
      );
      y += 5.5;
      doc.setTextColor(107, 114, 128);
      doc.text("Taxes & Fees (18%):", margin + 2, y);
      doc.text(
        `INR ${Math.round(costPerPerson * travelers * 0.18).toLocaleString()}`,
        pageW - margin - 2,
        y,
        { align: "right" },
      );
      y += 5.5;
      if (surprisePlan) {
        doc.setTextColor(37, 99, 235);
        doc.text(
          `Surprise Plan (${surprisePlan.bookingCode ?? surprisePlan.code}):`,
          margin + 2,
          y,
        );
        doc.text(
          `+ INR ${surprisePlan.cost.toLocaleString()}`,
          pageW - margin - 2,
          y,
          { align: "right" },
        );
        y += 5.5;
      }
      // Total
      doc.setDrawColor(209, 213, 219);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text("Total Paid:", margin + 2, y);
      doc.setTextColor(37, 99, 235);
      doc.text(`INR ${totalCost.toLocaleString()}`, pageW - margin - 2, y, {
        align: "right",
      });
      y += 8;

      // ── Payment method ──────────────────────────────────────────────────
      if (paymentMethod) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Payment Method: ${paymentMethod}`, margin + 2, y);
        y += 8;
      }

      // ── Surprise plan details ───────────────────────────────────────────
      if (surprisePlan) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        doc.text("Surprise Plan Details", margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        const descLines = doc.splitTextToSize(
          surprisePlan.description,
          contentW - 4,
        ) as string[];
        doc.text(descLines, margin + 2, y);
        y += descLines.length * 5 + 4;
        for (const item of surprisePlan.itinerary.slice(0, 5)) {
          doc.text(`• ${item}`, margin + 4, y);
          y += 5;
        }
        if (surprisePlan.itinerary.length > 5) {
          doc.setTextColor(107, 114, 128);
          doc.text(
            `+ ${surprisePlan.itinerary.length - 5} more days…`,
            margin + 4,
            y,
          );
          y += 5;
        }
        y += 4;
      }

      // ── Special requests ────────────────────────────────────────────────
      if (specialRequests.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        doc.text("Special Requests", margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        const reqLines = doc.splitTextToSize(
          specialRequests,
          contentW - 4,
        ) as string[];
        doc.text(reqLines, margin + 2, y);
        y += reqLines.length * 5 + 6;
      }

      // ── Footer ──────────────────────────────────────────────────────────
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
          `WanderAssist  •  wanderassist.app  •  Booking ${bookingRef}  •  Page ${i} of ${pageCount}`,
          margin,
          footerY,
        );
      }

      const fileName = `WanderAssist_Itinerary_${destination.replace(/\s+/g, "_")}_${bookingRef}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("[BookingConfirmation] PDF generation failed:", err);
    } finally {
      setPdfGenerating(false);
    }
  }

  function handleCancelled() {
    setCancelled(true);
    onCancelled?.();
  }

  function handleCancelModalClose() {
    // Check if booking was cancelled in localStorage
    try {
      const stored = localStorage.getItem("wanderassist-bookings");
      if (stored) {
        const bookings = JSON.parse(stored) as Array<{
          bookingRef?: string;
          bookingReference?: string;
          status?: string;
        }>;
        const booking = bookings.find(
          (b) =>
            b.bookingRef === bookingRef || b.bookingReference === bookingRef,
        );
        if (booking?.status === "cancelled") handleCancelled();
      }
    } catch {
      // ignore
    }
    setShowCancel(false);
  }

  if (cancelled) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 animate-slide-up">
        <CardContent className="p-6 text-center space-y-3">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <h3 className="font-display font-bold text-lg text-destructive">
            Booking Cancelled
          </h3>
          <p className="text-sm text-muted-foreground">
            Booking{" "}
            <span className="font-mono font-semibold">{bookingRef}</span> has
            been cancelled. Refund processing within 5–7 business days.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="border-green-300 dark:border-green-700 bg-green-50/60 dark:bg-green-950/20 animate-slide-up print:shadow-none"
        data-ocid="booking-confirmation"
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-6 h-6" />
            Booking Confirmed!
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your trip is all set. Safe travels!
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking reference */}
          <div className="flex items-center gap-3 rounded-lg bg-background border border-border p-3">
            <Receipt className="w-5 h-5 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Booking Reference</p>
              <p className="font-mono font-bold text-lg tracking-wider">
                {bookingRef}
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto shrink-0">
              Confirmed
            </Badge>
          </div>

          {/* Trip details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 rounded-md bg-background/80 border border-border p-3">
              <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-semibold truncate">{destination}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md bg-background/80 border border-border p-3">
              <Users className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Travelers</p>
                <p className="font-semibold">
                  {travelers} {travelers === 1 ? "person" : "people"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md bg-background/80 border border-border p-3">
              <Calendar className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">{days} days</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md bg-background/80 border border-border p-3">
              <Receipt className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Travel Style</p>
                <p className="font-semibold capitalize">{travelStyle}</p>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="rounded-lg bg-background border border-border p-4 space-y-2 text-sm">
            <p className="font-semibold text-sm mb-2">Cost Breakdown</p>
            <div className="flex justify-between text-muted-foreground">
              <span>
                Plan cost ({travelers}{" "}
                {travelers === 1 ? "traveler" : "travelers"})
              </span>
              <span>{formatCurrency(costPerPerson * travelers)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes (18%)</span>
              <span>
                {formatCurrency(Math.round(costPerPerson * travelers * 0.18))}
              </span>
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
            {surprisePlan && (
              <div className="flex justify-between text-accent">
                <span>
                  Surprise Plan (
                  {surprisePlan?.bookingCode ?? surprisePlan?.code ?? ""})
                </span>
                <span>+{formatCurrency(surprisePlan.cost)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total Paid</span>
              <span className="text-accent">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Flight section */}
          {flight && (
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seat</span>
                  <span className="font-mono font-semibold text-foreground">
                    {flight.seatNumbers?.join(", ") ||
                      flight.seatNumber ||
                      "Not selected"}{" "}
                    · {flight.seatClass}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hotel section */}
          {hotel && (
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
                {hotel.bedType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bed Type</span>
                    <span className="font-semibold text-foreground">
                      {hotel.bedType}
                    </span>
                  </div>
                )}
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
          )}

          {/* Baby Certificate section */}
          {cert?.wantsCertificate && (
            <div data-ocid="confirmation-certificate">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                🎓 Baby Flight Certificate
              </p>
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-700/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 space-y-1 text-sm">
                {cert.certBabyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Baby Name</span>
                    <span className="font-semibold text-foreground">
                      {cert.certBabyName}
                    </span>
                  </div>
                )}
                {cert.certDesign && (
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
                  Certificate included with booking confirmation.
                </p>
              </div>
            </div>
          )}

          {/* Child under 5 */}
          {cert?.childUnder5 && (
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
                  Special in-flight requirements applied for your child.
                </p>
              </div>
            </div>
          )}

          {/* Surprise plan details */}
          {surprisePlan && (
            <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                Surprise Plan Included
              </div>
              <p className="text-xs text-muted-foreground">
                {surprisePlan.description}
              </p>
              <ul className="space-y-1">
                {surprisePlan.itinerary.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="text-xs text-foreground flex items-start gap-1.5"
                  >
                    <span className="text-accent mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
                {surprisePlan.itinerary.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{surprisePlan.itinerary.length - 3} more days...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Special requests */}
          {specialRequests.trim() && (
            <div className="rounded-md bg-muted/40 border border-border p-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">
                Special Requests
              </p>
              <p>{specialRequests}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 print:hidden">
            <Button
              variant="outline"
              onClick={() => void handleDownloadPDF()}
              disabled={pdfGenerating}
              className="flex items-center gap-2"
              data-ocid="download-pdf-btn"
            >
              {pdfGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {pdfGenerating ? "Generating PDF…" : "Download Itinerary"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-2 ml-auto"
              data-ocid="cancel-booking-btn"
            >
              <XCircle className="w-4 h-4" />
              Cancel Booking
            </Button>
          </div>
        </CardContent>
      </Card>

      <CancellationModal
        isOpen={showCancel}
        onClose={handleCancelModalClose}
        bookingRef={bookingRef}
        destination={destination}
        amount={totalCost}
      />
    </>
  );
}
