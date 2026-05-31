// Notifications public API mixin for WanderAssist
import Map "mo:core/Map";
import NotifLib "../lib/notifications";
import Types "../types/notifications";

mixin (
  notifications    : Map.Map<Text, Types.NotificationPreference>,
  notifHistory     : Map.Map<Nat,  Types.NotificationHistory>,
  nextNotifHistId  : { var val : Nat },
) {
  // ── Write: save / update notification preferences for a booking ────────────
  public shared func saveNotificationPreference(
    userId      : Text,
    bookingId   : Nat,
    destination : Text,
    travelDate  : Text,
    remind7Days : Bool,
    remind3Days : Bool,
    remind1Day  : Bool,
  ) : async Nat {
    NotifLib.savePreference(
      notifications,
      userId,
      bookingId,
      destination,
      travelDate,
      remind7Days,
      remind3Days,
      remind1Day,
    );
    bookingId
  };

  // ── Query: list all preferences for a user ──────────────────────────────────
  public query func getNotificationPreferences(userId : Text) : async [Types.NotificationPreference] {
    NotifLib.getPreferences(notifications, userId)
  };

  // ── Write: record a fired notification in history ───────────────────────────
  public shared func logNotificationFired(
    userId       : Text,
    bookingId    : Nat,
    destination  : Text,
    reminderType : Text,
    message      : Text,
  ) : async Nat {
    let id = nextNotifHistId.val;
    nextNotifHistId.val += 1;
    NotifLib.logFired(notifHistory, id, userId, bookingId, destination, reminderType, message)
  };

  // ── Query: list notification history for a user ──────────────────────────────
  public query func getNotificationHistory(userId : Text) : async [Types.NotificationHistory] {
    NotifLib.getHistory(notifHistory, userId)
  };

  // ── Write: clear all notification history for a user ────────────────────────
  public shared func clearNotificationHistory(userId : Text) : async () {
    NotifLib.clearHistory(notifHistory, userId)
  };
};
