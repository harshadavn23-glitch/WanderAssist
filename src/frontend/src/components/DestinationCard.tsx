import { ImageWithFallback } from "@/components/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import type { Destination } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";

interface DestinationCardProps {
  destination: Destination;
  onBook?: (dest: Destination) => void;
}

export function DestinationCard({ destination, onBook }: DestinationCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const faved = isFavorite(destination.name);

  const price = destination.pricePerPerson ?? destination.costPerPerson ?? 0;

  function handleBook() {
    if (onBook) {
      onBook(destination);
    } else {
      navigate({
        to: "/travel-plan",
        search: { destination: destination.name },
      });
    }
  }

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    toggle({
      planId: `dest-${destination.name}`,
      destination: destination.name,
      image: destination.image,
      description: destination.description,
      pricePerPerson: price,
    });
  }

  return (
    <button
      type="button"
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-smooth hover:scale-[1.03] hover:shadow-hero w-full text-left"
      style={{ minHeight: "280px" }}
      onClick={handleBook}
      aria-label={`Book trip to ${destination.name}`}
      data-ocid={`destination-card-${destination.id}`}
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          fallbackLabel={destination.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
        />
      </div>

      {/* Strong card overlay */}
      <div className="absolute inset-0 card-overlay-strong" />

      {/* Type badge — top left */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className="glass-card text-white border-0 text-xs font-semibold shadow-sm">
          {destination.type === "indian" ? "🇮🇳 India" : "🌍 International"}
        </Badge>
      </div>

      {/* Price badge — top right */}
      <div className="absolute top-3 right-10 z-10">
        <span className="bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          ₹{price.toLocaleString()}
        </span>
      </div>

      {/* Favorite button */}
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={faved ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass-card flex items-center justify-center transition-fast hover:scale-110"
        data-ocid={`fav-btn-${destination.id}`}
      >
        <Heart
          className={`w-4 h-4 ${faved ? "fill-red-400 text-red-400" : "text-white"}`}
        />
      </button>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        {/* Name + region */}
        <h3 className="font-display font-bold text-xl text-white text-shadow-hero leading-tight mb-0.5">
          {destination.name}
        </h3>
        <div className="flex items-center gap-1 text-white/75 text-xs mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{destination.region}</span>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1 mb-3">
          {destination.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold glass-card text-white border-0"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + rating + CTA row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-white text-shadow-sm">
              4.8
            </span>
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBook();
            }}
            className="h-8 px-4 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 shadow-md"
            data-ocid={`book-btn-${destination.id}`}
          >
            Book This Trip
          </Button>
        </div>
      </div>
    </button>
  );
}
