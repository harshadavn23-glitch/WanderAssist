// Booking domain logic for WanderAssist
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import BookingTypes "../types/bookings";

module {
  public type BookingMap = Map.Map<Nat, BookingTypes.BookingEntry>;

  /// Create a new booking entry; ID is derived from current map size + 1
  public func createBooking(
    bookings : BookingMap,
    userId : Text,
    bookingType : Text,
    destination : Text,
    travelers : Nat,
    days : Nat,
    startDate : Text,
    totalCost : Float,
    paymentRef : Text,
    surprisePlanCode : ?Text,
    now : Int,
  ) : BookingTypes.BookingEntry {
    let id = bookings.size() + 1;
    let entry : BookingTypes.BookingEntry = {
      id;
      userId;
      bookingType;
      destination;
      travelers;
      days;
      startDate;
      totalCost;
      status = #confirmed;
      paymentRef;
      surprisePlanCode;
      cancellationReason = null;
      cancelledAt = null;
      createdAt = now;
    };
    bookings.add(id, entry);
    entry;
  };

  /// Retrieve a booking by ID
  public func getBooking(bookings : BookingMap, id : Nat) : ?BookingTypes.BookingEntry {
    bookings.get(id);
  };

  /// List all bookings for a given userId
  public func listUserBookings(bookings : BookingMap, userId : Text) : [BookingTypes.BookingEntry] {
    bookings.values().filter(func(b) { b.userId == userId }).toArray();
  };

  /// Cancel a booking and compute the appropriate refund
  public func cancelBooking(
    bookings : BookingMap,
    id : Nat,
    reason : Text,
    now : Int,
  ) : BookingTypes.CancellationResult {
    switch (bookings.get(id)) {
      case null {
        { success = false; refundPercentage = 0; refundAmount = 0.0; message = "Booking not found" };
      };
      case (?entry) {
        if (entry.status == #cancelled) {
          return { success = false; refundPercentage = 0; refundAmount = 0.0; message = "Already cancelled" };
        };
        let updated : BookingTypes.BookingEntry = {
          entry with
          status = #cancelled;
          cancellationReason = ?reason;
          cancelledAt = ?now;
        };
        bookings.add(id, updated);
        let refundAmt = entry.totalCost * 0.80;
        { success = true; refundPercentage = 80; refundAmount = refundAmt; message = "Cancellation successful. Refund of 80% will be processed in 5-7 business days." };
      };
    };
  };
};
