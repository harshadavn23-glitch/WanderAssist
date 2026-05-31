// Destination types for WanderAssist search and map features
module {
  public type Destination = {
    id : Text;
    name : Text;
    country : Text;
    region : Text; // "indian" | "international"
    tags : [Text];
    pricePerPerson : Float;
    image : Text;
    description : Text;
  };
};
