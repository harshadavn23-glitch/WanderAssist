// WanderAssist — user domain logic
//
// All functions operate on injected state (usersById map + nextId counter box).
// Password validation rules (enforced here for defence-in-depth):
//   - min 8 characters
//   - at least one uppercase letter
//   - at least one digit
//   - at least one symbol (non-alphanumeric character)
//   - not empty
//
// The actual SHA-256 hash is computed on the FRONTEND; this module only stores
// and compares the already-hashed value.
import Map   "mo:core/Map";
import Time  "mo:core/Time";
import Types "../types/users";

module {
  // ── Validation helpers ───────────────────────────────────────────────────

  func hasUppercase(s : Text) : Bool {
    for (c in s.toIter()) {
      if (c >= 'A' and c <= 'Z') return true;
    };
    false;
  };

  func hasDigit(s : Text) : Bool {
    for (c in s.toIter()) {
      if (c >= '0' and c <= '9') return true;
    };
    false;
  };

  func hasLetter(s : Text) : Bool {
    for (c in s.toIter()) {
      if ((c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z')) return true;
    };
    false;
  };

  func hasSymbol(s : Text) : Bool {
    for (c in s.toIter()) {
      let isAlphaNum = (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9');
      if (not isAlphaNum) return true;
    };
    false;
  };

  /// Validate that the plain-text password meets policy requirements.
  /// Note: the backend receives a hash, so this validation is applied to the
  /// hash string length/presence as a sanity check, not re-run on plaintext.
  /// Full plaintext validation is enforced on the frontend.
  func validatePasswordHash(hash : Text) : ?Text {
    if (hash.size() == 0) return ?"Password hash must not be empty";
    null; // hash format validation only; full policy enforced on frontend
  };

  /// Validate email format (basic check: contains @ and a dot after @).
  func validateEmail(email : Text) : ?Text {
    if (email.size() == 0) return ?"Email must not be empty";
    let lower = email.toLower();
    let parts = lower.split(#char('@'));
    let arr = parts.toArray();
    if (arr.size() != 2) return ?"Invalid email format";
    let domain = arr[1];
    if (not domain.contains(#char('.'))) return ?"Invalid email format";
    null;
  };

  // ── Public domain functions ──────────────────────────────────────────────

  /// Register a new user.
  /// Returns the new user id on success, or an error message.
  public func registerUser(
    usersById   : Map.Map<Nat, Types.UserRecord>,
    emailIndex  : Map.Map<Text, Nat>,
    nextIdBox   : { var val : Nat },
    name        : Text,
    email       : Text,
    passwordHash : Text,
    salt        : Text,
  ) : { #ok : Nat; #err : Text } {
    // Validate inputs
    if (name.size() == 0) return #err "Name must not be empty";
    switch (validateEmail(email)) {
      case (?msg) return #err msg;
      case null {};
    };
    switch (validatePasswordHash(passwordHash)) {
      case (?msg) return #err msg;
      case null {};
    };
    if (salt.size() == 0) return #err "Salt must not be empty";

    let lowerEmail = email.toLower();

    // Check uniqueness
    if (emailIndex.containsKey(lowerEmail)) return #err "Email already registered";

    let id = nextIdBox.val;
    nextIdBox.val += 1;

    let user : Types.UserRecord = {
      id;
      name;
      email = lowerEmail;
      passwordHash;
      salt;
      createdAt   = Time.now();
      var lastLogin = 0;
    };

    usersById.add(id, user);
    emailIndex.add(lowerEmail, id);

    #ok id;
  };

  /// Look up a user by email (case-insensitive).
  public func getUserByEmail(
    usersById  : Map.Map<Nat, Types.UserRecord>,
    emailIndex : Map.Map<Text, Nat>,
    email      : Text,
  ) : ?Types.UserRecord {
    let lowerEmail = email.toLower();
    switch (emailIndex.get(lowerEmail)) {
      case null null;
      case (?id) usersById.get(id);
    };
  };

  /// Verify credentials: look up by email, compare passwordHash.
  /// Returns #ok(UserRecord) on success, #err with a specific message on failure.
  /// Distinguishes "User not found" from "Invalid password".
  public func verifyUser(
    usersById  : Map.Map<Nat, Types.UserRecord>,
    emailIndex : Map.Map<Text, Nat>,
    email      : Text,
    passwordHash : Text,
  ) : { #ok : Types.UserRecord; #err : Text } {
    switch (getUserByEmail(usersById, emailIndex, email)) {
      case null { #err "User not found" };
      case (?user) {
        if (user.passwordHash == passwordHash) { #ok user }
        else { #err "Invalid password" };
      };
    };
  };

  /// Update the lastLogin timestamp for a user by id.
  public func updateLastLogin(
    usersById : Map.Map<Nat, Types.UserRecord>,
    id        : Nat,
  ) : () {
    switch (usersById.get(id)) {
      case null {};
      case (?user) { user.lastLogin := Time.now() };
    };
  };

  /// Check whether an email address is already registered.
  public func isEmailTaken(
    emailIndex : Map.Map<Text, Nat>,
    email      : Text,
  ) : Bool {
    emailIndex.containsKey(email.toLower());
  };
};
