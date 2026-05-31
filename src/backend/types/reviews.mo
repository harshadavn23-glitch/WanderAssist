// Review and rating types for WanderAssist destinations
module {
  public type Review = {
    id : Nat;
    placeId : Text;
    userId : Text;
    userName : Text;
    rating : Nat; // 1–5
    text : Text;
    createdAt : Int;
  };
};
