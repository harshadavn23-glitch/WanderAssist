import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emergencyContacts } from "@/data/emergencyContacts";
import type { EmergencyContact } from "@/types/travel";
import {
  AlertTriangle,
  Bell,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Edit2,
  Flame,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Shield,
  ShieldCheck,
  Store,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface SOSAlert {
  id: string;
  timestamp: string;
  location: string;
  status: "sent" | "acknowledged";
}

interface PersonalContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  editing: boolean;
}

const SAFE_ROUTES = [
  {
    title: "Route via MG Road",
    desc: "Well-lit main road, heavy foot traffic. 12 min walk.",
    icon: MapPin,
    tag: "Well-lit",
  },
  {
    title: "Central Bus Stand Route",
    desc: "Busy road with shops and CCTV coverage. 8 min walk.",
    icon: Car,
    tag: "Busy street",
  },
  {
    title: "Metro Station Path",
    desc: "Connects to safe metro network. Security personnel present.",
    icon: Navigation,
    tag: "Safe transport",
  },
];

const SAFE_ZONES = [
  {
    name: "Police Station",
    dist: "0.3 km",
    icon: Shield,
    colorClass: "text-blue-400 bg-blue-500/20",
  },
  {
    name: "City Hospital",
    dist: "0.8 km",
    icon: Heart,
    colorClass: "text-red-400 bg-red-500/20",
  },
  {
    name: "Indian Embassy",
    dist: "2.1 km",
    icon: Building2,
    colorClass: "text-sky-400 bg-sky-500/20",
  },
  {
    name: "24/7 Convenience Store",
    dist: "0.1 km",
    icon: Store,
    colorClass: "text-emerald-400 bg-emerald-500/20",
  },
];

const CHECKIN_INTERVALS = [
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every 1 hour" },
  { value: "300", label: "Every 5 hours" },
];

const DEFAULT_CONTACTS: PersonalContact[] = [
  {
    id: "c1",
    name: "Mom",
    phone: "+91 98765 43210",
    relation: "Family",
    editing: false,
  },
  {
    id: "c2",
    name: "Dad",
    phone: "+91 87654 32109",
    relation: "Family",
    editing: false,
  },
  {
    id: "c3",
    name: "Local Police",
    phone: "100",
    relation: "Emergency",
    editing: false,
  },
];

const LS_ALERTS = "wanderassist-sos-alerts";
const LS_CONTACTS = "wanderassist-emergency-contacts";

function loadAlerts(): SOSAlert[] {
  try {
    const stored = localStorage.getItem(LS_ALERTS);
    if (stored) return JSON.parse(stored) as SOSAlert[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveAlerts(alerts: SOSAlert[]) {
  try {
    localStorage.setItem(LS_ALERTS, JSON.stringify(alerts));
  } catch {
    /* ignore */
  }
}

function loadPersonalContacts(): PersonalContact[] {
  try {
    const stored = localStorage.getItem(LS_CONTACTS);
    if (stored) return JSON.parse(stored) as PersonalContact[];
  } catch {
    /* ignore */
  }
  return DEFAULT_CONTACTS;
}

function savePersonalContacts(c: PersonalContact[]) {
  try {
    localStorage.setItem(LS_CONTACTS, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export default function Emergency() {
  const [sosState, setSosState] = useState<"idle" | "sending" | "sent">("idle");
  const [sosAlert, setSosAlert] = useState<SOSAlert | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [locationSharing, setLocationSharing] = useState(false);
  const [checkinInterval, setCheckinInterval] = useState("30");
  const [checkinActive, setCheckinActive] = useState(false);
  const [checkinCountdown, setCheckinCountdown] = useState(0);
  const [contacts, setContacts] =
    useState<PersonalContact[]>(loadPersonalContacts);
  const [editValues, setEditValues] = useState<
    Record<string, { name: string; phone: string }>
  >({});
  const [alertHistory, setAlertHistory] = useState<SOSAlert[]>(loadAlerts);

  const currentEmergency: EmergencyContact | undefined =
    emergencyContacts.find((c) =>
      c.country.toLowerCase().includes(selectedCountry.toLowerCase()),
    ) ?? emergencyContacts[0];

  useEffect(() => {
    if (!checkinActive) return;
    const secs = Number(checkinInterval) * 60;
    setCheckinCountdown(secs);
    const interval = setInterval(() => {
      setCheckinCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [checkinActive, checkinInterval]);

  const handleSOS = () => {
    if (sosState !== "idle") return;
    setSosState("sending");
    setTimeout(() => {
      const refId = `SOS-${Date.now().toString(36).toUpperCase()}`;
      const alert: SOSAlert = {
        id: refId,
        timestamp: new Date().toLocaleString(),
        location: "Current GPS location",
        status: "sent",
      };
      setSosAlert(alert);
      setSosState("sent");
      const updated = [alert, ...alertHistory];
      setAlertHistory(updated);
      saveAlerts(updated);
    }, 2500);
  };

  const resetSOS = () => {
    setSosState("idle");
    setSosAlert(null);
  };

  const handleEditContact = (id: string) => {
    const c = contacts.find((ct) => ct.id === id);
    if (!c) return;
    setEditValues((prev) => ({
      ...prev,
      [id]: { name: c.name, phone: c.phone },
    }));
    setContacts((prev) =>
      prev.map((ct) => (ct.id === id ? { ...ct, editing: true } : ct)),
    );
  };

  const handleSaveContact = (id: string) => {
    const vals = editValues[id];
    if (!vals) return;
    const updated = contacts.map((ct) =>
      ct.id === id
        ? { ...ct, name: vals.name, phone: vals.phone, editing: false }
        : ct,
    );
    setContacts(updated);
    savePersonalContacts(updated);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Alert-style hero */}
      <section
        className="relative py-12"
        style={{
          background:
            "linear-gradient(135deg, #7f1d1d 0%, #1e3a5f 50%, #0a1628 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-500/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
            <Badge className="bg-red-500/30 text-red-200 border-red-400/40 font-medium">
              Emergency
            </Badge>
          </div>
          <h1 className="text-4xl font-bold font-display text-white text-shadow-hero mb-1">
            Emergency SOS
          </h1>
          <p className="text-white/65">
            Your safety is our priority. Help is one tap away.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOS Button */}
          <Card className="border-red-500/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <CardContent className="p-6 flex flex-col items-center text-center">
              <p className="text-sm font-medium text-muted-foreground mb-6">
                Press in an emergency to alert your contacts
              </p>
              <div className="relative mb-6">
                {sosState === "idle" && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={handleSOS}
                  disabled={sosState !== "idle"}
                  aria-label="Send SOS alert"
                  data-ocid="sos-btn"
                  className={`relative w-36 h-36 rounded-full font-bold font-display text-xl text-white shadow-xl transition-all duration-300 select-none ${
                    sosState === "idle"
                      ? "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 active:scale-95 cursor-pointer glow-rose"
                      : sosState === "sending"
                        ? "bg-red-500/70 cursor-not-allowed"
                        : "bg-emerald-600 cursor-default"
                  }`}
                >
                  {sosState === "idle" && "SEND SOS"}
                  {sosState === "sending" && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span className="text-sm">Sending...</span>
                    </div>
                  )}
                  {sosState === "sent" && (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-8 h-8" />
                      <span className="text-sm">Sent ✓</span>
                    </div>
                  )}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {sosState === "sending" && (
                  <motion.div
                    key="sending"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Wifi className="w-4 h-4 animate-pulse text-red-500" />{" "}
                    Sending location to emergency contacts...
                  </motion.div>
                )}
                {sosState === "sent" && sosAlert && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-left space-y-1"
                  >
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Location sent to
                      emergency contacts ✓
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Alert ID:{" "}
                      <span className="font-mono font-semibold">
                        {sosAlert.id}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Time: {sosAlert.timestamp}
                    </p>
                    <button
                      type="button"
                      onClick={resetSOS}
                      className="mt-2 text-xs text-destructive hover:underline font-medium"
                      data-ocid="sos-reset-btn"
                    >
                      Reset SOS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Location + Check-in */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Navigation className="w-4 h-4 text-amber-500" /> Live
                  Location Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    Share my location
                  </span>
                  <button
                    type="button"
                    onClick={() => setLocationSharing((p) => !p)}
                    data-ocid="location-toggle"
                    aria-label="Toggle location sharing"
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${locationSharing ? "bg-amber-500" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${locationSharing ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {locationSharing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-muted-foreground space-y-1"
                    >
                      <p className="font-medium text-foreground">
                        Location being shared with:
                      </p>
                      {["Mom", "Dad", "Local Police"].map((name) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{name}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="w-4 h-4 text-amber-500" /> Safety Check-in
                  Reminder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={checkinInterval}
                  onValueChange={setCheckinInterval}
                >
                  <SelectTrigger className="h-9" data-ocid="checkin-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECKIN_INTERVALS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {checkinActive && checkinCountdown > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" /> Next check-in
                    in:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {formatCountdown(checkinCountdown)}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  variant={checkinActive ? "outline" : "default"}
                  onClick={() => setCheckinActive((p) => !p)}
                  data-ocid="checkin-start-btn"
                >
                  {checkinActive ? "Stop Check-in" : "Start Check-in"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency numbers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="w-4 h-4 text-amber-500" /> Emergency Numbers
              </CardTitle>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger
                  className="w-44 h-8 text-xs"
                  data-ocid="country-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emergencyContacts.map((c) => (
                    <SelectItem
                      key={c.country}
                      value={c.country}
                      className="text-xs"
                    >
                      {c.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {currentEmergency && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Police",
                    value: currentEmergency.police,
                    icon: Shield,
                    colorClass: "text-blue-500 dark:text-blue-400",
                  },
                  {
                    label: "Ambulance",
                    value: currentEmergency.ambulance,
                    icon: Heart,
                    colorClass: "text-red-500 dark:text-red-400",
                  },
                  {
                    label: "Fire",
                    value: currentEmergency.fire,
                    icon: Flame,
                    colorClass: "text-orange-500 dark:text-orange-400",
                  },
                  {
                    label: "Embassy",
                    value: currentEmergency.embassy,
                    icon: Building2,
                    colorClass: "text-amber-500",
                  },
                ].map(({ label, value, icon: Icon, colorClass }) => (
                  <div
                    key={label}
                    className="bg-muted/40 rounded-xl p-3 text-center"
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${colorClass}`} />
                    <p className="text-xs text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p
                      className={`font-bold text-sm font-display break-all ${colorClass}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Safe Routes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Navigation className="w-4 h-4 text-amber-500" /> Safe Routes
                Nearby
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAFE_ROUTES.map((route) => (
                <div
                  key={route.title}
                  className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg"
                >
                  <route.icon className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium text-foreground">
                        {route.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {route.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {route.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Safe Zones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Nearby Safe
                Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAFE_ZONES.map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${zone.colorClass}`}
                    >
                      <zone.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {zone.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {zone.dist}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Emergency contacts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="w-4 h-4 text-amber-500" /> My Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #1e3a5f, #0f766e)",
                  }}
                >
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>
                {contact.editing ? (
                  <div className="flex-1 flex gap-2 items-center min-w-0">
                    <input
                      type="text"
                      value={editValues[contact.id]?.name ?? contact.name}
                      onChange={(e) =>
                        setEditValues((p) => ({
                          ...p,
                          [contact.id]: {
                            ...p[contact.id],
                            name: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 h-7 text-sm bg-background border border-input rounded px-2 min-w-0"
                    />
                    <input
                      type="text"
                      value={editValues[contact.id]?.phone ?? contact.phone}
                      onChange={(e) =>
                        setEditValues((p) => ({
                          ...p,
                          [contact.id]: {
                            ...p[contact.id],
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 h-7 text-sm bg-background border border-input rounded px-2 min-w-0"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs px-2 shrink-0"
                      onClick={() => handleSaveContact(contact.id)}
                      data-ocid={`save-contact-${contact.id}`}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contact.phone} · {contact.relation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditContact(contact.id)}
                      aria-label={`Edit ${contact.name}`}
                      data-ocid={`edit-contact-${contact.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-amber-500" /> SOS Alert History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No alerts sent yet. Stay safe! 🛡️
              </p>
            ) : (
              <div className="space-y-2">
                {alertHistory.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-mono font-semibold text-destructive text-xs">
                        {alert.id}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {alert.timestamp}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.status === "acknowledged"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {alert.status === "acknowledged"
                        ? "Acknowledged"
                        : "Sent"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
