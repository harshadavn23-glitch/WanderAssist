// Currency rate cache domain logic for WanderAssist
// Cache uses Map<Nat, CurrencyRateCache> with key 0 as a mutable reference cell
import Map "mo:core/Map";
import CurrencyTypes "../types/currency";

module {
  public type CurrencyCache = Map.Map<Nat, CurrencyTypes.CurrencyRateCache>;

  /// Return the current cached rates, or null if not yet populated
  public func getCurrencyRates(cache : CurrencyCache) : ?CurrencyTypes.CurrencyRateCache {
    cache.get(0);
  };

  /// Overwrite the cache with new rates and timestamp
  public func setCurrencyRates(cache : CurrencyCache, rates : [(Text, Float)], timestamp : Int) {
    cache.add(0, { rates; lastUpdated = timestamp });
  };
};
