import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (reason: string) => void;
  bookingRef: string;
  amount: number;
  destination: string;
}

const CANCELLATION_REASONS = [
  "Change of plans",
  "Emergency situation",
  "Found a better option",
  "Health issues",
  "Weather concerns",
  "Other",
];

type ModalState = "form" | "success";

export function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  bookingRef,
  amount,
  destination,
}: CancellationModalProps) {
  const [modalState, setModalState] = useState<ModalState>("form");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Animate open/close
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setRendered(false);
        setModalState("form");
        setReason("");
        setOtherReason("");
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirm = () => {
    if (!reason) return;
    const finalReason = reason === "Other" ? otherReason.trim() : reason;

    // Update booking status in localStorage — match by b.reference (primary field used by TravelPlan)
    try {
      const stored = localStorage.getItem("wanderassist-bookings");
      if (stored) {
        const bookings = JSON.parse(stored) as Array<{
          reference?: string;
          status?: string;
          [key: string]: unknown;
        }>;
        const updated = bookings.map((b) => {
          const isMatch = b.reference === bookingRef;
          return isMatch
            ? {
                ...b,
                status: "cancelled",
                cancellationReason: finalReason,
                cancelledAt: new Date().toISOString(),
              }
            : b;
        });
        localStorage.setItem("wanderassist-bookings", JSON.stringify(updated));
      }
    } catch {
      // Silently fail if localStorage is unavailable
    }

    // Notify parent with the chosen reason so BookingHistory can sync its state
    onConfirm?.(finalReason);
    setModalState("success");
  };

  const isConfirmDisabled =
    !reason || (reason === "Other" && otherReason.trim().length === 0);

  if (!rendered) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? 0.55 : 0})`,
        transition: "background-color 0.26s ease",
      }}
      tabIndex={-1}
    >
      <div
        aria-labelledby="cancellation-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-card text-card-foreground shadow-elevated border border-border"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.93)",
          transition: "opacity 0.26s ease, transform 0.26s ease",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {modalState === "form" ? (
          <FormContent
            bookingRef={bookingRef}
            destination={destination}
            reason={reason}
            otherReason={otherReason}
            isConfirmDisabled={isConfirmDisabled}
            onReasonChange={setReason}
            onOtherReasonChange={setOtherReason}
            onClose={onClose}
            onConfirm={handleConfirm}
          />
        ) : (
          <SuccessContent
            bookingRef={bookingRef}
            amount={amount}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormContentProps {
  bookingRef: string;
  destination: string;
  reason: string;
  otherReason: string;
  isConfirmDisabled: boolean;
  onReasonChange: (v: string) => void;
  onOtherReasonChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function FormContent({
  bookingRef,
  destination,
  reason,
  otherReason,
  isConfirmDisabled,
  onReasonChange,
  onOtherReasonChange,
  onClose,
  onConfirm,
}: FormContentProps) {
  return (
    <div className="p-6 space-y-5" data-ocid="cancellation-modal-form">
      {/* Header */}
      <div className="pr-8">
        <h2
          id="cancellation-modal-title"
          className="text-xl font-display font-bold text-foreground"
        >
          Cancel Booking #{bookingRef}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground truncate">
          {destination}
        </p>
      </div>

      {/* Warning */}
      <div className="flex gap-3 items-start rounded-xl border border-destructive/30 bg-destructive/[0.08] p-4">
        <AlertTriangle
          size={18}
          className="text-destructive mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm text-destructive font-medium leading-relaxed">
          Are you sure you want to cancel? This action cannot be undone.
        </p>
      </div>

      {/* Reason dropdown */}
      <div className="space-y-2">
        <label
          htmlFor="cancellation-reason"
          className="block text-sm font-semibold text-foreground"
        >
          Reason for Cancellation <span className="text-destructive">*</span>
        </label>
        <select
          id="cancellation-reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-fast cursor-pointer"
          data-ocid="cancellation-reason-select"
        >
          <option value="" disabled>
            Select a reason…
          </option>
          {CANCELLATION_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* "Other" free-text textarea */}
      {reason === "Other" && (
        <div className="space-y-2 animate-slide-up">
          <label
            htmlFor="other-reason"
            className="block text-sm font-semibold text-foreground"
          >
            Please describe your reason…
          </label>
          <textarea
            id="other-reason"
            value={otherReason}
            onChange={(e) => onOtherReasonChange(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Tell us more about your cancellation…"
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-fast placeholder:text-muted-foreground"
            data-ocid="cancellation-other-reason"
          />
          <p className="text-xs text-muted-foreground text-right">
            {otherReason.length}/300
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          data-ocid="cancellation-keep-btn"
        >
          Keep My Booking
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className="flex-1"
          data-ocid="cancellation-confirm-btn"
        >
          Confirm Cancellation
        </Button>
      </div>
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

interface SuccessContentProps {
  bookingRef: string;
  amount: number;
  onClose: () => void;
}

function SuccessContent({ bookingRef, amount, onClose }: SuccessContentProps) {
  return (
    <div
      className="p-6 space-y-5 text-center animate-fade-in"
      data-ocid="cancellation-modal-success"
    >
      {/* Checkmark icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <CheckCircle2
            size={32}
            className="text-destructive"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-display font-bold text-foreground">
          Booking Cancelled ✓
        </h2>
        <p className="text-sm text-muted-foreground">
          Reference:{" "}
          <span className="font-semibold text-foreground font-mono">
            #{bookingRef}
          </span>
        </p>
      </div>

      {/* Status badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-destructive/40 bg-destructive/10 text-destructive">
          CANCELLED
        </span>
      </div>

      {/* Refund message */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Refund Information
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Refund of{" "}
          <span className="font-bold text-foreground">
            ₹{amount.toLocaleString("en-IN")}
          </span>{" "}
          will be processed within{" "}
          <span className="font-semibold text-foreground">
            5–7 business days
          </span>{" "}
          to your original payment method.
        </p>
      </div>

      {/* Dismiss */}
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="w-full"
        data-ocid="cancellation-success-close"
      >
        Close
      </Button>
    </div>
  );
}
