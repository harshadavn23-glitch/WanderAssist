import { Button } from "@/components/ui/button";
import { useChecklist } from "@/hooks/useChecklist";
import type { ChecklistItem } from "@/types/travel";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  CreditCard,
  FileText,
  Heart,
  Laptop,
  Package,
  Plus,
  RefreshCw,
  Shirt,
} from "lucide-react";
import { useState } from "react";

const PRIORITY_MAP: Record<string, "Essential" | "Recommended"> = {
  "cl-001": "Essential",
  "cl-002": "Essential",
  "cl-003": "Essential",
  "cl-004": "Essential",
  "cl-005": "Essential",
  "cl-006": "Recommended",
  "cl-007": "Essential",
  "cl-008": "Essential",
  "cl-009": "Recommended",
  "cl-010": "Recommended",
  "cl-011": "Essential",
  "cl-012": "Essential",
  "cl-013": "Recommended",
  "cl-014": "Recommended",
  "cl-015": "Essential",
  "cl-016": "Essential",
  "cl-017": "Recommended",
  "cl-018": "Recommended",
  "cl-019": "Recommended",
  "cl-020": "Recommended",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Documents: <FileText size={15} />,
  Health: <Heart size={15} />,
  Finance: <CreditCard size={15} />,
  Packing: <Package size={15} />,
  "Pre-Travel": <Laptop size={15} />,
  Clothing: <Shirt size={15} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Documents:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  Health:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  Finance:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  Packing:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  "Pre-Travel":
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  Clothing:
    "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
};

interface ChecklistRowProps {
  item: ChecklistItem;
  priority: "Essential" | "Recommended";
  onToggle: (id: string) => void;
}

function ChecklistRow({ item, priority, onToggle }: ChecklistRowProps) {
  const catColor =
    CATEGORY_COLORS[item.category] ??
    "bg-muted text-muted-foreground border-border";
  return (
    <label
      htmlFor={`checkbox-${item.id}`}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-fast cursor-pointer select-none ${
        item.completed
          ? "bg-muted/30 border-border opacity-70"
          : "bg-card border-border hover:border-primary/30 hover:bg-primary/[0.03]"
      }`}
      data-ocid={`checklist-item-${item.id}`}
    >
      <input
        id={`checkbox-${item.id}`}
        type="checkbox"
        className="sr-only"
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        aria-label={item.label}
      />
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-fast ${
          item.completed
            ? "bg-primary border-primary"
            : "border-input bg-background"
        }`}
        aria-hidden="true"
      >
        {item.completed && (
          <CheckCircle2 size={13} className="text-primary-foreground" />
        )}
      </div>
      <span
        className={`flex-1 text-sm leading-snug min-w-0 ${
          item.completed
            ? "line-through text-muted-foreground"
            : "text-foreground"
        }`}
      >
        {item.label}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${catColor}`}
        >
          {CATEGORY_ICONS[item.category]}
          {item.category}
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            priority === "Essential"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {priority}
        </span>
      </div>
    </label>
  );
}

export default function DocumentChecklist() {
  const {
    items,
    toggleItem,
    resetChecklist,
    categories,
    completedCount,
    totalCount,
  } = useChecklist();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const [customItems, setCustomItems] = useState<ChecklistItem[]>([]);

  const allCategories = ["All", ...categories];

  const baseItems = [...items, ...customItems];
  const displayed =
    activeCategory === "All"
      ? baseItems
      : baseItems.filter((i) => i.category === activeCategory);

  const criticalMissing = items.filter(
    (i) => !i.completed && (i.id === "cl-001" || i.id === "cl-002"),
  );

  const customCompleted = customItems.filter((i) => i.completed).length;
  const allCompleted = completedCount + customCompleted;
  const allTotal = totalCount + customItems.length;
  const allProgress =
    allTotal > 0 ? Math.round((allCompleted / allTotal) * 100) : 0;

  const handleAddCustom = () => {
    const label = newItem.trim();
    if (!label) return;
    const custom: ChecklistItem = {
      id: `custom-${Date.now()}`,
      label,
      completed: false,
      category: "Packing",
    };
    setCustomItems((prev) => [...prev, custom]);
    setNewItem("");
    setAdding(false);
  };

  const handleToggle = (id: string) => {
    if (id.startsWith("custom-")) {
      setCustomItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)),
      );
    } else {
      toggleItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border shadow-subtle">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckSquare size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Document Checklist
              </h1>
              <p className="text-sm text-muted-foreground">
                Never miss an important travel document
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                {allCompleted} of {allTotal} items completed
              </span>
              <span
                className={`font-bold ${allProgress === 100 ? "text-emerald-600" : "text-primary"}`}
              >
                {allProgress}%
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-smooth"
                style={{ width: `${allProgress}%` }}
              />
            </div>
            {allProgress === 100 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} />
                All items checked — you're ready to go!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Critical warning banner */}
        {criticalMissing.length > 0 && (
          <div
            className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 animate-slide-up"
            data-ocid="checklist-warning-banner"
          >
            <AlertTriangle
              size={18}
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                Critical items missing!
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                {criticalMissing.map((i) => i.label).join(" & ")}{" "}
                {criticalMissing.length > 1 ? "are" : "is"} not yet checked.
                These are required for international travel.
              </p>
            </div>
          </div>
        )}

        {/* Category filters */}
        <div
          className="flex gap-2 flex-wrap"
          data-ocid="checklist-category-filters"
        >
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-fast ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {CATEGORY_ICONS[cat]}
              {cat}
            </button>
          ))}
        </div>

        {/* Checklist items */}
        <div className="space-y-2 animate-fade-in">
          {displayed.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              priority={PRIORITY_MAP[item.id] ?? "Recommended"}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Add custom item */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Add Custom Item
          </p>
          {adding ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                placeholder="e.g. Travel pillow, Snacks..."
                className="flex-1 rounded-lg border border-input bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-fast placeholder:text-muted-foreground"
                data-ocid="checklist-new-item-input"
                // biome-ignore lint/a11y/noAutofocus: intentional for UX
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustom}
                data-ocid="checklist-add-confirm-btn"
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setAdding(false);
                  setNewItem("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
              className="gap-2"
              data-ocid="checklist-add-item-btn"
            >
              <Plus size={14} />
              Add Custom Item
            </Button>
          )}
        </div>

        {/* Reset button */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetChecklist}
            className="gap-2 text-muted-foreground"
            data-ocid="checklist-reset-btn"
          >
            <RefreshCw size={13} />
            Reset All
          </Button>
        </div>

        {/* All done celebration */}
        {allProgress === 100 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="text-5xl mb-3">✈️</div>
            <h2 className="font-display font-bold text-xl mb-2">
              You're All Packed!
            </h2>
            <p className="text-muted-foreground text-sm">
              Every item is checked. Have an amazing trip!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
