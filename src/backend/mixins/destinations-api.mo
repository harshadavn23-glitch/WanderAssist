// Public API mixin for destination search and lookup
import DestTypes "../types/destinations";
import DestLib "../lib/destinations";

mixin (
  destinations : DestLib.DestinationMap,
) {
  /// Seed or overwrite a destination entry (admin / init use)
  public func initDestination(
    id : Text,
    name : Text,
    country : Text,
    region : Text,
    tags : [Text],
    pricePerPerson : Float,
    image : Text,
    description : Text,
  ) : async () {
    DestLib.initDestination(
      destinations, id, name, country, region,
      tags, pricePerPerson, image, description,
    );
  };

  /// Case-insensitive search across name, country, region, and tags
  public query func searchDestinations(searchTerm : Text) : async [DestTypes.Destination] {
    DestLib.searchDestinations(destinations, searchTerm);
  };

  /// Retrieve a single destination by ID
  public query func getDestination(id : Text) : async ?DestTypes.Destination {
    DestLib.getDestination(destinations, id);
  };

  /// Return all destinations
  public query func listAllDestinations() : async [DestTypes.Destination] {
    DestLib.listAllDestinations(destinations);
  };
};
