import type { EmergencyContact } from "@/types/travel";

export const emergencyContacts: EmergencyContact[] = [
  {
    country: "India",
    police: "100",
    ambulance: "108",
    fire: "101",
    embassy: "N/A (domestic)",
  },
  {
    country: "USA",
    police: "911",
    ambulance: "911",
    fire: "911",
    embassy: "+1-202-588-6500 (Indian Embassy Washington)",
  },
  {
    country: "UK",
    police: "999",
    ambulance: "999",
    fire: "999",
    embassy: "+44-20-7836-8484 (Indian High Commission London)",
  },
  {
    country: "UAE (Dubai)",
    police: "999",
    ambulance: "998",
    fire: "997",
    embassy: "+971-4-397-1333 (Indian Consulate Dubai)",
  },
  {
    country: "France",
    police: "17",
    ambulance: "15",
    fire: "18",
    embassy: "+33-1-40-50-70-70 (Indian Embassy Paris)",
  },
  {
    country: "Japan",
    police: "110",
    ambulance: "119",
    fire: "119",
    embassy: "+81-3-3262-2391 (Indian Embassy Tokyo)",
  },
  {
    country: "Indonesia (Bali)",
    police: "110",
    ambulance: "118",
    fire: "113",
    embassy: "+62-21-5204150 (Indian Embassy Jakarta)",
  },
  {
    country: "Singapore",
    police: "999",
    ambulance: "995",
    fire: "995",
    embassy: "+65-6737-6777 (Indian High Commission Singapore)",
  },
  {
    country: "Maldives",
    police: "119",
    ambulance: "102",
    fire: "118",
    embassy: "+960-331-6085 (Indian High Commission Malé)",
  },
  {
    country: "Thailand",
    police: "191",
    ambulance: "1669",
    fire: "199",
    embassy: "+66-2-258-0300 (Indian Embassy Bangkok)",
  },
];

export function getContactsByCountry(
  country: string,
): EmergencyContact | undefined {
  return emergencyContacts.find((c) =>
    c.country.toLowerCase().includes(country.toLowerCase()),
  );
}
