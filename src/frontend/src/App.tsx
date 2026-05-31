import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import { initSurprisePlans } from "./data/surprisePlans";

// Initialize surprise plans in localStorage on app start
initSurprisePlans();

// Lazy-loaded pages
const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const TravelPlanPage = lazy(() => import("./pages/TravelPlan"));
const SearchPage = lazy(() => import("./pages/Search"));
const MapPage = lazy(() => import("./pages/MapPage"));
const SeniorToursPage = lazy(() => import("./pages/SeniorTours"));
const PackageToursPage = lazy(() => import("./pages/PackageTours"));
const BudgetTravelPage = lazy(() => import("./pages/BudgetTravel"));
const BudgetHubPage = lazy(() => import("./pages/BudgetHub"));
const WomenCommunityPage = lazy(() => import("./pages/WomenCommunity"));
const BookingHistoryPage = lazy(() => import("./pages/BookingHistory"));
const DocumentChecklistPage = lazy(() => import("./pages/DocumentChecklist"));
const BudgetCalculatorPage = lazy(() => import("./pages/BudgetCalculator"));
const LanguageTranslatorPage = lazy(() => import("./pages/LanguageTranslator"));
const FavoriteTripsPage = lazy(() => import("./pages/FavoriteTrips"));
const TravelUpdatesPage = lazy(() => import("./pages/TravelUpdates"));
const CurrencyConverterPage = lazy(() => import("./pages/CurrencyConverter"));
const CurrencyScannerPage = lazy(() => import("./pages/CurrencyScanner"));
const TourGuidesPage = lazy(() => import("./pages/TourGuides"));
const SurprisePlannerPage = lazy(() => import("./pages/SurprisePlanner"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const EmergencyPage = lazy(() => import("./pages/Emergency"));
const TravelPlanResultsPage = lazy(() => import("./pages/TravelPlanResults"));
const TravelPlanDetailPage = lazy(() => import("./pages/TravelPlanDetail"));
const TravelPlanBookingPage = lazy(() => import("./pages/TravelPlanBooking"));
const PackageTourDetailPage = lazy(() => import("./pages/PackageTourDetail"));
const PackageTripDetailsPage = lazy(() => import("./pages/PackageTripDetails"));
const PackageBookingPage = lazy(() => import("./pages/PackageBooking"));
const SeniorTourDetailPage = lazy(() => import("./pages/SeniorTourDetail"));
const SeniorTripDetailsPage = lazy(() => import("./pages/SeniorTripDetails"));
const SeniorBookingPage = lazy(() => import("./pages/SeniorBooking"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const HotelSelectionPage = lazy(() => import("./pages/HotelSelection"));
const FlightSelectionPage = lazy(() => import("./pages/FlightSelection"));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Helper to wrap lazy pages
function lazy_page(Component: React.ComponentType) {
  return () => (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazy_page(HomePage),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: lazy_page(LoginPage),
});

const travelPlanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/travel-plan",
  component: lazy_page(TravelPlanPage),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: lazy_page(SearchPage),
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/map",
  component: lazy_page(MapPage),
});

const seniorToursRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/senior-tours",
  component: lazy_page(SeniorToursPage),
});

const packageToursRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/package-tours",
  component: lazy_page(PackageToursPage),
});

const budgetTravelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/budget-travel",
  component: lazy_page(BudgetTravelPage),
});

const budgetHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/budget",
  component: lazy_page(BudgetHubPage),
});

const womenCommunityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/women-community",
  component: lazy_page(WomenCommunityPage),
});

const bookingHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking-history",
  component: lazy_page(BookingHistoryPage),
});

const documentChecklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document-checklist",
  component: lazy_page(DocumentChecklistPage),
});

const budgetCalculatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/budget-calculator",
  component: lazy_page(BudgetCalculatorPage),
});

const languageTranslatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/language-translator",
  component: lazy_page(LanguageTranslatorPage),
});

const favoriteTripsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorite-trips",
  component: lazy_page(FavoriteTripsPage),
});

const travelUpdatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/travel-updates",
  component: lazy_page(TravelUpdatesPage),
});

const currencyConverterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/currency-converter",
  component: lazy_page(CurrencyConverterPage),
});

const currencyScannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/currency-scanner",
  component: lazy_page(CurrencyScannerPage),
});

const tourGuidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tour-guides",
  component: lazy_page(TourGuidesPage),
});

const surprisePlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/surprise-planner",
  component: lazy_page(SurprisePlannerPage),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: lazy_page(SettingsPage),
});

const emergencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/emergency",
  component: lazy_page(EmergencyPage),
});

const travelPlanResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/travel-plans/results",
  component: lazy_page(TravelPlanResultsPage),
});

const travelPlanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/travel-plans/detail",
  component: lazy_page(TravelPlanDetailPage),
});

const travelPlanBookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/travel-plans/book",
  component: lazy_page(TravelPlanBookingPage),
});

const packageTourDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/package-tour-detail",
  component: lazy_page(PackageTourDetailPage),
});

const packageTripDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/package-trip-details",
  component: lazy_page(PackageTripDetailsPage),
});

const packageBookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/package-booking",
  component: lazy_page(PackageBookingPage),
});

const seniorTourDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/senior-tour-detail",
  component: lazy_page(SeniorTourDetailPage),
});

const seniorTripDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/senior-trip-details",
  component: lazy_page(SeniorTripDetailsPage),
});

const seniorBookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/senior-booking",
  component: lazy_page(SeniorBookingPage),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: lazy_page(NotificationsPage),
});

const hotelSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel-selection",
  component: lazy_page(HotelSelectionPage),
});

const flightSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flight-selection",
  component: lazy_page(FlightSelectionPage),
});

// Build route tree
const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  travelPlanRoute,
  searchRoute,
  mapRoute,
  seniorToursRoute,
  packageToursRoute,
  budgetTravelRoute,
  budgetHubRoute,
  womenCommunityRoute,
  bookingHistoryRoute,
  documentChecklistRoute,
  budgetCalculatorRoute,
  languageTranslatorRoute,
  favoriteTripsRoute,
  travelUpdatesRoute,
  currencyConverterRoute,
  currencyScannerRoute,
  tourGuidesRoute,
  surprisePlannerRoute,
  settingsRoute,
  emergencyRoute,
  travelPlanResultsRoute,
  travelPlanDetailRoute,
  travelPlanBookingRoute,
  packageTourDetailRoute,
  packageTripDetailsRoute,
  packageBookingRoute,
  seniorTourDetailRoute,
  seniorTripDetailsRoute,
  seniorBookingRoute,
  notificationsRoute,
  hotelSelectionRoute,
  flightSelectionRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="wanderassist-theme"
      enableSystem={false}
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
