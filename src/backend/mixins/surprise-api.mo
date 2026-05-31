// Public API mixin for surprise plan operations
import SurpriseTypes "../types/surprise";
import SurpriseLib "../lib/surprise";

mixin (
  surprisePlans : SurpriseLib.SurpriseMap,
) {
  /// Seed or overwrite a surprise plan (admin / init use)
  public func initSurprisePlan(
    code : Text,
    destination : Text,
    occasion : Text,
    cost : Float,
    days : Nat,
    itinerary : [Text],
    decorations : [Text],
  ) : async () {
    SurpriseLib.initSurprisePlan(
      surprisePlans, code, destination, occasion,
      cost, days, itinerary, decorations,
    );
  };

  /// Validate a surprise plan code and return the plan if found
  public query func validateSurprisePlanCode(code : Text) : async ?SurpriseTypes.SurprisePlanEntry {
    SurpriseLib.validateSurprisePlanCode(surprisePlans, code);
  };
};
