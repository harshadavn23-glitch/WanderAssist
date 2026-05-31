// Surprise plan domain logic for WanderAssist
import Map "mo:core/Map";
import SurpriseTypes "../types/surprise";

module {
  public type SurpriseMap = Map.Map<Text, SurpriseTypes.SurprisePlanEntry>;

  /// Seed or overwrite a surprise plan entry (admin/init use)
  public func initSurprisePlan(
    plans : SurpriseMap,
    code : Text,
    destination : Text,
    occasion : Text,
    cost : Float,
    days : Nat,
    itinerary : [Text],
    decorations : [Text],
  ) {
    let entry : SurpriseTypes.SurprisePlanEntry = {
      code; destination; occasion; cost; days; itinerary; decorations;
    };
    plans.add(code, entry);
  };

  /// Validate a surprise plan code and return its entry if valid
  public func validateSurprisePlanCode(plans : SurpriseMap, code : Text) : ?SurpriseTypes.SurprisePlanEntry {
    plans.get(code);
  };
};
