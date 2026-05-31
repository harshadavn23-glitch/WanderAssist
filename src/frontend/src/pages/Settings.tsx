import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  Globe,
  Info,
  Lock,
  LogOut,
  MessageSquare,
  Moon,
  Settings as SettingsIcon,
  Sun,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface NotificationPrefs {
  travelAlerts: boolean;
  bookingUpdates: boolean;
  communityMessages: boolean;
  promotionalOffers: boolean;
}

interface ProfileData {
  name: string;
  email: string;
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS_NOTIF = "wanderassist-notifications";
const LS_LANG = "wanderassist-language";
const LS_PROFILE = "wanderassist-profile-settings";

function loadNotifications(): NotificationPrefs {
  try {
    const s = localStorage.getItem(LS_NOTIF);
    if (s) return JSON.parse(s) as NotificationPrefs;
  } catch {
    /* ignore */
  }
  return {
    travelAlerts: true,
    bookingUpdates: true,
    communityMessages: true,
    promotionalOffers: false,
  };
}

function saveNotifications(prefs: NotificationPrefs) {
  try {
    localStorage.setItem(LS_NOTIF, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  id,
}: { checked: boolean; onChange: () => void; id?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      id={id}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[oklch(0.99_0_0)] shadow transition-transform duration-300 ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

// ── Setting row ───────────────────────────────────────────────────────────────
function SettingRow({
  label,
  desc,
  checked,
  onChange,
  id,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: () => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-4">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </Label>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} id={id} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Settings() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { session, logout } = useSession();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    () => localStorage.getItem(LS_LANG) ?? "en",
  );
  const [notifs, setNotifs] = useState<NotificationPrefs>(loadNotifications);

  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const s = localStorage.getItem(LS_PROFILE);
      if (s) return JSON.parse(s) as ProfileData;
    } catch {
      /* ignore */
    }
    return {
      name: session?.userName ?? "Traveler",
      email: session?.userEmail ?? "traveler@wanderassist.app",
    };
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);

  const [changingPassword, setChangingPassword] = useState(false);
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [pwSuccess, setPwSuccess] = useState(false);

  const [clearBookingsConfirm, setClearBookingsConfirm] = useState(false);
  const [clearChatConfirm, setClearChatConfirm] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const [feedback, setFeedback] = useState({ name: "", message: "" });

  useEffect(() => {
    localStorage.setItem(LS_LANG, language);
  }, [language]);
  useEffect(() => {
    saveNotifications(notifs);
  }, [notifs]);

  const toggleNotif = (key: keyof NotificationPrefs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    setProfile(draftProfile);
    try {
      localStorage.setItem(LS_PROFILE, JSON.stringify(draftProfile));
    } catch {
      /* ignore */
    }
    setEditingProfile(false);
    toast.success("Profile updated successfully!");
  };

  const handleChangePassword = () => {
    if (!pwData.current || !pwData.next || pwData.next !== pwData.confirm) {
      toast.error("Passwords do not match or fields are empty.");
      return;
    }
    setPwSuccess(true);
    setTimeout(() => {
      setChangingPassword(false);
      setPwData({ current: "", next: "", confirm: "" });
      setPwSuccess(false);
    }, 1500);
    toast.success("Password changed successfully!");
  };

  const handleClearBookings = () => {
    localStorage.removeItem("wanderassist-bookings");
    setClearBookingsConfirm(false);
    toast.success("Booking history cleared.");
  };

  const handleClearChat = () => {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("wanderassist-chat"),
    );
    for (const k of keys) localStorage.removeItem(k);
    setClearChatConfirm(false);
    toast.success("Chat history cleared.");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate({ to: "/login" });
  };

  const handleFeedback = () => {
    if (!feedback.name.trim() || !feedback.message.trim()) {
      toast.error("Please fill in all feedback fields.");
      return;
    }
    toast.success(
      "Thank you for your feedback! We'll get back to you soon. 🙏",
    );
    setFeedback({ name: "", message: "" });
  };

  const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" },
  ];

  const CONFIRM_DIALOGS = [
    {
      open: clearBookingsConfirm,
      setOpen: setClearBookingsConfirm,
      title: "Clear Booking History",
      desc: "This will permanently delete all your booking records.",
      onConfirm: handleClearBookings,
      confirmLabel: "Clear History",
    },
    {
      open: clearChatConfirm,
      setOpen: setClearChatConfirm,
      title: "Clear Chat History",
      desc: "All messages in all community chat rooms will be deleted.",
      onConfirm: handleClearChat,
      confirmLabel: "Clear Chats",
    },
    {
      open: logoutConfirm,
      setOpen: setLogoutConfirm,
      title: "Log Out",
      desc: "You will be signed out of your account.",
      onConfirm: handleLogout,
      confirmLabel: "Log Out",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="secondary">Settings</Badge>
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-1">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your preferences and account
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Appearance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {isDark ? (
                <Moon className="w-4 h-4 text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Switch between light and dark theme
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex gap-2 p-2 bg-muted/40 rounded-xl border border-border"
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${!isDark ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    <Sun className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                </motion.div>
                <Toggle
                  checked={isDark}
                  onChange={toggleDark}
                  id="dark-mode-toggle"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4 text-primary" /> Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  App Language
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose your preferred language
                </p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36 h-9" data-ocid="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              id="notif-travel"
              label="Travel Alerts"
              desc="Flight delays, weather warnings, and travel advisories"
              checked={notifs.travelAlerts}
              onChange={() => toggleNotif("travelAlerts")}
            />
            <SettingRow
              id="notif-booking"
              label="Booking Updates"
              desc="Confirmations, cancellations, and reminders"
              checked={notifs.bookingUpdates}
              onChange={() => toggleNotif("bookingUpdates")}
            />
            <SettingRow
              id="notif-community"
              label="Community Messages"
              desc="Replies and mentions in chat rooms"
              checked={notifs.communityMessages}
              onChange={() => toggleNotif("communityMessages")}
            />
            <SettingRow
              id="notif-promo"
              label="Promotional Offers"
              desc="Deals, discounts, and special packages"
              checked={notifs.promotionalOffers}
              onChange={() => toggleNotif("promotionalOffers")}
            />
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-primary" /> User Profile
              </CardTitle>
              {!editingProfile && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setDraftProfile(profile);
                    setEditingProfile(true);
                  }}
                  data-ocid="edit-profile-btn"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {editingProfile ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      value={draftProfile.name}
                      onChange={(e) =>
                        setDraftProfile((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Your name"
                      className="h-9"
                      data-ocid="profile-name-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Address</Label>
                    <Input
                      type="email"
                      value={draftProfile.email}
                      onChange={(e) =>
                        setDraftProfile((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      placeholder="your@email.com"
                      className="h-9"
                      data-ocid="profile-email-input"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleSaveProfile}
                      data-ocid="save-profile-btn"
                    >
                      Save Changes
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold font-display text-primary shrink-0">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {profile.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {profile.email}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Traveler
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="w-4 h-4 text-primary" /> Privacy &amp; Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Change password */}
            <div>
              <button
                type="button"
                onClick={() => setChangingPassword((p) => !p)}
                data-ocid="change-password-btn"
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors text-sm text-foreground"
              >
                <span className="font-medium">Change Password</span>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform ${changingPassword ? "rotate-90" : ""}`}
                />
              </button>
              <AnimatePresence>
                {changingPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {pwSuccess ? (
                      <div className="p-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-500/10 rounded-lg mt-1">
                        <Check className="w-4 h-4" /> Password changed
                        successfully!
                      </div>
                    ) : (
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg mt-1">
                        <Input
                          type="password"
                          placeholder="Current password"
                          className="h-8 text-sm"
                          value={pwData.current}
                          onChange={(e) =>
                            setPwData((p) => ({
                              ...p,
                              current: e.target.value,
                            }))
                          }
                        />
                        <Input
                          type="password"
                          placeholder="New password"
                          className="h-8 text-sm"
                          value={pwData.next}
                          onChange={(e) =>
                            setPwData((p) => ({ ...p, next: e.target.value }))
                          }
                        />
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="h-8 text-sm"
                          value={pwData.confirm}
                          onChange={(e) =>
                            setPwData((p) => ({
                              ...p,
                              confirm: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={handleChangePassword}
                          data-ocid="confirm-password-btn"
                        >
                          Update Password
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator />

            <button
              type="button"
              onClick={() => setClearBookingsConfirm(true)}
              data-ocid="clear-bookings-btn"
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-destructive/5 transition-colors text-sm text-destructive"
            >
              <span className="font-medium">Clear Booking History</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setClearChatConfirm(true)}
              data-ocid="clear-chat-btn"
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-destructive/5 transition-colors text-sm text-destructive"
            >
              <span className="font-medium">Clear Chat History</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4 text-primary" /> Send Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Your name"
              value={feedback.name}
              onChange={(e) =>
                setFeedback((p) => ({ ...p, name: e.target.value }))
              }
              className="h-9"
              data-ocid="feedback-name-input"
            />
            <Textarea
              placeholder="Share your thoughts, suggestions, or issues..."
              value={feedback.message}
              onChange={(e) =>
                setFeedback((p) => ({ ...p, message: e.target.value }))
              }
              rows={4}
              className="resize-none"
              data-ocid="feedback-message-input"
            />
            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleFeedback}
              data-ocid="feedback-submit-btn"
            >
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-4 h-4 text-primary" /> About
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">App Version</span>
              <Badge variant="outline" className="font-mono text-xs">
                1.0.0
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Platform</span>
              <span className="text-foreground font-medium">WanderAssist</span>
            </div>
            <p className="text-muted-foreground text-xs italic border-t border-border mt-2 pt-3">
              "Your intelligent travel companion — discover, plan, and journey
              fearlessly."
            </p>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="pb-6">
          <Button
            type="button"
            variant="destructive"
            className="w-full flex items-center gap-2 justify-center"
            onClick={() => setLogoutConfirm(true)}
            data-ocid="logout-btn"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
        </div>
      </div>

      {/* Confirm Dialogs */}
      {CONFIRM_DIALOGS.map(
        ({ open, setOpen, title, desc, onConfirm, confirmLabel }) => (
          <AnimatePresence key={title}>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setOpen(false);
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 12 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95 }}
                  className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <h3 className="text-base font-bold font-display text-foreground">
                      {title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    {desc} This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      onClick={onConfirm}
                      data-ocid={`confirm-${confirmLabel.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {confirmLabel}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        ),
      )}
    </div>
  );
}
