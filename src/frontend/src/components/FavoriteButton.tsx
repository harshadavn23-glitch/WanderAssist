// FavoriteButton.tsx — GSAP-animated heart button with --star-y / --star-scale CSS vars
// Uses the exact keyframe sequence: up → round-out → burst-in
import "./FavoriteButton.css";

import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteTrip } from "@/types/travel";
import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

interface FavoriteButtonProps {
  /** Unique plan ID — used to prevent duplicates */
  planId: string;
  /** Full trip data to save when favoriting */
  trip: Omit<FavoriteTrip, "id" | "savedAt">;
  /** Size variant (kept for API compat — visual size fixed by CSS) */
  size?: "sm" | "md" | "lg";
  /** Additional class names appended to the button */
  className?: string;
}

export function FavoriteButton({
  planId,
  trip,
  className = "",
}: FavoriteButtonProps) {
  const { toggleById, isFavoriteById } = useFavorites();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const burstRef = useRef<HTMLSpanElement>(null);

  // React state mirrors the DOM 'active' class for correct re-renders
  const [isActive, setIsActive] = useState(() => isFavoriteById(planId));

  // Keep isActive in sync when favorites change externally (e.g. Favorites page removes one)
  const currentIsFav = isFavoriteById(planId);
  useEffect(() => {
    setIsActive(currentIsFav);
  }, [currentIsFav]);

  // Initialise CSS custom properties so GSAP can tween them
  useEffect(() => {
    if (!buttonRef.current) return;
    gsap.set(buttonRef.current, { "--star-y": "0px", "--star-scale": 1 });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const btn = buttonRef.current;
      if (!btn) return;

      // Guard: prevent re-triggering while animation runs
      if (btn.classList.contains("animated")) return;

      btn.classList.add("animated");

      // Toggle favorites in hook immediately (localStorage persistence)
      const willBeFav = !isActive;
      toggleById(planId, trip);
      setIsActive(willBeFav);

      // Exact three-keyframe sequence from spec
      gsap.to(btn, {
        keyframes: [
          {
            "--star-y": "-36px",
            duration: 0.3,
            ease: "power2.out",
          },
          {
            "--star-y": "48px",
            "--star-scale": 0,
            duration: 0.325,
            onStart() {
              btn.classList.add("star-round");
              burstRef.current?.classList.add("star-round");
            },
          },
          {
            "--star-y": "-64px",
            "--star-scale": 1,
            duration: 0.45,
            ease: "power2.out",
            onStart() {
              // Toggle 'active' class for CSS heart colour switch
              btn.classList.toggle("active");
              setTimeout(() => {
                btn.classList.remove("star-round");
                burstRef.current?.classList.remove("star-round");
              }, 100);
            },
          },
        ],
      });

      // Remove animated guard after full sequence + buffer
      setTimeout(() => {
        btn.classList.remove("animated");
        // Reconcile DOM 'active' with React state
        if (willBeFav) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }, 1200);
    },
    [isActive, planId, trip, toggleById],
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      // 'favorite-button' always present; 'active' when favorited
      className={`favorite-button${isActive ? " active" : ""}${className ? ` ${className}` : ""}`}
      onClick={handleClick}
      aria-label={isActive ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isActive}
      data-ocid="favorite-heart-btn"
    >
      {/* Decorative burst — animated via --star-y/--star-scale on parent button */}
      <span ref={burstRef} className="star-burst" aria-hidden="true" />

      {/* Heart SVG — fill/stroke controlled by .heart-icon CSS rules */}
      <svg
        className="heart-icon"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
