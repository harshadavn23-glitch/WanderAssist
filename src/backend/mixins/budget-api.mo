// Public API mixin for budget tracking operations
import Time "mo:core/Time";
import BudgetTypes "../types/budget";
import BudgetLib "../lib/budget";

mixin (
  budgetEntries : BudgetLib.BudgetMap,
) {
  /// Save a new budget entry and return its ID
  public func saveBudgetEntry(
    userId : Text,
    category : Text,
    description : Text,
    amount : Float,
    currency : Text,
    date : Text,
  ) : async Nat {
    let entry = BudgetLib.saveBudgetEntry(
      budgetEntries, userId, category, description,
      amount, currency, date, Time.now(),
    );
    entry.id;
  };

  /// List all budget entries for a given user
  public query func getUserBudgetEntries(userId : Text) : async [BudgetTypes.BudgetEntry] {
    BudgetLib.getUserBudgetEntries(budgetEntries, userId);
  };

  /// Delete a budget entry by ID
  public func deleteBudgetEntry(id : Nat) : async Bool {
    BudgetLib.deleteBudgetEntry(budgetEntries, id);
  };
};
