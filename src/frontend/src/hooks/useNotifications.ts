// useNotifications.ts — canister-backed notification preferences + history
import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";
import type { NotificationHistory, NotificationPreference } from "../backend";
import { createActor } from "../backend";
import type { BookingDetails } from "../types/travel";
import { useBookings } from "./useBookings";

export interface ReminderToggles {
  remind7Days: boolean;
  remind3Days: boolean;
  remind1Day: boolean;
}

// Key: bookingId as string
export type PreferenceMap = Record<string, ReminderToggles>;

const STORAGE_KEY = "wanderassist-notif-prefs";
const NOTIF_PERM_KEY = "wanderassist-notif-perm-asked";

function loadLocalPrefs(): PreferenceMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PreferenceMap;
  } catch {
    // ignore
  }
  return {};
}

function saveLocalPrefs(prefs: PreferenceMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

/** Days until travel date (negative if past) */
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const travel = new Date(dateStr);
  travel.setHours(0, 0, 0, 0);
  return Math.round((travel.getTime() - today.getTime()) / 86_400_000);
}

/** Request browser Notification permission once */
async function requestPermissionOnce(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (localStorage.getItem(NOTIF_PERM_KEY)) {
    return Notification.permission === "granted";
  }
  localStorage.setItem(NOTIF_PERM_KEY, "1");
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendBrowserNotification(title: string, body: string): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
}

export function useNotifications(userId: string) {
  const { actor, isFetching } = useActor(createActor);
  const { bookings } = useBookings();

  const [preferences, setPreferences] = useState<PreferenceMap>(loadLocalPrefs);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [firedToday, setFiredToday] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Persist preferences locally
  useEffect(() => {
    saveLocalPrefs(preferences);
  }, [preferences]);

  /** Load preferences from canister */
  const loadPreferences = useCallback(async () => {
    if (!actor || isFetching || !userId) return;
    setIsLoadingPrefs(true);
    setError(null);
    try {
      const prefs = await actor.getNotificationPreferences(userId);
      const map: PreferenceMap = {};
      for (const p of prefs) {
        map[String(p.bookingId)] = {
          remind7Days: p.remind7Days,
          remind3Days: p.remind3Days,
          remind1Day: p.remind1Day,
        };
      }
      // Merge: canister authoritative, but don't wipe local-only entries
      setPreferences((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("[useNotifications] loadPreferences failed:", err);
      setError("Failed to load preferences. Using local data.");
    } finally {
      setIsLoadingPrefs(false);
    }
  }, [actor, isFetching, userId]);

  /** Load notification history from canister */
  const loadHistory = useCallback(async () => {
    if (!actor || isFetching || !userId) return;
    setIsLoadingHistory(true);
    try {
      const items = await actor.getNotificationHistory(userId);
      // Sort newest first
      const sorted = [...items].sort(
        (a, b) => Number(b.firedAt) - Number(a.firedAt),
      );
      setHistory(sorted);
    } catch (err) {
      console.error("[useNotifications] loadHistory failed:", err);
      setError("Failed to load notification history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [actor, isFetching, userId]);

  /** Toggle a reminder preference and save to canister */
  const toggleReminder = useCallback(
    async (
      bookingId: string,
      destination: string,
      travelDate: string,
      field: keyof ReminderToggles,
    ) => {
      const current = preferences[bookingId] ?? {
        remind7Days: true,
        remind3Days: true,
        remind1Day: true,
      };
      const updated = { ...current, [field]: !current[field] };

      // Optimistic local update
      setPreferences((prev) => ({ ...prev, [bookingId]: updated }));

      if (!actor || isFetching || !userId) return;
      try {
        await actor.saveNotificationPreference(
          userId,
          BigInt(bookingId),
          destination,
          travelDate,
          updated.remind7Days,
          updated.remind3Days,
          updated.remind1Day,
        );
      } catch (err) {
        console.error("[useNotifications] toggleReminder save failed:", err);
        // Revert on failure
        setPreferences((prev) => ({ ...prev, [bookingId]: current }));
      }
    },
    [actor, isFetching, userId, preferences],
  );

  /** Clear notification history */
  const clearHistory = useCallback(async () => {
    if (!actor || isFetching || !userId) return;
    setIsClearingHistory(true);
    try {
      await actor.clearNotificationHistory(userId);
      setHistory([]);
    } catch (err) {
      console.error("[useNotifications] clearHistory failed:", err);
    } finally {
      setIsClearingHistory(false);
    }
  }, [actor, isFetching, userId]);

  /** Check if any reminders should fire today */
  const checkAndFireReminders = useCallback(async () => {
    const canRequest = await requestPermissionOnce();
    if (!canRequest) return;

    const confirmed = bookings.filter((b) => b.status === "confirmed");
    for (const booking of confirmed) {
      const travelDate =
        (booking as BookingDetails & { startDate?: string }).startDate ??
        booking.createdAt?.split("T")[0] ??
        "";
      if (!travelDate) continue;

      const days = daysUntil(travelDate);
      const prefs = preferences[booking.id] ?? {
        remind7Days: true,
        remind3Days: true,
        remind1Day: true,
      };

      const reminders: Array<[number, keyof ReminderToggles, string]> = [
        [7, "remind7Days", "7 days before"],
        [3, "remind3Days", "3 days before"],
        [1, "remind1Day", "1 day before"],
      ];

      for (const [daysBefore, prefKey, label] of reminders) {
        if (days !== daysBefore) continue;
        if (!prefs[prefKey]) continue;

        const fireKey = `${booking.id}-${daysBefore}`;
        if (firedToday.has(fireKey)) continue;

        const message = `Your trip to ${booking.destination} is in ${daysBefore} day${daysBefore > 1 ? "s" : ""}!`;
        sendBrowserNotification("✈️ WanderAssist Reminder", message);

        setFiredToday((prev) => new Set([...prev, fireKey]));

        // Log to canister (non-blocking)
        if (actor && !isFetching && userId) {
          actor
            .logNotificationFired(
              userId,
              BigInt(booking.id.replace(/\D/g, "") || String(Date.now())),
              booking.destination,
              label,
              message,
            )
            .then(() => loadHistory())
            .catch((err) =>
              console.error(
                "[useNotifications] logNotificationFired failed:",
                err,
              ),
            );
        }
      }
    }
  }, [
    actor,
    isFetching,
    userId,
    bookings,
    preferences,
    firedToday,
    loadHistory,
  ]);

  // Load on mount and whenever actor becomes ready
  useEffect(() => {
    if (actor && !isFetching && userId) {
      void loadPreferences();
      void loadHistory();
    }
  }, [actor, isFetching, userId, loadPreferences, loadHistory]);

  // Check reminders on mount and every 60 seconds
  useEffect(() => {
    void checkAndFireReminders();
    const interval = setInterval(() => void checkAndFireReminders(), 60_000);
    return () => clearInterval(interval);
  }, [checkAndFireReminders]);

  // Ensure confirmed bookings have default preferences
  useEffect(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    setPreferences((prev) => {
      const updated = { ...prev };
      let changed = false;
      for (const b of confirmed) {
        if (!updated[b.id]) {
          updated[b.id] = {
            remind7Days: true,
            remind3Days: true,
            remind1Day: true,
          };
          changed = true;
        }
      }
      return changed ? updated : prev;
    });
  }, [bookings]);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  return {
    preferences,
    history,
    confirmedBookings,
    isLoadingPrefs,
    isLoadingHistory,
    isClearingHistory,
    error,
    isActorReady: !!actor && !isFetching,
    loadPreferences,
    loadHistory,
    toggleReminder,
    clearHistory,
  };
}
