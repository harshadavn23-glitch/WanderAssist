import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type TravelUpdate, travelUpdates } from "@/data/travelUpdates";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  CloudSun,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Info,
  Plane,
  RefreshCw,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type FilterTab = "all" | "alert" | "advisory" | "weather" | "visa";
type Severity = "critical" | "warning" | "info";

interface UpdateState extends TravelUpdate {
  read: boolean;
}

function getSeverity(update: TravelUpdate): Severity {
  if (update.urgent) return "critical";
  if (update.category === "safety") return "warning";
  return "info";
}

function getCategoryIcon(category: TravelUpdate["category"]) {
  switch (category) {
    case "safety":
      return AlertTriangle;
    case "visa":
      return FileText;
    case "weather":
      return CloudSun;
    case "deal":
      return Plane;
    default:
      return Globe;
  }
}

function getCategoryLabel(category: TravelUpdate["category"]): string {
  const labels: Record<TravelUpdate["category"], string> = {
    safety: "Safety Alert",
    visa: "Visa Update",
    weather: "Weather",
    deal: "Deal",
    news: "News",
  };
  return labels[category];
}

function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === "critical") {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
        Critical
      </Badge>
    );
  }
  if (severity === "warning") {
    return (
      <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
        Warning
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Info
    </Badge>
  );
}

function matchesTab(update: TravelUpdate, tab: FilterTab): boolean {
  if (tab === "all") return true;
  if (tab === "alert") return update.category === "safety" || update.urgent;
  if (tab === "advisory")
    return update.category === "news" || update.category === "deal";
  if (tab === "weather") return update.category === "weather";
  if (tab === "visa") return update.category === "visa";
  return true;
}

const TAB_OPTIONS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "alert", label: "Alerts" },
  { id: "advisory", label: "Advisories" },
  { id: "weather", label: "Weather" },
  { id: "visa", label: "Visa Changes" },
];

export default function TravelUpdates() {
  const [updates, setUpdates] = useState<UpdateState[]>(() =>
    travelUpdates.map((u) => ({ ...u, read: false })),
  );
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(() => new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Auto-refresh every 30 seconds — updates timestamp display
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const filteredUpdates = updates.filter((u) => {
    if (!matchesTab(u, activeTab)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.title.toLowerCase().includes(q) ||
        u.summary.toLowerCase().includes(q) ||
        u.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = updates.filter((u) => !u.read).length;

  const markAsRead = useCallback((id: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, read: true } : u)),
    );
  }, []);

  const toggleRead = useCallback((id: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, read: !u.read } : u)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setUpdates((prev) => prev.map((u) => ({ ...u, read: true })));
    toast.success("All updates marked as read");
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
      toast.success("Feed refreshed");
    }, 800);
  }

  function handleSubscribe() {
    setSubscribed((prev) => {
      const next = !prev;
      if (next)
        toast.success(
          "Subscribed! You'll be notified about new travel advisories.",
        );
      else toast.info("Unsubscribed from travel alerts");
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-card border-b shadow-subtle">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Live Feed
              </Badge>
              {unreadCount > 0 && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Travel Updates
            </h1>
            <p className="text-muted-foreground mt-1">
              Latest advisories, visa changes, weather alerts, and travel news.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Subscribe banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <Card
            className={`p-4 flex items-center justify-between gap-4 flex-wrap ${subscribed ? "bg-primary/5 border-primary/20" : "bg-accent/5 border-accent/20"}`}
          >
            <div className="flex items-center gap-3">
              {subscribed ? (
                <Bell className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <BellOff className="w-5 h-5 text-accent shrink-0" />
              )}
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {subscribed
                    ? "Subscribed to alerts"
                    : "Stay informed — subscribe to alerts"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscribed
                    ? "You'll be notified about new advisories and critical alerts."
                    : "Get notified about travel advisories, visa changes, and weather alerts."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={subscribed ? "outline" : "default"}
              size="sm"
              onClick={handleSubscribe}
              data-ocid="subscribe-alerts-btn"
            >
              {subscribed ? "Unsubscribe" : "Subscribe to Alerts"}
            </Button>
          </Card>
        </motion.div>

        {/* Controls row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search updates, destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-ocid="updates-search-input"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                data-ocid="updates-refresh-btn"
                className="gap-2"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markAllRead}
                  data-ocid="updates-mark-all-read-btn"
                  className="gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes
            every 30s
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as FilterTab)}
          >
            <TabsList className="flex-wrap h-auto gap-1">
              {TAB_OPTIONS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  data-ocid={`updates-tab-${tab.id}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Updates list */}
        <AnimatePresence mode="popLayout">
          {filteredUpdates.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="updates-empty-state"
            >
              <Info className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-foreground">No updates found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different filter or search term
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredUpdates.map((update, index) => {
                const Icon = getCategoryIcon(update.category);
                const severity = getSeverity(update);
                return (
                  <motion.div
                    key={update.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <Card
                      className={`p-5 transition-smooth hover:shadow-elevated cursor-pointer ${update.read ? "opacity-70" : ""} ${severity === "critical" ? "border-l-4 border-l-destructive" : severity === "warning" ? "border-l-4 border-l-accent" : ""}`}
                      onClick={() => markAsRead(update.id)}
                      data-ocid={`update-card-${update.id}`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${severity === "critical" ? "bg-destructive/10" : severity === "warning" ? "bg-accent/10" : "bg-primary/10"}`}
                        >
                          <Icon
                            className={`w-5 h-5 ${severity === "critical" ? "text-destructive" : severity === "warning" ? "text-accent" : "text-primary"}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <SeverityBadge severity={severity} />
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(update.category)}
                              </Badge>
                              <span className="badge-accent text-xs">
                                {update.destination}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRead(update.id);
                              }}
                              className="p-1 rounded hover:bg-muted transition-fast"
                              aria-label={
                                update.read ? "Mark as unread" : "Mark as read"
                              }
                              data-ocid={`toggle-read-${update.id}`}
                            >
                              {update.read ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-primary" />
                              )}
                            </button>
                          </div>
                          <h3
                            className={`leading-snug mb-1 ${update.read ? "text-muted-foreground font-normal text-sm" : "font-semibold text-foreground text-sm"}`}
                          >
                            {update.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {update.summary}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span>
                              {new Date(update.date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span>·</span>
                            <span>{update.source}</span>
                            {!update.read && (
                              <>
                                <span>·</span>
                                <span className="text-primary font-medium">
                                  Unread
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
