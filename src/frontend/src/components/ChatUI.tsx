import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/types/travel";
import { MessageCircle, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "wanderassist-chat";
const MAX_MESSAGES = 20;

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  room: "General",
  sender: "WanderAssist",
  avatar: "WA",
  message: "Welcome to WanderAssist community! Share your travel stories 👋",
  timestamp: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const AUTO_REPLIES = [
  "That sounds amazing! Which part did you enjoy most? 🌍",
  "Great tip! I'll keep that in mind for my next trip 💙",
  "Thanks for sharing! Has anyone else been there recently?",
  "Wow, that's incredible! Would you recommend it for solo travelers?",
  "Such a beautiful destination! How was the weather? ☀️",
  "Love this community! Always great advice here 🌺",
];

/** Travel tips used for bot auto-replies (satisfies the 1-second mock bot requirement). */
const TRAVEL_TIPS = [
  "✈️ Tip: Always carry a power bank — airports and long layovers drain your battery fast!",
  "🗺️ Tip: Download offline maps before you travel. Google Maps offline mode works great.",
  "💊 Tip: Pack a small first-aid kit with basic meds — it saves the day in remote places.",
  "📷 Tip: The golden hour (just after sunrise) is the best time for destination photos.",
  "💳 Tip: Notify your bank before traveling abroad to avoid card blocks.",
  "🧳 Tip: Roll your clothes instead of folding — saves space and reduces wrinkles.",
  "🏨 Tip: Book accommodations in advance during peak season to get the best rates.",
];

function loadMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed)
        ? parsed.slice(-MAX_MESSAGES)
        : [WELCOME_MESSAGE];
    }
  } catch {
    // ignore
  }
  return [WELCOME_MESSAGE];
}

function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_MESSAGES)),
    );
  } catch {
    // ignore
  }
}

interface ChatUIProps {
  onClose: () => void;
  /** Optional room/group name shown in the header */
  roomName?: string;
}

export function ChatUI({ onClose, roomName }: ChatUIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const charCount = input.length;
  const maxChars = 500;

  // Scroll to bottom whenever messages or typing indicator changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || charCount > maxChars) return;

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      room: "General",
      sender: "You",
      avatar: "ME",
      message: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isSelf: true,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(updated);
    setInput("");

    // Typing indicator → bot travel tip reply after ~1 second
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: `reply-${Date.now()}`,
        room: "General",
        sender: "Priya S.",
        avatar: "PS",
        message:
          Math.random() < 0.5
            ? AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
            : TRAVEL_TIPS[Math.floor(Math.random() * TRAVEL_TIPS.length)],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      const withReply = [...updated, reply];
      setMessages(withReply);
      saveMessages(withReply);
    }, 1000);
  };

  const displayName = roomName ?? "Community Chat";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-4 right-4 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden flex flex-col"
      data-ocid="chat-ui"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold font-display">{displayName}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-primary-foreground/70">
                2,400+ members online
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="opacity-70 hover:opacity-100 transition-colors duration-150"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-background"
        style={{ maxHeight: "400px" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.isSelf ? "flex-row-reverse" : ""}`}
          >
            {!msg.isSelf && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-1">
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
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                  msg.isSelf
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {msg.message}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-1">
              PS
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-3 bg-card shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={input}
              maxLength={maxChars}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="h-9 text-sm pr-12"
              data-ocid="chat-input"
            />
            <span
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] ${charCount > maxChars - 50 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {charCount}/{maxChars}
            </span>
          </div>
          <Button
            type="button"
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || charCount > maxChars}
            className="h-9 w-9 bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
            data-ocid="chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
