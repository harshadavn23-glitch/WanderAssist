import type { BookingDetails } from "@/types/travel";
// useBookings.ts — local localStorage + Motoko canister backend
// All backend calls are additive — localStorage fallback on failure.
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";
import type { BookingEntry, CancellationResult } from "../backend";
import { createActor } from "../backend";

const STORAGE_KEY = "wanderassist-bookings";

function loadBookings(): BookingDetails[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as BookingDetails[];
  } catch {
    // ignore
  }
  return [];
}

function saveBookings(bookings: BookingDetails[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // ignore
  }
}

/** Convert a canister BookingEntry into our local BookingDetails shape */
function toLocalBooking(entry: BookingEntry): BookingDetails {
  return {
    id: String(entry.id),
    destination: entry.destination,
    travelers: Number(entry.travelers),
    days: Number(entry.days),
    tourType: entry.bookingType,
    totalCost: entry.totalCost,
    status: entry.status as "confirmed" | "cancelled" | "pending",
    createdAt: new Date(Number(entry.createdAt) / 1_000_000).toISOString(),
    reference: entry.paymentRef,
    paymentRef: entry.paymentRef,
    surprisePlanCode: entry.surprisePlanCode,
    cancellationReason: entry.cancellationReason,
  };
}

export function useBookings() {
  const { actor, isFetching } = useActor(createActor);
  const [bookings, setBookings] = useState<BookingDetails[]>(loadBookings);

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  const addBooking = useCallback((booking: BookingDetails) => {
    setBookings((prev) => [booking, ...prev]);
  }, []);

  const cancelBooking = useCallback((reference: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        const isMatch =
          b.reference === reference ||
          b.bookingRef === reference ||
          b.bookingReference === reference;
        return isMatch
          ? {
              ...b,
              status: "cancelled" as const,
              cancellationReason: reason ?? "Cancelled by user",
              cancelledAt: new Date().toISOString(),
            }
          : b;
      }),
    );
  }, []);

  const getBookingByRef = useCallback(
    (reference: string): BookingDetails | undefined => {
      return bookings.find(
        (b) =>
          b.reference === reference ||
          b.bookingRef === reference ||
          b.bookingReference === reference,
      );
    },
    [bookings],
  );

  /** Save a booking to the Motoko canister; returns canister bigint ID or null on failure */
  const saveToBackend = useCallback(
    async (
      booking: BookingDetails & { userId?: string; startDate?: string },
    ): Promise<bigint | null> => {
      if (!actor || isFetching) return null;
      try {
        const canisterId = await actor.createBooking(
          booking.userId ?? "guest",
          booking.tourType,
          booking.destination,
          BigInt(booking.travelers),
          BigInt(booking.days),
          booking.startDate ?? new Date().toISOString().split("T")[0],
          booking.totalCost,
          booking.paymentRef,
          booking.surprisePlanCode ?? null,
        );
        return canisterId;
      } catch (err) {
        console.error("[useBookings] saveToBackend failed:", err);
        return null;
      }
    },
    [actor, isFetching],
  );

  /** Load bookings from canister and merge with localStorage (dedup by paymentRef) */
  const loadFromBackend = useCallback(
    async (userId: string): Promise<void> => {
      if (!actor || isFetching) return;
      try {
        const entries = await actor.listUserBookings(userId);
        const remote = entries.map(toLocalBooking);
        setBookings((prev) => {
          const existingRefs = new Set(prev.map((b) => b.paymentRef));
          const newEntries = remote.filter(
            (r) => !existingRefs.has(r.paymentRef),
          );
          if (newEntries.length === 0) return prev;
          return [...newEntries, ...prev];
        });
      } catch (err) {
        console.error("[useBookings] loadFromBackend failed:", err);
      }
    },
    [actor, isFetching],
  );

  /** Cancel a booking in the canister; returns CancellationResult or null on failure */
  const cancelInBackend = useCallback(
    async (
      reference: string,
      reason: string,
    ): Promise<CancellationResult | null> => {
      // Optimistic local cancel first
      cancelBooking(reference, reason);

      if (!actor || isFetching) return null;
      try {
        // Find booking — prefer stored canisterId, fall back to string-stripped id
        const local = bookings.find(
          (b) =>
            b.reference === reference ||
            b.bookingRef === reference ||
            b.bookingReference === reference,
        );
        const numericId: bigint =
          local?.canisterId ??
          (local ? BigInt(local.id.replace(/\D/g, "") || "0") : BigInt(0));
        const result = await actor.cancelBooking(numericId, reason);
        return result;
      } catch (err) {
        console.error("[useBookings] cancelInBackend failed:", err);
        return null;
      }
    },
    [actor, isFetching, bookings, cancelBooking],
  );

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  return {
    bookings,
    activeBookings,
    cancelledBookings,
    addBooking,
    cancelBooking,
    cancelInBackend,
    getBookingByRef,
    saveToBackend,
    loadFromBackend,
    isActorReady: !!actor && !isFetching,
  };
}
