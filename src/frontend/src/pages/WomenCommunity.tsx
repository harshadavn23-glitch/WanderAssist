import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage } from "@/types/travel";
import {
  Check,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Shield,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Traveler {
  id: string;
  name: string;
  initials: string;
  destination: string;
  connected: boolean;
  joined: boolean;
}

const TRAVELERS: Traveler[] = [
  {
    id: "t1",
    name: "Ananya Sharma",
    initials: "AS",
    destination: "Bali, Indonesia",
    connected: false,
    joined: false,
  },
  {
    id: "t2",
    name: "Priya Mehta",
    initials: "PM",
    destination: "Paris, France",
    connected: false,
    joined: false,
  },
  {
    id: "t3",
    name: "Kavya Reddy",
    initials: "KR",
    destination: "Tokyo, Japan",
    connected: false,
    joined: false,
  },
  {
    id: "t4",
    name: "Neha Joshi",
    initials: "NJ",
    destination: "Maldives",
    connected: false,
    joined: false,
  },
  {
    id: "t5",
    name: "Ritika Singh",
    initials: "RS",
    destination: "Goa, India",
    connected: false,
    joined: false,
  },
];

const SAFETY_TIPS = [
  "Always share your itinerary with a trusted friend or family member before leaving.",
  "Keep digital and physical copies of all important documents (passport, visa, ID).",
  "Research local customs and dress codes before visiting a new country.",
  "Book your first night's accommodation before arrival — never arrive without a place to stay.",
  "Use hotel safes for valuables and carry a dummy wallet with small cash as decoy.",
  "Stay on well-lit, populated streets, especially after dark.",
  "Download offline maps and save emergency numbers for each country you visit.",
  "Trust your gut — if a situation feels unsafe, leave immediately without hesitation.",
  "Join women-only travel groups online before your trip for local insights.",
  "Keep your phone charged and share live location with contacts during solo excursions.",
];

const SEED_MESSAGES: Record<
  string,
  { sender: string; avatar: string; message: string }[]
> = {
  "general-discussion": [
    {
      sender: "Ananya S.",
      avatar: "AS",
      message:
        "Just got back from Bali — absolutely loved it! Highly recommend the Ubud rice terraces 🌾",
    },
    {
      sender: "Priya M.",
      avatar: "PM",
      message:
        "Paris in spring is magical! The Marais neighbourhood is great for solo female travelers 🗼",
    },
    {
      sender: "Kavya R.",
      avatar: "KR",
      message:
        "Tokyo felt incredibly safe as a solo woman traveler. The train system is amazing!",
    },
  ],
  "safety-tips": [
    {
      sender: "Neha J.",
      avatar: "NJ",
      message:
        "Always book a taxi from a reputable app — don't accept rides from strangers 🚕",
    },
    {
      sender: "Ritika S.",
      avatar: "RS",
      message:
        "I carry a door alarm when staying in hostels. Game changer for peace of mind 🔒",
    },
    {
      sender: "Ananya S.",
      avatar: "AS",
      message:
        "Download She's The First app — great community of women who've been where you're going 📱",
    },
  ],
  "destination-recommendations": [
    {
      sender: "Priya M.",
      avatar: "PM",
      message:
        "Kerala backwaters is #1 on my Indian destinations list. So serene and welcoming 🌴",
    },
    {
      sender: "Kavya R.",
      avatar: "KR",
      message:
        "Pondicherry has amazing French architecture and the best cafés. Perfect solo trip 🥐",
    },
    {
      sender: "Neha J.",
      avatar: "NJ",
      message:
        "Singapore is perfect for first-time solo female travelers — safe, clean, English-friendly 🦁",
    },
  ],
};

function RoomChat({ room }: { room: string }) {
  const { messages, sendMessage, isTyping } = useChat(room);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on chat updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-[340px]">
      <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-muted/20 rounded-t-lg">
        {messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.isSelf ? "flex-row-reverse" : ""}`}
          >
            {!msg.isSelf && (
              <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[10px] font-bold text-fuchsia-500 shrink-0 mt-0.5">
                {msg.avatar}
              </div>
            )}
            <div
              className={`max-w-[78%] flex flex-col gap-0.5 ${msg.isSelf ? "items-end" : "items-start"}`}
            >
              {!msg.isSelf && (
                <span className="text-[10px] text-muted-foreground px-1">
                  {msg.sender}
                </span>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-sm break-words ${msg.isSelf ? "bg-fuchsia-500 text-white rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm"}`}
              >
                {msg.message}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[10px] font-bold text-fuchsia-500 shrink-0">
              WA
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground block"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 p-3 border-t border-border bg-card rounded-b-lg">
        <Input
          placeholder="Share your thoughts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="h-9 text-sm"
          data-ocid="community-chat-input"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!input.trim()}
          className="h-9 w-9 shrink-0 bg-fuchsia-500 hover:bg-fuchsia-400 text-white"
          data-ocid="community-chat-send"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface TravelerChatModalProps {
  traveler: Traveler;
  onClose: () => void;
}

function TravelerChatModal({ traveler, onClose }: TravelerChatModalProps) {
  const roomKey = `traveler-${traveler.id}`;
  const { messages, sendMessage, isTyping } = useChat(roomKey);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = `wanderassist-chat-${roomKey}`;
    if (!localStorage.getItem(key)) {
      const welcomeMsgs: ChatMessage[] = [
        {
          id: `seed-${traveler.id}`,
          room: roomKey,
          sender: traveler.name,
          avatar: traveler.initials,
          message: `Hey! I'm heading to ${traveler.destination} soon. Would love to connect with fellow travelers! 🌏`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
      localStorage.setItem(key, JSON.stringify(welcomeMsgs));
    }
  }, [traveler, roomKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on chat updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl shadow-hero w-full max-w-md overflow-hidden flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            background: "linear-gradient(135deg, #a21caf 0%, #db2777 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold font-display text-white">
              {traveler.initials}
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-white leading-none">
                {traveler.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-white/70" />
                <p className="text-xs text-white/70 truncate max-w-[160px]">
                  {traveler.destination}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background min-h-0">
          {messages.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.isSelf ? "flex-row-reverse" : ""}`}
            >
              {!msg.isSelf && (
                <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[10px] font-bold text-fuchsia-500 shrink-0 mt-1">
                  {msg.avatar}
                </div>
              )}
              <div
                className={`max-w-[78%] flex flex-col gap-0.5 ${msg.isSelf ? "items-end" : "items-start"}`}
              >
                {!msg.isSelf && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${msg.isSelf ? "bg-fuchsia-500 text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-[10px] font-bold text-fuchsia-500 shrink-0">
                {traveler.initials}
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground block"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border p-3 bg-card shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder={`Message ${traveler.name.split(" ")[0]}…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="h-9 text-sm"
              data-ocid="traveler-chat-input"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-9 w-9 shrink-0 bg-fuchsia-500 hover:bg-fuchsia-400 text-white"
              data-ocid="traveler-chat-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WomenCommunity() {
  const [travelers, setTravelers] = useState<Traveler[]>(TRAVELERS);
  const [activeRoom, setActiveRoom] = useState("general-discussion");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [story, setStory] = useState("");
  const [storySubmitted, setStorySubmitted] = useState(false);
  const [chatModalTraveler, setChatModalTraveler] = useState<Traveler | null>(
    null,
  );
  const { sendMessage: sendToGeneral } = useChat("general-discussion");

  useEffect(() => {
    const ROOMS = [
      "general-discussion",
      "safety-tips",
      "destination-recommendations",
    ];
    for (const room of ROOMS) {
      const key = `wanderassist-chat-${room}`;
      if (!localStorage.getItem(key)) {
        const seed = SEED_MESSAGES[room];
        if (seed) {
          const msgs: ChatMessage[] = seed.map((s, i) => ({
            id: `seed-${i}`,
            room,
            sender: s.sender,
            avatar: s.avatar,
            message: s.message,
            timestamp: new Date(
              Date.now() - (seed.length - i) * 3 * 60000,
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }));
          localStorage.setItem(key, JSON.stringify(msgs));
        }
      }
    }
  }, []);

  const handleConnect = (traveler: Traveler) => {
    if (traveler.connected) return;
    setTravelers((prev) =>
      prev.map((t) => (t.id === traveler.id ? { ...t, connected: true } : t)),
    );
    toast.success("Connected Successfully! 🤝", {
      description: `You're now connected with ${traveler.name}`,
      duration: 4000,
    });
    setChatModalTraveler({ ...traveler, connected: true });
  };

  const handleJoin = (traveler: Traveler) => {
    setTravelers((prev) =>
      prev.map((t) => (t.id === traveler.id ? { ...t, joined: true } : t)),
    );
    if (!traveler.joined) {
      toast.success("Joined Successfully! 🎉", {
        description: `You've joined ${traveler.name}'s group tour to ${traveler.destination}`,
        duration: 4000,
      });
    }
    setActiveRoom("general-discussion");
    setChatModalTraveler({ ...traveler, joined: true });
  };

  const handleShareStory = () => {
    if (!story.trim()) return;
    sendToGeneral(story.trim(), "You", "ME");
    setStorySubmitted(true);
    setStory("");
    setTimeout(() => {
      setShareModalOpen(false);
      setStorySubmitted(false);
    }, 1500);
  };

  const TABS = [
    { value: "general-discussion", label: "General Discussion" },
    { value: "safety-tips", label: "Safety Tips" },
    { value: "destination-recommendations", label: "Destinations" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero with atmospheric background */}
      <section
        className="relative py-16"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(120,0,100,0.75) 0%, rgba(10,22,40,0.88) 100%)",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-fuchsia-300" />
            </div>
            <Badge className="bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/40 font-medium">
              Community
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white text-shadow-hero mb-2">
            Women Travel Community
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Connect, share, travel safely
          </p>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { icon: Users, label: "Active Members", value: "847" },
              { icon: Globe, label: "Trips Shared", value: "1,243" },
              { icon: MapPin, label: "Countries Covered", value: "68" },
            ].map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <Icon className="w-5 h-5 text-fuchsia-300 mx-auto mb-1" />
                <div className="text-xl font-bold font-display text-white">
                  {value}
                </div>
                <div className="text-xs text-white/60 mt-0.5">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Female Travelers */}
        <section>
          <h2 className="text-xl font-bold font-display text-foreground mb-4">
            Female Travelers Nearby
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {travelers.map((traveler, i) => (
              <motion.div
                key={traveler.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="hover:shadow-elevated transition-smooth border-border overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-fuchsia-500 to-rose-500" />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-display text-white shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #a21caf, #db2777)",
                        }}
                      >
                        {traveler.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {traveler.name}
                        </p>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {traveler.destination}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className={`flex-1 text-xs h-8 ${traveler.connected ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0" : "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 font-bold"}`}
                        onClick={() => handleConnect(traveler)}
                        disabled={traveler.connected}
                        data-ocid={`connect-btn-${traveler.id}`}
                      >
                        {traveler.connected ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Connected ✓
                          </span>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={`flex-1 text-xs h-8 ${traveler.joined ? "border-fuchsia-500/50 text-fuchsia-600 dark:text-fuchsia-400" : ""}`}
                        onClick={() => handleJoin(traveler)}
                        data-ocid={`join-btn-${traveler.id}`}
                      >
                        {traveler.joined ? "Joined ✓" : "Join Group Tour"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Chat Rooms */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-fuchsia-500" /> Community
              Chat Rooms
            </h2>
            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 font-bold"
              onClick={() => setShareModalOpen(true)}
              data-ocid="share-story-btn"
            >
              Share Your Story
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeRoom} onValueChange={setActiveRoom}>
                <TabsList className="w-full mb-4 flex flex-wrap gap-1 h-auto">
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex-1 text-xs"
                      data-ocid={`tab-${tab.value}`}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <RoomChat room={tab.value} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Safety Tips */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-fuchsia-500" /> Top 10 Safety
                Tips for Solo Female Travelers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {SAFETY_TIPS.map((tip, i) => (
                  <motion.li
                    key={tip}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 items-start text-sm text-foreground leading-relaxed"
                  >
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #a21caf, #db2777)",
                      }}
                    >
                      {i + 1}
                    </span>
                    {tip}
                  </motion.li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Share Story Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShareModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-card border border-border rounded-2xl shadow-hero p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-display text-foreground">
                  Share Your Story
                </h3>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  aria-label="Close modal"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {storySubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-fuchsia-500/15 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-7 h-7 text-fuchsia-500" />
                  </div>
                  <p className="font-semibold text-foreground">
                    Story shared! ✓
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your story is now in General Discussion.
                  </p>
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder="Tell the community about your travel experience..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    rows={5}
                    className="resize-none mb-4"
                    data-ocid="story-textarea"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShareModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 font-bold"
                      disabled={!story.trim()}
                      onClick={handleShareStory}
                      data-ocid="story-submit-btn"
                    >
                      Share Story
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatModalTraveler && (
          <TravelerChatModal
            traveler={chatModalTraveler}
            onClose={() => setChatModalTraveler(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
