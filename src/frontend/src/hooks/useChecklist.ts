import type { ChecklistItem } from "@/types/travel";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wanderassist-checklist";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Documents
  {
    id: "cl-001",
    label: "Passport (valid 6+ months)",
    completed: false,
    category: "Documents",
  },
  {
    id: "cl-002",
    label: "Visa obtained",
    completed: false,
    category: "Documents",
  },
  {
    id: "cl-003",
    label: "Travel insurance",
    completed: false,
    category: "Documents",
  },
  {
    id: "cl-004",
    label: "Flight tickets printed/downloaded",
    completed: false,
    category: "Documents",
  },
  {
    id: "cl-005",
    label: "Hotel booking confirmation",
    completed: false,
    category: "Documents",
  },
  {
    id: "cl-006",
    label: "Emergency contact list",
    completed: false,
    category: "Documents",
  },
  // Health
  {
    id: "cl-007",
    label: "Required vaccinations",
    completed: false,
    category: "Health",
  },
  {
    id: "cl-008",
    label: "Prescription medicines (30-day supply)",
    completed: false,
    category: "Health",
  },
  {
    id: "cl-009",
    label: "First aid kit",
    completed: false,
    category: "Health",
  },
  {
    id: "cl-010",
    label: "Sunscreen & insect repellent",
    completed: false,
    category: "Health",
  },
  // Finance
  {
    id: "cl-011",
    label: "Foreign currency exchanged",
    completed: false,
    category: "Finance",
  },
  {
    id: "cl-012",
    label: "Inform bank of travel dates",
    completed: false,
    category: "Finance",
  },
  {
    id: "cl-013",
    label: "International credit card active",
    completed: false,
    category: "Finance",
  },
  {
    id: "cl-014",
    label: "Travel budget set",
    completed: false,
    category: "Finance",
  },
  // Packing
  {
    id: "cl-015",
    label: "Clothes packed (per weather)",
    completed: false,
    category: "Packing",
  },
  {
    id: "cl-016",
    label: "Phone charger & universal adapter",
    completed: false,
    category: "Packing",
  },
  {
    id: "cl-017",
    label: "Camera & memory cards",
    completed: false,
    category: "Packing",
  },
  {
    id: "cl-018",
    label: "Luggage locks",
    completed: false,
    category: "Packing",
  },
  // Pre-Travel
  {
    id: "cl-019",
    label: "Home security arranged",
    completed: false,
    category: "Pre-Travel",
  },
  {
    id: "cl-020",
    label: "Pets/plants care arranged",
    completed: false,
    category: "Pre-Travel",
  },
];

function loadChecklist(): ChecklistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ChecklistItem[];
  } catch {
    // ignore
  }
  return DEFAULT_CHECKLIST;
}

function saveChecklist(items: ChecklistItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(loadChecklist);

  useEffect(() => {
    saveChecklist(items);
  }, [items]);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }, []);

  const resetChecklist = useCallback(() => {
    setItems(DEFAULT_CHECKLIST);
    saveChecklist(DEFAULT_CHECKLIST);
  }, []);

  const categories = [...new Set(items.map((i) => i.category))];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    items,
    toggleItem,
    resetChecklist,
    categories,
    completedCount,
    totalCount,
    progress,
  };
}
