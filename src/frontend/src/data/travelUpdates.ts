export interface TravelUpdate {
  id: string;
  title: string;
  summary: string;
  category: "visa" | "safety" | "weather" | "deal" | "news";
  destination: string;
  date: string;
  urgent: boolean;
  source: string;
}

export const travelUpdates: TravelUpdate[] = [
  {
    id: "tu-001",
    title: "India Extends E-Visa Facility to 170+ Countries",
    summary:
      "India has expanded its e-visa program, making it easier for travelers from over 170 nations to obtain tourist visas online in under 72 hours.",
    category: "visa",
    destination: "India",
    date: "2026-04-10",
    urgent: false,
    source: "Ministry of Tourism India",
  },
  {
    id: "tu-002",
    title: "Bali Implements New Tourist Levy from May 2026",
    summary:
      "Bali is rolling out a 150,000 IDR (~₹830) tourist tax for all international visitors to fund environmental conservation efforts.",
    category: "news",
    destination: "Bali",
    date: "2026-04-08",
    urgent: false,
    source: "Bali Tourism Board",
  },
  {
    id: "tu-003",
    title: "Monsoon Alert: Kerala Travel Advisory Issued",
    summary:
      "The Indian Meteorological Department has issued an early monsoon advisory for Kerala. Travelers should check conditions before booking June–August dates.",
    category: "weather",
    destination: "Kerala",
    date: "2026-04-07",
    urgent: true,
    source: "IMD India",
  },
  {
    id: "tu-004",
    title: "Dubai Summer Deals: Flights at Historic Lows",
    summary:
      "Emirates and IndiGo are offering Dubai round trips from major Indian cities starting ₹18,000 all-inclusive for travel in July–August 2026.",
    category: "deal",
    destination: "Dubai",
    date: "2026-04-06",
    urgent: false,
    source: "TravelDeals.in",
  },
  {
    id: "tu-005",
    title: "Manali–Rohtang Pass Road Opens Earlier than Expected",
    summary:
      "BRO announces Rohtang Pass will be accessible from May 1st, 2026 — two weeks ahead of schedule due to lighter snowfall this winter.",
    category: "news",
    destination: "Manali",
    date: "2026-04-05",
    urgent: false,
    source: "Border Roads Organisation",
  },
  {
    id: "tu-006",
    title: "Japan Eases Visa Process for Indian Tourists",
    summary:
      "Japan has simplified its visa application for Indian passport holders, cutting approval time from 3 weeks to 5 business days.",
    category: "visa",
    destination: "Tokyo",
    date: "2026-04-04",
    urgent: false,
    source: "Embassy of Japan",
  },
  {
    id: "tu-007",
    title: "Singapore Changi Airport Ranked #1 Again",
    summary:
      "For the 12th consecutive year, Changi Airport tops Skytrax rankings — making Singapore a smoother transit hub than ever for Indian travelers.",
    category: "news",
    destination: "Singapore",
    date: "2026-04-03",
    urgent: false,
    source: "Skytrax 2026",
  },
  {
    id: "tu-008",
    title: "Paris Summer Surge: Book Hotels Early",
    summary:
      "With post-Olympics tourism still strong, Paris hotels for June–September 2026 are filling up fast. Experts advise booking at least 3 months in advance.",
    category: "news",
    destination: "Paris",
    date: "2026-04-02",
    urgent: false,
    source: "Lonely Planet",
  },
  {
    id: "tu-009",
    title: "Ladakh Entry Permit Rules Updated for 2026",
    summary:
      "Indian nationals no longer need Inner Line Permits for Leh city, but permits remain mandatory for Nubra Valley, Pangong, and Dah-Hanu regions.",
    category: "visa",
    destination: "Ladakh",
    date: "2026-03-30",
    urgent: false,
    source: "J&K Tourism",
  },
  {
    id: "tu-010",
    title: "Maldives Launches New Live-Aboard Diving Packages",
    summary:
      "The Maldives Tourism Authority has approved 12 new live-aboard diving vessels, offering week-long packages from ₹95,000 per person including all dives.",
    category: "deal",
    destination: "Maldives",
    date: "2026-03-28",
    urgent: false,
    source: "Maldives Tourism Authority",
  },
];
