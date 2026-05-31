// WanderAssist — composition root
// Owns all mutable state; delegates every public method to domain mixins.
import Map "mo:core/Map";
import BookingTypes "types/bookings";
import BudgetTypes "types/budget";
import ReviewTypes "types/reviews";
import SurpriseTypes "types/surprise";
import DestTypes "types/destinations";
import NotifTypes "types/notifications";
import UserTypes "types/users";
import BookingsApi "mixins/bookings-api";
import BudgetApi "mixins/budget-api";
import ReviewsApi "mixins/reviews-api";
import SurpriseApi "mixins/surprise-api";
import CurrencyApi "mixins/currency-api";
import DestinationsApi "mixins/destinations-api";
import NotificationsApi "mixins/notifications-api";
import UsersApi "mixins/users-api";

actor {
  // ── Collections ───────────────────────────────────────────────────────────
  let bookings   : Map.Map<Nat,  BookingTypes.BookingEntry>         = Map.empty<Nat,  BookingTypes.BookingEntry>();
  let budgetEntries : Map.Map<Nat, BudgetTypes.BudgetEntry>         = Map.empty<Nat,  BudgetTypes.BudgetEntry>();
  let reviews    : Map.Map<Nat,  ReviewTypes.Review>                = Map.empty<Nat,  ReviewTypes.Review>();
  let surprisePlans : Map.Map<Text, SurpriseTypes.SurprisePlanEntry> = Map.empty<Text, SurpriseTypes.SurprisePlanEntry>();
  let destinations  : Map.Map<Text, DestTypes.Destination>           = Map.empty<Text, DestTypes.Destination>();

  // ── Notification state ────────────────────────────────────────────────────
  let notifications   : Map.Map<Text, NotifTypes.NotificationPreference> = Map.empty<Text, NotifTypes.NotificationPreference>();
  let notifHistory    : Map.Map<Nat,  NotifTypes.NotificationHistory>    = Map.empty<Nat,  NotifTypes.NotificationHistory>();
  let notifHistIdBox  : { var val : Nat }                                = { var val = 0 };

  // ── User state ────────────────────────────────────────────────────────────
  // usersById: primary store keyed by auto-incremented Nat id
  // emailIndex: secondary index for O(log n) email lookups (case-normalised)
  let usersById   : Map.Map<Nat,  UserTypes.UserRecord> = Map.empty<Nat,  UserTypes.UserRecord>();
  let emailIndex  : Map.Map<Text, Nat>                  = Map.empty<Text, Nat>();
  let nextUserIdBox : { var val : Nat }                 = { var val = 0 };

  // ── Domain API mixins ─────────────────────────────────────────────────────
  include BookingsApi(bookings);
  include BudgetApi(budgetEntries);
  include ReviewsApi(reviews);
  include SurpriseApi(surprisePlans);
  include CurrencyApi();         // owns its own internal currency cache state
  include DestinationsApi(destinations);
  include NotificationsApi(notifications, notifHistory, notifHistIdBox);
  include UsersApi(usersById, emailIndex, nextUserIdBox);
};
