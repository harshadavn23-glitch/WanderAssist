import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NotificationHistory {
    id: bigint;
    destination: string;
    bookingId: bigint;
    userId: string;
    firedAt: bigint;
    reminderType: string;
    message: string;
}
export interface NotificationPreference {
    destination: string;
    bookingId: bigint;
    remind7Days: boolean;
    userId: string;
    travelDate: string;
    remind3Days: boolean;
    remind1Day: boolean;
}
export interface Destination {
    id: string;
    region: string;
    country: string;
    name: string;
    tags: Array<string>;
    pricePerPerson: number;
    description: string;
    image: string;
}
export interface CancellationResult {
    refundAmount: number;
    refundPercentage: bigint;
    message: string;
    success: boolean;
}
export interface BookingEntry {
    id: bigint;
    status: BookingStatus;
    destination: string;
    surprisePlanCode?: string;
    cancellationReason?: string;
    userId: string;
    days: bigint;
    createdAt: bigint;
    totalCost: number;
    travelers: bigint;
    cancelledAt?: bigint;
    bookingType: string;
    paymentRef: string;
    startDate: string;
}
export interface CurrencyRateCache {
    lastUpdated: bigint;
    rates: Array<[string, number]>;
}
export interface BudgetEntry {
    id: bigint;
    userId: string;
    date: string;
    createdAt: bigint;
    description: string;
    currency: string;
    category: string;
    amount: number;
}
export interface Review {
    id: bigint;
    userName: string;
    userId: string;
    createdAt: bigint;
    text: string;
    placeId: string;
    rating: bigint;
}
export interface SurprisePlanEntry {
    destination: string;
    code: string;
    cost: number;
    days: bigint;
    occasion: string;
    itinerary: Array<string>;
    decorations: Array<string>;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    confirmed = "confirmed"
}
export interface backendInterface {
    cancelBooking(id: bigint, reason: string): Promise<CancellationResult>;
    clearNotificationHistory(userId: string): Promise<void>;
    createBooking(userId: string, bookingType: string, destination: string, travelers: bigint, days: bigint, startDate: string, totalCost: number, paymentRef: string, surprisePlanCode: string | null): Promise<bigint>;
    deleteBudgetEntry(id: bigint): Promise<boolean>;
    fetchAndCacheCurrencyRates(): Promise<void>;
    getBooking(id: bigint): Promise<BookingEntry | null>;
    getCurrencyRates(): Promise<CurrencyRateCache | null>;
    getDestination(id: string): Promise<Destination | null>;
    getNotificationHistory(userId: string): Promise<Array<NotificationHistory>>;
    getNotificationPreferences(userId: string): Promise<Array<NotificationPreference>>;
    getReviewsForPlace(placeId: string): Promise<Array<Review>>;
    getUserBudgetEntries(userId: string): Promise<Array<BudgetEntry>>;
    getUserProfile(userId: bigint): Promise<{
        name: string;
        createdAt: bigint;
        email: string;
        lastLogin: bigint;
    } | null>;
    getUserSalt(email: string): Promise<string | null>;
    initDestination(id: string, name: string, country: string, region: string, tags: Array<string>, pricePerPerson: number, image: string, description: string): Promise<void>;
    initSurprisePlan(code: string, destination: string, occasion: string, cost: number, days: bigint, itinerary: Array<string>, decorations: Array<string>): Promise<void>;
    listAllDestinations(): Promise<Array<Destination>>;
    listUserBookings(userId: string): Promise<Array<BookingEntry>>;
    logNotificationFired(userId: string, bookingId: bigint, destination: string, reminderType: string, message: string): Promise<bigint>;
    loginUser(email: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: {
            userId: string;
            name: string;
            email: string;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerUser(name: string, email: string, passwordHash: string, salt: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveBudgetEntry(userId: string, category: string, description: string, amount: number, currency: string, date: string): Promise<bigint>;
    saveNotificationPreference(userId: string, bookingId: bigint, destination: string, travelDate: string, remind7Days: boolean, remind3Days: boolean, remind1Day: boolean): Promise<bigint>;
    saveReview(placeId: string, userId: string, userName: string, rating: bigint, reviewText: string): Promise<bigint>;
    searchDestinations(searchTerm: string): Promise<Array<Destination>>;
    updateCurrencyRates(rates: Array<[string, number]>, timestamp: bigint): Promise<void>;
    validateSurprisePlanCode(code: string): Promise<SurprisePlanEntry | null>;
}
