// Public API mixin for destination reviews and ratings
import Time "mo:core/Time";
import ReviewTypes "../types/reviews";
import ReviewLib "../lib/reviews";

mixin (
  reviews : ReviewLib.ReviewMap,
) {
  /// Save a review for a destination and return its ID
  public func saveReview(
    placeId : Text,
    userId : Text,
    userName : Text,
    rating : Nat,
    reviewText : Text,
  ) : async Nat {
    let entry = ReviewLib.saveReview(
      reviews, placeId, userId, userName,
      rating, reviewText, Time.now(),
    );
    entry.id;
  };

  /// Retrieve all reviews for a given destination
  public query func getReviewsForPlace(placeId : Text) : async [ReviewTypes.Review] {
    ReviewLib.getReviewsForPlace(reviews, placeId);
  };
};
