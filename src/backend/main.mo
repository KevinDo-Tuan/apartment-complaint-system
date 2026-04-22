import Map "mo:core/Map";
import Migration "migration";
import Types "types/complaints";
import Common "types/common";
import ComplaintsApi "mixins/complaints-api";
import ComplaintsLib "lib/complaints";

(with migration = Migration.run)
actor ComplaintSystem {

  let complaints = Map.empty<Nat, Types.Complaint>();
  let apartments = Map.empty<Nat, Types.Apartment>();
  let profiles = Map.empty<Principal, Types.UserProfile>();
  var nextComplaintId : Nat = 0;
  var nextApartmentId : Nat = 0;

  include ComplaintsApi(complaints, apartments, profiles);

  // These functions mutate counters so must live in main.mo

  public shared ({ caller }) func createApartment(name : Text, address : Text) : async { #ok : Nat; #err : Text } {
    switch (profiles.get(caller)) {
      case null { #err("You must be registered as a host to create an apartment") };
      case (?profile) {
        switch (profile.role) {
          case (#Tenant) { #err("Only hosts can create apartments") };
          case (#Host) {
            if (name.size() == 0) return #err("Apartment name cannot be empty");
            if (address.size() == 0) return #err("Apartment address cannot be empty");
            let (id, newNextId) = ComplaintsLib.createApartment(apartments, nextApartmentId, caller, name, address);
            nextApartmentId := newNextId;
            #ok(id);
          };
        };
      };
    };
  };

  public shared ({ caller }) func postComplaint(
    apartmentId : Nat,
    title : Text,
    description : Text,
    category : Common.ComplaintCategory,
    priority : Common.ComplaintPriority,
  ) : async { #ok : Nat; #err : Text } {
    let (result, newNextId) = ComplaintsLib.postComplaint(
      complaints, profiles, apartments, nextComplaintId,
      caller, apartmentId, title, description, category, priority,
    );
    switch (result) {
      case (#ok(_)) { nextComplaintId := newNextId };
      case (#err(_)) {};
    };
    result;
  };
};
