// Destinations domain logic for WanderAssist
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import DestTypes "../types/destinations";

module {
  public type DestinationMap = Map.Map<Text, DestTypes.Destination>;

  /// Seed or overwrite a destination entry (admin/init use)
  public func initDestination(
    destinations : DestinationMap,
    id : Text,
    name : Text,
    country : Text,
    region : Text,
    tags : [Text],
    pricePerPerson : Float,
    image : Text,
    description : Text,
  ) {
    let entry : DestTypes.Destination = {
      id; name; country; region; tags; pricePerPerson; image; description;
    };
    destinations.add(id, entry);
  };

  /// Case-insensitive search across name, country, region, and tags
  public func searchDestinations(destinations : DestinationMap, searchTerm : Text) : [DestTypes.Destination] {
    let lower = searchTerm.toLower();
    destinations.values().filter(func(d) {
      d.name.toLower().contains(#text lower) or
      d.country.toLower().contains(#text lower) or
      d.region.toLower().contains(#text lower) or
      d.tags.any(func(t) { t.toLower().contains(#text lower) })
    }).toArray();
  };

  /// Retrieve a destination by its ID
  public func getDestination(destinations : DestinationMap, id : Text) : ?DestTypes.Destination {
    destinations.get(id);
  };

  /// Return all destinations
  public func listAllDestinations(destinations : DestinationMap) : [DestTypes.Destination] {
    destinations.values().toArray();
  };
};
