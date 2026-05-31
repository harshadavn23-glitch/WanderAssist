// Budget tracking domain logic for WanderAssist
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import BudgetTypes "../types/budget";

module {
  public type BudgetMap = Map.Map<Nat, BudgetTypes.BudgetEntry>;

  /// Save a new budget entry; ID is derived from current map size + 1
  public func saveBudgetEntry(
    entries : BudgetMap,
    userId : Text,
    category : Text,
    description : Text,
    amount : Float,
    currency : Text,
    date : Text,
    createdAt : Int,
  ) : BudgetTypes.BudgetEntry {
    let id = entries.size() + 1;
    let entry : BudgetTypes.BudgetEntry = {
      id; userId; category; description; amount; currency; date; createdAt;
    };
    entries.add(id, entry);
    entry;
  };

  /// List all budget entries for a given userId
  public func getUserBudgetEntries(entries : BudgetMap, userId : Text) : [BudgetTypes.BudgetEntry] {
    entries.values().filter(func(e) { e.userId == userId }).toArray();
  };

  /// Delete a budget entry by ID; returns true if found and removed
  public func deleteBudgetEntry(entries : BudgetMap, id : Nat) : Bool {
    switch (entries.get(id)) {
      case null false;
      case (?_) { entries.remove(id); true };
    };
  };
};
