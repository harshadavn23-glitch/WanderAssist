// WanderAssist — user domain types
module {
  /// A registered user.
  /// passwordHash and salt are stored here.
  ///
  /// SECURITY NOTE:
  ///   SHA-256 hashing is performed on the FRONTEND before calling registerUser/loginUser,
  ///   because Motoko does not provide a native SHA-256 primitive.
  ///   The frontend must:
  ///     1. Generate a random salt (e.g. 16-byte hex string)
  ///     2. Compute SHA-256(password + salt) -> hex string
  ///     3. Send (passwordHash, salt) to the backend
  ///   On login the frontend re-computes SHA-256(password + storedSalt) and sends that hash.
  ///   The backend compares hashes; the plain-text password is NEVER sent to or stored in the canister.
  public type UserRecord = {
    id           : Nat;
    name         : Text;
    email        : Text;   // stored lower-cased for uniqueness checks
    passwordHash : Text;   // SHA-256(password + salt) hex string
    salt         : Text;   // random salt generated on the frontend
    createdAt    : Int;    // nanoseconds (Time.now())
    var lastLogin : Int;   // nanoseconds; updated on every successful login
  };
};
