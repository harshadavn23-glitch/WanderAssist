// Booking domain types for WanderAssist
module {
  public type BookingStatus = { #confirmed; #pending; #cancelled };

  public type BookingEntry = {
    id : Nat;
    userId : Text;
    bookingType : Text; // "travel-plan" | "package" | "senior"
    destination : Text;
    travelers : Nat;
    days : Nat;
    startDate : Text;
    totalCost : Float;
    status : BookingStatus;
    paymentRef : Text;
    surprisePlanCode : ?Text;
    cancellationReason : ?Text;
    cancelledAt : ?Int;
    createdAt : Int;
  };

  public type CancellationResult = {
    success : Bool;
    refundPercentage : Nat;
    refundAmount : Float;
    message : Text;
  };
};
