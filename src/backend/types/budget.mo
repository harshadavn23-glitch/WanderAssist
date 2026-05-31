// Budget tracking types for WanderAssist
module {
  public type BudgetEntry = {
    id : Nat;
    userId : Text;
    category : Text;
    description : Text;
    amount : Float;
    currency : Text;
    date : Text;
    createdAt : Int;
  };
};
