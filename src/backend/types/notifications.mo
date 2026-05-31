// Notification domain types for WanderAssist
module {
  public type NotificationPreference = {
    bookingId   : Nat;
    userId      : Text;
    remind7Days : Bool;
    remind3Days : Bool;
    remind1Day  : Bool;
    destination : Text;
    travelDate  : Text;
  };

  public type NotificationHistory = {
    id           : Nat;
    userId       : Text;
    bookingId    : Nat;
    destination  : Text;
    reminderType : Text; // "7days" | "3days" | "1day"
    firedAt      : Int;
    message      : Text;
  };
};
