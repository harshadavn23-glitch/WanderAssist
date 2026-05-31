// Notification domain logic for WanderAssist
import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/notifications";

module {
  // ── Key helpers ─────────────────────────────────────────────────────────────

  /// Build the composite key used to store a preference: "userId#bookingId"
  public func prefKey(userId : Text, bookingId : Nat) : Text {
    userId # "#" # debug_show(bookingId)
  };

  // ── Preferences ─────────────────────────────────────────────────────────────

  public func savePreference(
    notifications : Map.Map<Text, Types.NotificationPreference>,
    userId        : Text,
    bookingId     : Nat,
    destination   : Text,
    travelDate    : Text,
    remind7Days   : Bool,
    remind3Days   : Bool,
    remind1Day    : Bool,
  ) {
    let key = prefKey(userId, bookingId);
    let pref : Types.NotificationPreference = {
      bookingId;
      userId;
      remind7Days;
      remind3Days;
      remind1Day;
      destination;
      travelDate;
    };
    notifications.add(key, pref);
  };

  public func getPreferences(
    notifications : Map.Map<Text, Types.NotificationPreference>,
    userId        : Text,
  ) : [Types.NotificationPreference] {
    let results = Map.empty<Text, Types.NotificationPreference>();
    notifications.forEach(func(k, p) {
      if (p.userId == userId) {
        results.add(k, p);
      };
    });
    results.values().toArray()
  };

  // ── History ─────────────────────────────────────────────────────────────────

  public func logFired(
    history      : Map.Map<Nat, Types.NotificationHistory>,
    entryId      : Nat,
    userId       : Text,
    bookingId    : Nat,
    destination  : Text,
    reminderType : Text,
    message      : Text,
  ) : Nat {
    let entry : Types.NotificationHistory = {
      id           = entryId;
      userId;
      bookingId;
      destination;
      reminderType;
      firedAt      = Time.now();
      message;
    };
    history.add(entryId, entry);
    entryId
  };

  public func getHistory(
    history : Map.Map<Nat, Types.NotificationHistory>,
    userId  : Text,
  ) : [Types.NotificationHistory] {
    let results = Map.empty<Nat, Types.NotificationHistory>();
    history.forEach(func(k, h) {
      if (h.userId == userId) {
        results.add(k, h);
      };
    });
    results.values().toArray()
  };

  public func clearHistory(
    history : Map.Map<Nat, Types.NotificationHistory>,
    userId  : Text,
  ) {
    // Collect keys belonging to the user via a temporary map, then remove them
    let toRemove = Map.empty<Nat, Bool>();
    history.forEach(func(k, h) {
      if (h.userId == userId) {
        toRemove.add(k, true);
      };
    });
    toRemove.keys().toArray().values().forEach(func(k : Nat) {
      history.remove(k);
    });
  };
};
