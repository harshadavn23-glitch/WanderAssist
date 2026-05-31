import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Calculator,
  Calendar,
  CircleDollarSign,
  ClipboardList,
  Globe,
  Heart,
  Home,
  Languages,
  LogOut,
  Map as MapIcon,
  Phone,
  Plane,
  Scan,
  Search,
  Settings,
  Users,
  Wifi,
  X,
} from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    id: "navigation",
    label: "Navigation",
    items: [
      { id: "home", to: "/", label: "Home", icon: Home },
      {
        id: "search",
        to: "/search",
        label: "Search Destinations",
        icon: Search,
      },
      { id: "map", to: "/map", label: "Interactive Map", icon: MapIcon },
      { id: "plan", to: "/travel-plan", label: "Plan My Trip", icon: Plane },
    ],
  },
  {
    id: "tours",
    label: "Tours & Packages",
    items: [
      { id: "senior", to: "/senior-tours", label: "Senior Tours", icon: Users },
      {
        id: "budget",
        to: "/budget",
        label: "Budget Travel",
        icon: CircleDollarSign,
      },
      {
        id: "surprise",
        to: "/surprise-planner",
        label: "Surprise Planner",
        icon: Globe,
      },
    ],
  },
  {
    id: "tools",
    label: "Travel Tools",
    items: [
      {
        id: "currency",
        to: "/currency-converter",
        label: "Currency Converter",
        icon: CircleDollarSign,
      },
      {
        id: "scanner",
        to: "/currency-scanner",
        label: "Currency Scanner",
        icon: Scan,
      },
      {
        id: "calculator",
        to: "/budget-calculator",
        label: "Budget Calculator",
        icon: Calculator,
      },
      {
        id: "translator",
        to: "/language-translator",
        label: "Language Translator",
        icon: Languages,
      },
      {
        id: "checklist",
        to: "/document-checklist",
        label: "Document Checklist",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "trips",
    label: "My Trips",
    items: [
      {
        id: "bookings",
        to: "/booking-history",
        label: "Booking History",
        icon: BookOpen,
      },
      {
        id: "favorites",
        to: "/favorite-trips",
        label: "Favorite Trips",
        icon: Heart,
      },
      {
        id: "updates",
        to: "/travel-updates",
        label: "Travel Updates",
        icon: Wifi,
      },
      {
        id: "notifications",
        to: "/notifications",
        label: "Notifications",
        icon: Bell,
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      {
        id: "women",
        to: "/women-community",
        label: "Women Community",
        icon: Users,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "settings", to: "/settings", label: "Settings", icon: Settings },
      {
        id: "emergency",
        to: "/emergency",
        label: "Emergency Contacts",
        icon: Phone,
      },
    ],
  },
];

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { session, logout } = useSession();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onClose();
    navigate({ to: "/login" });
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card border-r border-border shadow-elevated z-50 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Side navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shadow-subtle">
              <Plane className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-foreground tracking-tight">
                WanderAssist
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Your travel companion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-fast focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {session?.loggedIn && (
          <div className="px-4 py-3 bg-muted/30 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center font-bold text-accent text-sm border border-accent/20">
                {session.userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground truncate">
                  {session.userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.userEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
          aria-label="Main navigation"
        >
          {menuSections.map((section) => (
            <div key={section.id} className="mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-3 pb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ id, to, label, icon: Icon }) => {
                  const isActive = currentPath === to;
                  return (
                    <Link
                      key={id}
                      to={to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-fast focus-ring",
                        isActive
                          ? "bg-accent/10 text-accent font-semibold border-l-4 border-accent pl-2"
                          : "text-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                      data-ocid={`sidemenu-${id}`}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-accent" : "text-muted-foreground",
                        )}
                      />
                      <span className="truncate">{label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
              <Separator className="mt-2 opacity-50" />
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 shrink-0 space-y-3">
          {session?.loggedIn ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 h-10 font-semibold text-sm"
              data-ocid="sidemenu-logout"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Link to="/login" onClick={onClose}>
              <Button
                type="button"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-10 font-semibold text-sm"
                data-ocid="sidemenu-login"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Login / Sign Up
              </Button>
            </Link>
          )}
          <p className="text-[10px] text-center text-muted-foreground">
            © {new Date().getFullYear()} WanderAssist · Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "wanderassist")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
