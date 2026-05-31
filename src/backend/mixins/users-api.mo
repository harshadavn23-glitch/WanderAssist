// WanderAssist — users public API mixin
//
// Exposes three canister-level endpoints for user management.
// State is injected from main.mo.
//
// Password security model:
//   - Frontend generates a random salt, computes SHA-256(password + salt),
//     and sends (passwordHash, salt) to the backend.
//   - Backend stores only (passwordHash, salt) — never plain text.
//   - On login, frontend re-computes SHA-256(password + storedSalt) and sends
//     the hash; backend compares hashes.
import Map       "mo:core/Map";
import UserLib   "../lib/users";
import UserTypes "../types/users";

mixin (
  usersById  : Map.Map<Nat, UserTypes.UserRecord>,
  emailIndex : Map.Map<Text, Nat>,
  nextUserIdBox : { var val : Nat },
) {

  /// Register a new user account.
  ///
  /// Caller supplies the SHA-256 hash of (password + salt) and the salt.
  /// Returns the new user id (as Text) on success, or an error string on failure.
  /// Errors: "Name must not be empty", "Invalid email format",
  ///         "Email already registered", "Password hash must not be empty",
  ///         "Salt must not be empty"
  public shared func registerUser(
    name         : Text,
    email        : Text,
    passwordHash : Text,
    salt         : Text,
  ) : async { #ok : Text; #err : Text } {
    switch (UserLib.registerUser(usersById, emailIndex, nextUserIdBox, name, email, passwordHash, salt)) {
      case (#ok id) { #ok (id.toText()) };
      case (#err msg) { #err msg };
    };
  };

  /// Authenticate a user.
  ///
  /// The frontend must re-compute SHA-256(password + storedSalt) before calling
  /// this. To get the salt for a given email, call getUserSalt first.
  /// Returns a lightweight profile object on success, or an error string.
  /// Errors: "User not found", "Invalid password"
  public shared func loginUser(
    email        : Text,
    passwordHash : Text,
  ) : async { #ok : { userId : Text; name : Text; email : Text }; #err : Text } {
    switch (UserLib.verifyUser(usersById, emailIndex, email, passwordHash)) {
      case (#err msg) { #err msg };
      case (#ok user) {
        UserLib.updateLastLogin(usersById, user.id);
        #ok { userId = user.id.toText(); name = user.name; email = user.email };
      };
    };
  };

  /// Fetch public profile fields for a user by id.
  /// Returns null if the user does not exist.
  /// Note: does NOT return passwordHash or salt.
  public query func getUserProfile(
    userId : Nat,
  ) : async ?{ name : Text; email : Text; createdAt : Int; lastLogin : Int } {
    switch (usersById.get(userId)) {
      case null null;
      case (?user) ?{
        name      = user.name;
        email     = user.email;
        createdAt = user.createdAt;
        lastLogin = user.lastLogin;
      };
    };
  };

  /// Get the salt for a given email so the frontend can re-hash on login.
  /// Returns null if the email is not registered.
  public query func getUserSalt(email : Text) : async ?Text {
    switch (UserLib.getUserByEmail(usersById, emailIndex, email)) {
      case null null;
      case (?user) ?user.salt;
    };
  };
};
