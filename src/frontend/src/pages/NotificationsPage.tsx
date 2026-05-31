// NotificationsPage.tsx — Travel reminders with canister-backed preferences
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  type ReminderToggles,
  useNotifications,
} from "@/hooks/useNotifications";
import { useSession } from "@/hooks/useSession";
import type { BookingDetails } from "@/types/travel";
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Plane,
  Trash2,
} from "lucide-react";

interface ReminderRow {
  label: string;
  field: keyof ReminderToggles;
}

const REMINDER_ROWS: ReminderRow[] = [
  { label: "7 days before", field: "remind7Days" },
  { label: "3 days before", field: "remind3Days" },
  { label: "1 day before", field: "remind1Day" },
];

const DEFAULT_PREFS: ReminderToggles = {
  remind7Days: true,
  remind3Days: true,
  remind1Day: true,
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DaysBadge({ days }: { days: number }) {
  if (days < 0)
    return (
      <Badge variant="outline" className="text-xs shrink-0">
        Past
      </Badge>
    );
  if (days === 0)
    return (
      <Badge variant="destructive" className="text-xs shrink-0">
        Today!
      </Badge>
    );
  if (days <= 3)
    return (
      <Badge variant="destructive" className="text-xs shrink-0">
        {days}d left
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-xs shrink-0">
      {days} days left
    </Badge>
  );
}

function BookingReminderCard({
  booking,
  prefs,
  onToggle,
}: {
  booking: BookingDetails;
  prefs: ReminderToggles;
  onToggle: (field: keyof ReminderToggles) => void;
}) {
  const travelDate =
    (booking as BookingDetails & { startDate?: string }).startDate ??
    booking.createdAt.split("T")[0];
  const days = daysUntil(travelDate);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-foreground truncate">
              {booking.destination}
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(travelDate)}
              </span>
            </div>
          </div>
          <DaysBadge days={days} />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="px-4 py-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Remind me before departure
        </p>
        {REMINDER_ROWS.map(({ label, field }) => (
          <div
            key={field}
            className="flex items-center justify-between py-1"
            data-ocid={`reminder-toggle-${booking.id}-${field}`}
          >
            <span className="text-sm text-foreground">{label}</span>
            <Switch
              checked={prefs[field]}
              onCheckedChange={() => onToggle(field)}
              aria-label={`${label} reminder for ${booking.destination}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const { session } = useSession();
  const userId = session?.userId ?? "";

  const {
    preferences,
    history,
    confirmedBookings,
    isLoadingPrefs,
    isClearingHistory,
    error,
    toggleReminder,
    clearHistory,
  } = useNotifications(userId);

  function handleToggle(booking: BookingDetails, field: keyof ReminderToggles) {
    const travelDate =
      (booking as BookingDetails & { startDate?: string }).startDate ??
      booking.createdAt.split("T")[0];
    void toggleReminder(booking.id, booking.destination, travelDate, field);
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Page header */}
      <div className="bg-card border-b border-border px-4 py-6 sm:px-8">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage travel reminders for your upcoming trips
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-8 space-y-8">
        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
            data-ocid="notif-error-banner"
          >
            <BellOff className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{error}</p>
          </div>
        )}

        {/* Confirmed bookings section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">
              Your Trips
            </h2>
            <Badge variant="secondary" className="ml-auto text-xs">
              {confirmedBookings.length}
            </Badge>
          </div>

          {isLoadingPrefs ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 bg-muted/30 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : confirmedBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12 text-center gap-3">
                <BellOff className="w-10 h-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">
                  No confirmed trips
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Book a trip and your reminders will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4" data-ocid="notifications-upcoming-list">
              {confirmedBookings.map((booking) => (
                <BookingReminderCard
                  key={booking.id}
                  booking={booking}
                  prefs={preferences[booking.id] ?? DEFAULT_PREFS}
                  onToggle={(field) => handleToggle(booking, field)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Notification history */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              Notification History
            </h2>
            {history.length > 0 && (
              <>
                <Badge variant="outline" className="ml-auto text-xs">
                  {history.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void clearHistory()}
                  disabled={isClearingHistory}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs gap-1"
                  data-ocid="notifications-clear-history"
                >
                  {isClearingHistory ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Clear
                </Button>
              </>
            )}
          </div>

          {history.length === 0 ? (
            <Card className="border-dashed" data-ocid="empty-history">
              <CardContent className="flex flex-col items-center py-10 text-center gap-3">
                <Clock className="w-10 h-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">
                  No notification history yet
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Fired reminders will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2" data-ocid="notifications-history-list">
              {history.map((item) => (
                <Card key={String(item.id)} className="bg-muted/20">
                  <CardContent className="flex items-center gap-3 py-3 px-4">
                    <Bell className="w-4 h-4 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(item.firedAt) / 1_000_000,
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px] shrink-0">
                      {item.reminderType}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-center text-muted-foreground pb-2">
          Reminders require browser notification permission. Enabling a toggle
          will request access if not already granted.
        </p>
      </div>
    </div>
  );
}
