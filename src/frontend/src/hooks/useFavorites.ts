import type { FavoriteTrip } from "@/types/travel";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wanderassist-favorites";

function loadFavorites(): FavoriteTrip[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as FavoriteTrip[];
  } catch {
    // ignore
  }
  return [];
}

function saveFavorites(favorites: FavoriteTrip[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteTrip[]>(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  /** Toggle by planId — prevents duplicates, stores full trip data */
  const toggleById = useCallback(
    (planId: string, trip: Omit<FavoriteTrip, "id" | "savedAt">) => {
      setFavorites((prev) => {
        const exists = prev.find((f) => f.planId === planId);
        if (exists) {
          return prev.filter((f) => f.planId !== planId);
        }
        return [
          ...prev,
          {
            ...trip,
            planId,
            id: `fav-${planId}-${Date.now()}`,
            savedAt: new Date().toISOString(),
          },
        ];
      });
    },
    [],
  );

  /** Legacy toggle by destination string (kept for backwards compat) */
  const toggle = useCallback((trip: Omit<FavoriteTrip, "id" | "savedAt">) => {
    const planId = trip.planId ?? trip.destination;
    setFavorites((prev) => {
      const exists = prev.find(
        (f) => f.planId === planId || f.destination === trip.destination,
      );
      if (exists) {
        return prev.filter(
          (f) => f.planId !== planId && f.destination !== trip.destination,
        );
      }
      return [
        ...prev,
        {
          ...trip,
          planId,
          id: `fav-${planId}-${Date.now()}`,
          savedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const isFavoriteById = useCallback(
    (planId: string) => favorites.some((f) => f.planId === planId),
    [favorites],
  );

  const isFavorite = useCallback(
    (destination: string) =>
      favorites.some((f) => f.destination === destination),
    [favorites],
  );

  const removeFavorite = useCallback(
    (planId: string) =>
      setFavorites((prev) =>
        prev.filter((f) => f.planId !== planId && f.destination !== planId),
      ),
    [],
  );

  return {
    favorites,
    toggle,
    toggleById,
    isFavorite,
    isFavoriteById,
    removeFavorite,
  };
}
