// Public API mixin for booking operations
import Map "mo:core/Map";
import Time "mo:core/Time";
import BookingTypes "../types/bookings";
import BookingLib "../lib/bookings";

mixin (
  bookings : BookingLib.BookingMap,
) {
  /// Create a new booking and return the booking ID
  public func createBooking(
    userId : Text,
    bookingType : Text,
    destination : Text,
    travelers : Nat,
    days : Nat,
    startDate : Text,
    totalCost : Float,
    paymentRef : Text,
    surprisePlanCode : ?Text,
  ) : async Nat {
    let entry = BookingLib.createBooking(
      bookings, userId, bookingType, destination,
      travelers, days, startDate, totalCost, paymentRef,
      surprisePlanCode, Time.now(),
    );
    entry.id;
  };

  /// Retrieve a single booking by ID
  public query func getBooking(id : Nat) : async ?BookingTypes.BookingEntry {
    BookingLib.getBooking(bookings, id);
  };

  /// List all bookings for a given user
  public query func listUserBookings(userId : Text) : async [BookingTypes.BookingEntry] {
    BookingLib.listUserBookings(bookings, userId);
  };

  /// Cancel a booking and return the refund result
  public func cancelBooking(id : Nat, reason : Text) : async BookingTypes.CancellationResult {
    BookingLib.cancelBooking(bookings, id, reason, Time.now());
  };
};
