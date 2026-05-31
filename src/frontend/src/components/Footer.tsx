import { Link } from "@tanstack/react-router";
import { Globe, Heart, Mail, Plane, Shield } from "lucide-react";

const footerLinks = {
  Destinations: [
    { label: "International", to: "/search?type=international" },
    { label: "India Tours", to: "/search?type=indian" },
    { label: "Budget Travel", to: "/budget-travel" },
    { label: "Senior Tours", to: "/senior-tours" },
  ],
  Services: [
    { label: "Package Tours", to: "/package-tours" },
    { label: "Travel Plan", to: "/travel-plan" },
    { label: "Surprise Plans", to: "/travel-plan?surprisePlan=true" },
    { label: "Women Community", to: "/women-community" },
  ],
  Explore: [
    { label: "Interactive Map", to: "/map" },
    { label: "Search Places", to: "/search" },
    { label: "Random Travel", to: "/?random=true" },
    { label: "Budget Planner", to: "/budget-travel" },
  ],
};

const features = [
  { icon: Globe, label: "18 Destinations" },
  { icon: Shield, label: "Secure Booking" },
  { icon: Mail, label: "24/7 Support" },
  { icon: Heart, label: "Trusted by 10k+" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Features bar */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-accent" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                WanderAssist
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your intelligent travel companion. Discover, plan, and book your
              dream journey with ease.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-display font-semibold text-sm text-foreground mb-3">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-muted-foreground hover:text-accent transition-smooth"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Making travel dreams a reality ✈️
          </p>
        </div>
      </div>
    </footer>
  );
}
