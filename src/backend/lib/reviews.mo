// Reviews domain logic for WanderAssist
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import ReviewTypes "../types/reviews";

module {
  public type ReviewMap = Map.Map<Nat, ReviewTypes.Review>;

  /// Save a new review; ID is derived from current map size + 1
  public func saveReview(
    reviews : ReviewMap,
    placeId : Text,
    userId : Text,
    userName : Text,
    rating : Nat,
    reviewText : Text,
    createdAt : Int,
  ) : ReviewTypes.Review {
    let id = reviews.size() + 1;
    let entry : ReviewTypes.Review = {
      id; placeId; userId; userName; rating; text = reviewText; createdAt;
    };
    reviews.add(id, entry);
    entry;
  };

  /// Return all reviews for a given placeId
  public func getReviewsForPlace(reviews : ReviewMap, placeId : Text) : [ReviewTypes.Review] {
    reviews.values().filter(func(r) { r.placeId == placeId }).toArray();
  };
};
