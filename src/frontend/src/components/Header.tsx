import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  LogOut,
  Map as MapIcon,
  Menu,
  Moon,
  Package,
  Plane,
  Search,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { SideMenu } from "./SideMenu";
import { WanderAssistLogo } from "./WanderAssistLogo";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/package-tours", label: "Tours", icon: Package },
  { to: "/women-community", label: "Community", icon: Users },
];

export function Header() {
  const { isDark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { session, logout } = useSession();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  // Header is always fully opaque — never transparent regardless of scroll position or page
  const useTransparent = false;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          useTransparent
            ? "bg-transparent border-transparent shadow-none"
            : "bg-card/95 backdrop-blur-md border-b border-border shadow-subtle",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg transition-colors w-9 h-9",
                  useTransparent
                    ? "text-white hover:bg-white/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setSideMenuOpen(true)}
                aria-label="Open side menu"
                data-ocid="header-hamburger"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Link
                to="/"
                className="flex items-center gap-2 transition-smooth hover:opacity-85"
                data-ocid="header-logo"
              >
                <WanderAssistLogo className="w-11 h-11 rounded-full shrink-0" />
                <div className="flex flex-col leading-none">
                  <span
                    className={cn(
                      "font-display font-bold text-[1.1rem] leading-tight",
                      useTransparent
                        ? "text-white text-shadow-sm"
                        : "text-foreground",
                    )}
                  >
                    WanderAssist
                  </span>
                  {!useTransparent && (
                    <span className="text-[10px] text-muted-foreground font-body leading-none">
                      Explore the world
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav — always visible on md+ */}
            <nav
              className="hidden md:flex items-center gap-0.5 flex-1 justify-center"
              data-ocid="header-nav"
            >
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = currentPath === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-smooth relative",
                      useTransparent
                        ? isActive
                          ? "bg-white/25 text-white font-semibold"
                          : "text-white/80 hover:text-white hover:bg-white/15"
                        : isActive
                          ? "bg-accent/10 text-accent font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {isActive && !useTransparent && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Dark Mode Toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggle}
                className={cn(
                  "rounded-lg transition-smooth w-9 h-9",
                  useTransparent
                    ? "text-white hover:bg-white/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
                data-ocid="dark-mode-toggle"
              >
                {isDark ? (
                  <Sun className="w-4.5 h-4.5 text-accent" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </Button>

              {session?.loggedIn && (
                <>
                  {/* User avatar + name on desktop */}
                  <div
                    className={cn(
                      "hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg",
                      useTransparent ? "bg-white/10" : "bg-muted/50",
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 flex items-center justify-center font-bold text-accent text-xs border border-accent/30 shrink-0">
                      {session.userName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium max-w-[80px] truncate hidden md:block",
                        useTransparent ? "text-white/90" : "text-foreground",
                      )}
                    >
                      {session.userName}
                    </span>
                  </div>
                  {/* Logout button — always visible on sm+ */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-1.5 h-9 px-2.5 text-sm font-medium",
                      useTransparent
                        ? "text-white/80 hover:text-white hover:bg-white/15"
                        : "text-destructive/80 hover:text-destructive hover:bg-destructive/10",
                    )}
                    aria-label="Sign out"
                    data-ocid="header-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              )}

              {/* Book Now CTA */}
              <Link to="/travel-plan" className="hidden sm:block">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-md border-0 h-9 px-4 text-sm"
                  data-ocid="header-book-cta"
                >
                  <Plane className="w-3.5 h-3.5 mr-1.5" />
                  Book Now
                </Button>
              </Link>

              {/* Mobile extras toggle (for logout/book when not logged in) */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "md:hidden rounded-lg w-9 h-9",
                  useTransparent
                    ? "text-white hover:bg-white/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                data-ocid="header-mobile-menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile extras dropdown (logout + book now) */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card backdrop-blur-md animate-slide-up">
            <div className="px-4 py-3 flex flex-col gap-2">
              <Link to="/travel-plan" onClick={() => setMobileOpen(false)}>
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-0 h-10"
                  data-ocid="mobile-book-cta"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
              </Link>
              {session?.loggedIn && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 h-10 font-semibold text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
                  data-ocid="mobile-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({session.userName})
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Bottom Navigation Bar — visible on mobile/tablet (below md) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        data-ocid="bottom-nav"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch h-16">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors relative",
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground",
                )}
                data-ocid={`bottom-nav-${label.toLowerCase()}`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-accent" : "text-muted-foreground",
                  )}
                />
                <span className={cn(isActive ? "font-semibold" : "")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
    </>
  );
}
