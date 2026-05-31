import type { SurprisePlan } from "@/types/travel";

const STORAGE_KEY = "wanderassist-surprise-plans";

export const defaultSurprisePlans: Record<string, SurprisePlan> = {
  SP12345: {
    code: "SP12345",
    destination: "Bali",
    occasion: "Romance",
    description:
      "Bali Romance Getaway — tropical beaches, temples & a private villa",
    cost: 85000,
    decorations: [
      "Rose petal turndown",
      "Floating flower bath",
      "Candlelit beach dinner",
      "Couple spa ritual",
    ],
    days: 6,
    itinerary: [
      "Day 1: Arrive Denpasar, private villa check-in, welcome cocktails",
      "Day 2: Ubud rice terraces, Tirta Empul temple blessing",
      "Day 3: Nusa Penida island — Kelingking Beach, snorkeling",
      "Day 4: Couples spa day, Tanah Lot sunset",
      "Day 5: Seminyak beach, candlelit dinner at Jimbaran",
      "Day 6: Sunrise at Mount Batur, departure",
    ],
    bookingCode: "SP12345",
  },
  SP67890: {
    code: "SP67890",
    destination: "Manali",
    occasion: "Adventure",
    description:
      "Manali Snow Adventure — Himalayan thrills, snow, rivers & monasteries",
    cost: 45000,
    decorations: [
      "Bonfire setup",
      "Mountain view tent",
      "Adventure kit provided",
    ],
    days: 6,
    itinerary: [
      "Day 1: Arrive Manali, acclimatization walk in Old Manali",
      "Day 2: Solang Valley — snow activities & cable car",
      "Day 3: Rohtang Pass excursion (seasonal)",
      "Day 4: Beas River white water rafting & Hadimba Temple",
      "Day 5: Kasol day trip & Parvati Valley trek",
      "Day 6: Local market, souvenir shopping, departure",
    ],
    bookingCode: "SP67890",
  },
  SP11111: {
    code: "SP11111",
    destination: "Kerala",
    occasion: "Wellness",
    description:
      "Kerala Backwaters Wellness Retreat — Ayurveda, backwaters & beaches",
    cost: 35000,
    decorations: [
      "Flower garland welcome",
      "Ayurvedic massage included",
      "Houseboat decoration",
    ],
    days: 7,
    itinerary: [
      "Day 1: Arrive Kochi, Fort Kochi heritage walk",
      "Day 2: Munnar tea estate tour & Eravikulam National Park",
      "Day 3: Thekkady Periyar Wildlife Sanctuary",
      "Day 4: Alleppey houseboat check-in, backwater cruise",
      "Day 5: Houseboat — sunrise, village visits",
      "Day 6: Kovalam Beach, Ayurvedic spa day",
      "Day 7: Trivandrum, Padmanabhaswamy Temple, departure",
    ],
    bookingCode: "SP11111",
  },
};

export function initSurprisePlans(): void {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSurprisePlans));
  }
}

export function getSurprisePlan(code: string): SurprisePlan | null {
  initSurprisePlans();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const plans = JSON.parse(stored) as Record<string, SurprisePlan>;
  return plans[code.toUpperCase()] ?? null;
}

export function getAllSurprisePlans(): Record<string, SurprisePlan> {
  initSurprisePlans();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultSurprisePlans;
  return JSON.parse(stored) as Record<string, SurprisePlan>;
}

/**
 * Save a newly generated surprise plan to localStorage so it can be validated
 * when the user enters the code in the Travel Plan page.
 */
export function saveGeneratedPlan(plan: SurprisePlan): void {
  initSurprisePlans();
  const stored = localStorage.getItem(STORAGE_KEY);
  const plans = stored
    ? (JSON.parse(stored) as Record<string, SurprisePlan>)
    : { ...defaultSurprisePlans };
  plans[plan.code.toUpperCase()] = plan;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function validateSurprisePlanCode(code: string): boolean {
  if (code.toUpperCase() === "SP12345") return true;
  return getSurprisePlan(code) !== null;
}

// Legacy alias
export function validateCode(code: string): boolean {
  return validateSurprisePlanCode(code);
}
