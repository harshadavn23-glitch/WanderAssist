// BookingHistory.tsx
// On mount: loads bookings from Motoko canister via loadFromBackend.
// On cancel: calls cancelInBackend for canister update + shows refund message.
// Auth guard: redirects to /login if not logged in.
import { CancellationModal } from "@/components/CancellationModal";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/hooks/useBookings";
import { useSession } from "@/hooks/useSession";
import type { BookingDetails } from "@/types/travel";
import { formatCurrency } from "@/utils/formatCurrency";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Plane,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CancellationResult } from "../backend";

type FilterType = "all" | "confirmed" | "cancelled" | "pending";

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  },
} as const;

interface TicketModalProps {
  booking: BookingDetails;
  onClose: () => void;
}

function TicketModal({ booking, onClose }: TicketModalProps) {
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const ref = booking.reference || booking.bookingRef || "N/A";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      tabIndex={-1}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-hero p-6 space-y-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              {booking.destination}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ref:{" "}
              <span className="font-mono font-semibold text-foreground">
                #{ref}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-fast"
            aria-label="Close ticket"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Status",
              value: (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${status.className}`}
                >
                  {status.label}
                </span>
              ),
            },
            {
              label: "Booking Date",
              value: new Date(booking.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
            {
              label: "Travelers",
              value: `${booking.travelers} person${booking.travelers > 1 ? "s" : ""}`,
            },
            {
              label: "Duration",
              value: `${booking.days} day${booking.days > 1 ? "s" : ""}`,
            },
            { label: "Tour Type", value: booking.tourType },
            {
              label: "Payment Ref",
              value: (
                <span className="font-mono text-xs">{booking.paymentRef}</span>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/40 rounded-xl p-3 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                {label}
              </p>
              <div className="text-sm font-semibold text-foreground">
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Total Cost
          </span>
          <span className="text-xl font-display font-bold text-amber-500">
            {formatCurrency(booking.totalCost)}
          </span>
        </div>
        {booking.cancellationReason && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1">
            <p className="text-xs text-destructive font-medium">
              Cancellation Reason
            </p>
            <p className="text-sm text-foreground">
              {booking.cancellationReason}
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

interface BookingCardProps {
  booking: BookingDetails;
  onCancel: (booking: BookingDetails) => void;
  onView: (booking: BookingDetails) => void;
  index: number;
}

function BookingCard({ booking, onCancel, onView, index }: BookingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const canCancel =
    booking.status === "confirmed" || booking.status === "pending";
  const ref =
    booking.reference ||
    booking.bookingRef ||
    booking.bookingReference ||
    "N/A";

  return (
    <div
      className="bg-card border border-border rounded-2xl shadow-subtle overflow-hidden transition-smooth hover:shadow-elevated"
      data-ocid="booking-card"
    >
      <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #1e3a5f, #0f766e)",
              }}
            >
              <Plane size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-foreground truncate">
                {booking.destination}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                #{ref}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={13} className="shrink-0" />
            <span className="truncate">
              {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={13} className="shrink-0" />
            <span>
              {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag size={13} className="shrink-0" />
            <span className="truncate">{booking.tourType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <span>{formatCurrency(booking.totalCost)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onView(booking)}
            className="gap-1.5"
            data-ocid="booking-view-ticket-btn"
          >
            <Eye size={14} />
            View Ticket
          </Button>
          {canCancel && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onCancel(booking)}
              className="gap-1.5"
              data-ocid="booking-cancel-btn"
            >
              <X size={14} />
              Cancel Booking
            </Button>
          )}
          <FavoriteButton
            planId={`booking-${booking.id}`}
            size="sm"
            trip={{
              planId: `booking-${booking.id}`,
              destination: booking.destination,
              pricePerPerson:
                booking.costPerPerson ??
                Math.round(booking.totalCost / Math.max(booking.travelers, 1)),
              days: booking.days,
              travelers: booking.travelers,
            }}
            data-ocid={`booking-favorite-btn.${index}`}
          />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-fast"
            data-ocid="booking-expand-btn"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} /> Hide
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Itinerary
              </>
            )}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border bg-muted/20 px-5 py-4 animate-slide-up">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Itinerary Preview
          </p>
          <div className="space-y-2">
            {Array.from({ length: Math.min(booking.days, 4) }).map((_, i) => (
              <div
                key={`day-${i + 1}-${booking.id}`}
                className="flex gap-3 items-start text-sm"
              >
                <span className="w-14 text-xs font-bold text-amber-500 shrink-0">
                  Day {i + 1}
                </span>
                <span className="text-muted-foreground leading-snug">
                  {i === 0
                    ? `Arrive in ${booking.destination}, check-in & explore local area`
                    : i === 1
                      ? "Guided sightseeing tour — top landmarks & cultural experiences"
                      : i === 2
                        ? "Day trip to nearby attractions, local cuisine tasting"
                        : "Leisure day, souvenir shopping & departure preparations"}
                </span>
              </div>
            ))}
            {booking.days > 4 && (
              <p className="text-xs text-muted-foreground">
                +{booking.days - 4} more days in your itinerary
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingHistory() {
  const { bookings, cancelInBackend, loadFromBackend } = useBookings();
  const { session } = useSession();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const [cancelTarget, setCancelTarget] = useState<BookingDetails | null>(null);
  const [viewTarget, setViewTarget] = useState<BookingDetails | null>(null);
  const [refundMsg, setRefundMsg] = useState<string | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!session?.loggedIn) {
      navigate({ to: "/login" });
    }
  }, [session?.loggedIn, navigate]);

  // Load from canister on mount (only for logged-in users)
  useEffect(() => {
    if (!session?.loggedIn || !session.userId) return;
    setIsLoadingRemote(true);
    loadFromBackend(session.userId).finally(() => setIsLoadingRemote(false));
  }, [loadFromBackend, session?.userId, session?.loggedIn]);

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filtered =
    filter === "all" ? sorted : sorted.filter((b) => b.status === filter);

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    const ref =
      cancelTarget.reference ||
      cancelTarget.bookingRef ||
      cancelTarget.bookingReference ||
      cancelTarget.id;

    const result: CancellationResult | null = await cancelInBackend(
      ref,
      reason,
    );

    if (result?.success && result.message) {
      setRefundMsg(result.message);
    } else {
      setRefundMsg(
        "Booking cancelled. Refund will be processed within 5-7 business days.",
      );
    }
    setCancelTarget(null);
    // Auto-hide refund message after 6s
    setTimeout(() => setRefundMsg(null), 6000);
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending", label: "Pending" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div
        className="relative py-12"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,22,40,0.85)" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1e3a5f, #0f766e)",
              }}
            >
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white text-shadow-hero">
                Booking History
              </h1>
              <p className="text-sm text-white/65">
                Track all your travel bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Refund message banner */}
        {refundMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-fade-in flex items-center gap-2">
            ✅ {refundMsg}
          </div>
        )}

        {/* Loading indicator */}
        {isLoadingRemote && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Syncing with server...
          </div>
        )}

        {/* Summary stats */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Bookings",
                value: bookings.length,
                color: "text-foreground",
              },
              {
                label: "Confirmed",
                value: bookings.filter((b) => b.status === "confirmed").length,
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Cancelled",
                value: bookings.filter((b) => b.status === "cancelled").length,
                color: "text-red-600 dark:text-red-400",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <p className={`text-2xl font-display font-bold ${color}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap" data-ocid="booking-filter-tabs">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-fast ${
                filter === key
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-subtle"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-ocid={`booking-filter-${key}`}
            >
              {label}
              {key !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({bookings.filter((b) => b.status === key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 space-y-4 text-center"
            data-ocid="booking-empty-state"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Plane size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">
                {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "all"
                  ? "Start your journey! Explore destinations and make your first booking."
                  : `You have no ${filter} bookings at this time.`}
              </p>
            </div>
            {filter === "all" && (
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-fast hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                }}
              >
                Explore Destinations
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {filtered.map((booking, idx) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={setCancelTarget}
                onView={setViewTarget}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancellationModal
          isOpen={true}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
          bookingRef={
            cancelTarget.reference || cancelTarget.bookingRef || cancelTarget.id
          }
          amount={cancelTarget.totalCost}
          destination={cancelTarget.destination}
        />
      )}
      {viewTarget && (
        <TicketModal booking={viewTarget} onClose={() => setViewTarget(null)} />
      )}
    </div>
  );
}
