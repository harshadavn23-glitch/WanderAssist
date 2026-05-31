import type { ChatMessage } from "@/types/travel";
import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "wanderassist-chat-";
const MAX_MESSAGES = 50;

const COMMUNITY_MEMBERS = [
  { sender: "Priya S.", avatar: "PS" },
  { sender: "Rohan K.", avatar: "RK" },
  { sender: "Meera V.", avatar: "MV" },
  { sender: "Aditya T.", avatar: "AT" },
  { sender: "Sunita L.", avatar: "SL" },
];

const AUTO_REPLIES = [
  "That sounds amazing! Which part did you enjoy most? 🌍",
  "Great tip! I'll keep that in mind for my next trip 💙",
  "Thanks for sharing! Has anyone else been there recently?",
  "Wow, that's incredible! Would you recommend it for solo travelers?",
  "Such a beautiful destination! How was the weather? ☀️",
  "Love this community! Always great advice here 🌺",
  "I'm planning to visit there too! Any budget recommendations?",
  "The food there is unreal! Did you try the local cuisine? 🍜",
];

function getWelcomeMessage(room: string): ChatMessage {
  return {
    id: "welcome",
    room,
    sender: "WanderAssist",
    avatar: "WA",
    message: `Welcome to the ${room} community! Share your travel stories, tips, and adventures 👋`,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function loadMessages(room: string): ChatMessage[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${room}`);
    if (stored) {
      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed)
        ? parsed.slice(-MAX_MESSAGES)
        : [getWelcomeMessage(room)];
    }
  } catch {
    // ignore
  }
  return [getWelcomeMessage(room)];
}

function saveMessages(room: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${room}`,
      JSON.stringify(messages.slice(-MAX_MESSAGES)),
    );
  } catch {
    // ignore
  }
}

export function useChat(room = "General") {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadMessages(room),
  );
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMessages(loadMessages(room));
  }, [room]);

  const sendMessage = useCallback(
    (text: string, senderName = "You", senderAvatar = "ME") => {
      if (!text.trim()) return;

      const newMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        room,
        sender: senderName,
        avatar: senderAvatar,
        message: text.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSelf: senderName === "You",
      };

      setMessages((prev) => {
        const updated = [...prev, newMsg];
        saveMessages(room, updated);
        return updated;
      });

      // Simulate reply after delay
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const member =
          COMMUNITY_MEMBERS[
            Math.floor(Math.random() * COMMUNITY_MEMBERS.length)
          ];
        const reply: ChatMessage = {
          id: `reply-${Date.now()}`,
          room,
          sender: member.sender,
          avatar: member.avatar,
          message:
            AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => {
          const updated = [...prev, reply];
          saveMessages(room, updated);
          return updated;
        });
      }, 1500);
    },
    [room],
  );

  const clearMessages = useCallback(() => {
    const welcome = getWelcomeMessage(room);
    setMessages([welcome]);
    saveMessages(room, [welcome]);
  }, [room]);

  return { messages, isTyping, sendMessage, clearMessages };
}
