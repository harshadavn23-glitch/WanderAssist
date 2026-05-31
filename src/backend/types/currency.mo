// Currency rate cache types for WanderAssist live rates
module {
  public type CurrencyRateCache = {
    rates : [(Text, Float)]; // currency code -> rate vs USD
    lastUpdated : Int;
  };
};
