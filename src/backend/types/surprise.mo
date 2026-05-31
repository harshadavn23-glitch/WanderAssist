// Surprise plan types for WanderAssist
module {
  public type SurprisePlanEntry = {
    code : Text;
    destination : Text;
    occasion : Text;
    cost : Float;
    days : Nat;
    itinerary : [Text];
    decorations : [Text];
  };
};
