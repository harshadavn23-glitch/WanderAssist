// Public API mixin for live currency rate cache
// Uses IC http_request outcall to fetch live rates from exchangerate-api.com
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import CurrencyTypes "../types/currency";
import CurrencyLib "../lib/currency";

mixin () {
  // ── Mixin-owned state ─────────────────────────────────────────────────────
  // Map with key 0 acts as a mutable optional slot — avoids 'var' in mixin params
  let currencyCache : CurrencyLib.CurrencyCache = Map.empty<Nat, CurrencyTypes.CurrencyRateCache>();

  // IC management canister — provides http_request for outbound HTTP calls
  let ic = actor "aaaaa-aa" : actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{
        function : shared query ({
          response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
          context : Blob;
        }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context : Blob;
      };
      is_replicated : ?Bool;
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };

  /// Return the cached currency rates (null if not yet populated)
  public query func getCurrencyRates() : async ?CurrencyTypes.CurrencyRateCache {
    CurrencyLib.getCurrencyRates(currencyCache);
  };

  /// Store updated currency rates (callable directly by frontend)
  public func updateCurrencyRates(rates : [(Text, Float)], timestamp : Int) : async () {
    CurrencyLib.setCurrencyRates(currencyCache, rates, timestamp);
  };

  /// Fetch live rates from exchangerate-api.com and cache them.
  /// Targets key travel currencies. Returns gracefully on any error.
  public func fetchAndCacheCurrencyRates() : async () {
    let targetCurrencies : [Text] = [
      "USD", "EUR", "GBP", "JPY", "AED", "SGD", "AUD", "CAD",
      "THB", "IDR", "MYR", "CHF", "INR", "SAR", "LKR", "NPR",
      "BDT", "PKR", "CNY", "HKD", "KRW",
    ];

    let response = try {
      await ic.http_request({
        url = "https://api.exchangerate-api.com/v4/latest/USD";
        max_response_bytes = ?16_000;
        method = #get;
        headers = [{ name = "Accept"; value = "application/json" }];
        body = null;
        transform = null;
        is_replicated = ?false;
      });
    } catch (_) {
      return; // Network error — leave cache unchanged
    };

    if (response.status != 200) { return };

    let bodyText = switch (response.body.decodeUtf8()) {
      case (?t) t;
      case null { return };
    };

    let rates = parseRates(bodyText, targetCurrencies);
    if (rates.size() > 0) {
      CurrencyLib.setCurrencyRates(currencyCache, rates, Time.now());
    };
  };

  // ── Private JSON parsing helpers ──────────────────────────────────────────

  func parseRates(json : Text, currencies : [Text]) : [(Text, Float)] {
    var results : [(Text, Float)] = [];
    for (currency in currencies.vals()) {
      let pattern = "\"" # currency # "\":";
      switch (findAfter(json, pattern)) {
        case (?rest) {
          switch (parseLeadingFloat(rest)) {
            case (?rate) {
              results := results.concat([(currency, rate)]);
            };
            case null {};
          };
        };
        case null {};
      };
    };
    results;
  };

  func findAfter(haystack : Text, needle : Text) : ?Text {
    let hArr = haystack.toArray();
    let nArr = needle.toArray();
    let hSize = hArr.size();
    let nSize = nArr.size();
    if (nSize == 0 or hSize < nSize) return null;

    var i = 0;
    while (i + nSize <= hSize) {
      var matched = true;
      var j = 0;
      while (j < nSize) {
        if (hArr[i + j] != nArr[j]) { matched := false };
        j += 1;
      };
      if (matched) {
        return ?Text.fromArray(hArr.sliceToArray(i + nSize, hSize));
      };
      i += 1;
    };
    null;
  };

  func parseLeadingFloat(text : Text) : ?Float {
    let chars = text.toArray();
    let size = chars.size();
    var i = 0;

    while (i < size and isWS(chars[i])) { i += 1 };
    if (i >= size) return null;

    let start = i;
    if (i < size and chars[i] == '-') { i += 1 };

    var hasDigit = false;
    var dotIdx : ?Nat = null;

    while (i < size and (isDigit(chars[i]) or (chars[i] == '.' and dotIdx == null))) {
      if (chars[i] == '.') { dotIdx := ?i } else { hasDigit := true };
      i += 1;
    };

    if (not hasDigit) return null;

    let isNeg = chars[start] == '-';
    let absStart = if (isNeg) start + 1 else start;

    switch (dotIdx) {
      case (?d) {
        let intPart = Text.fromArray(chars.sliceToArray(absStart, d));
        let fracPart = Text.fromArray(chars.sliceToArray(d + 1, i));
        switch (Nat.fromText(intPart)) {
          case (?n) {
            let v = n.toFloat() + parseFraction(fracPart);
            ?(if (isNeg) -v else v);
          };
          case null null;
        };
      };
      case null {
        let intPart = Text.fromArray(chars.sliceToArray(absStart, i));
        switch (Nat.fromText(intPart)) {
          case (?n) {
            let v = n.toFloat();
            ?(if (isNeg) -v else v);
          };
          case null null;
        };
      };
    };
  };

  func isDigit(c : Char) : Bool { c >= '0' and c <= '9' };
  func isWS(c : Char) : Bool { c == ' ' or c == '\n' or c == '\r' or c == '\t' };

  func parseFraction(s : Text) : Float {
    if (s.size() == 0) return 0.0;
    switch (Nat.fromText(s)) {
      case (?n) {
        var divisor : Float = 1.0;
        var k = 0;
        let len = s.size();
        while (k < len) { divisor *= 10.0; k += 1 };
        n.toFloat() / divisor;
      };
      case null 0.0;
    };
  };
};
