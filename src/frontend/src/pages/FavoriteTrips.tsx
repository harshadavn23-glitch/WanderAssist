import { ImageWithFallback } from "@/components/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import type { FavoriteTrip } from "@/types/travel";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Globe, Heart, MapPin, Plane, Share2 } from "lucide-react";
import { toast } from "sonner";

const DESTINATION_IMAGES: Record<string, string> = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
  Kerala:
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
  Mumbai:
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80",
  Delhi:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80",
  Jaipur:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80",
  Manali:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
  Ladakh:
    "https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=400&q=80",
  Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
  Paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
  Dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
  Tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
  "New York":
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80",
  London:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80",
  Singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80",
  Maldives:
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80",
  Pondicherry:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80",
  Bangalore:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80",
  Chennai:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80";

interface FavoriteCardProps {
  trip: FavoriteTrip;
  onRemove: (id: string) => void;
  onBookAgain: (destination: string) => void;
  onShare: (destination: string) => void;
}

function FavoriteCard({
  trip,
  onRemove,
  onBookAgain,
  onShare,
}: FavoriteCardProps) {
  const imgSrc =
    trip.image || DESTINATION_IMAGES[trip.destination] || FALLBACK_IMAGE;

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-subtle transition-smooth hover:shadow-elevated group"
      data-ocid="favorite-card"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <ImageWithFallback
          src={imgSrc}
          alt={trip.destination}
          fallbackLabel={trip.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Heart remove button */}
        <button
          type="button"
          onClick={() => onRemove(trip.planId ?? trip.destination)}
          className="absolute top-3 right-3 w-8 h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-fast hover:bg-red-50 dark:hover:bg-red-900/30"
          aria-label={`Remove ${trip.destination} from favorites`}
          data-ocid="favorite-remove-btn"
        >
          <Heart
            size={15}
            className="text-red-500 fill-red-500 hover:scale-125 transition-fast"
          />
        </button>

        {/* Destination name + plan name */}
        <div className="absolute bottom-3 left-3">
          <h3 className="font-display font-bold text-white text-lg leading-tight drop-shadow">
            {trip.destination}
          </h3>
          {trip.planName && trip.planName !== trip.destination && (
            <p className="text-white/80 text-xs font-medium mt-0.5 drop-shadow">
              {trip.planName}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar size={13} />
          <span>
            Saved{" "}
            {new Date(trip.savedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Days + travelers meta */}
        {(trip.days ?? trip.travelers) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {trip.days && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {trip.days} day{trip.days > 1 ? "s" : ""}
              </span>
            )}
            {trip.travelers && (
              <span className="flex items-center gap-1">
                ✈ {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {trip.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {trip.description}
          </p>
        )}

        {trip.pricePerPerson && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-bold text-primary">
              ₹{trip.pricePerPerson.toLocaleString("en-IN")}
            </span>
            <span className="text-muted-foreground">/ person</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => onBookAgain(trip.destination)}
            className="flex-1 gap-1.5"
            data-ocid="favorite-book-again-btn"
          >
            <Plane size={13} />
            Book Again
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onShare(trip.destination)}
            aria-label="Share destination"
            data-ocid="favorite-share-btn"
            className="gap-1.5"
          >
            <Share2 size={13} />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FavoriteTrips() {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  // Sort most recently saved first
  const sorted = [...favorites].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );

  const handleBookAgain = (destination: string) => {
    navigate({ to: "/travel-plan", search: { destination } });
  };

  const handleShare = (destination: string) => {
    const url = `${window.location.origin}/travel-plan?destination=${encodeURIComponent(destination)}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(`Link copied for ${destination}!`, {
          description: "Share this link with friends and family.",
          duration: 4000,
        });
      })
      .catch(() => {
        toast.info(`Share ${destination}`, {
          description: url,
          duration: 5000,
        });
      });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Heart size={20} className="text-red-500 fill-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Favorite Trips
                </h1>
                <p className="text-sm text-muted-foreground">
                  {sorted.length > 0
                    ? `${sorted.length} saved destination${sorted.length > 1 ? "s" : ""}`
                    : "Your saved destinations"}
                </p>
              </div>
            </div>
            {sorted.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl">
                <Globe size={14} />
                <span className="font-medium">Most recently saved first</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {sorted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 space-y-5 text-center"
            data-ocid="favorites-empty-state"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-muted/40 flex items-center justify-center">
                <Heart size={40} className="text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <MapPin size={14} className="text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">
                No favorite trips yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Heart a plan to save it here — explore destinations and tap the
                ❤️ button on any travel plan to add it to your favorites.
              </p>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-fast hover:opacity-90"
              data-ocid="favorites-explore-cta"
            >
              <Globe size={15} />
              Explore Destinations
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {sorted.map((trip) => (
              <FavoriteCard
                key={trip.planId ?? trip.id}
                trip={trip}
                onRemove={removeFavorite}
                onBookAgain={handleBookAgain}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
