import Map "mo:core/Map";
import Types "../types/complaints";
import Common "../types/common";
import ComplaintsLib "../lib/complaints";

mixin (
  complaints : Map.Map<Nat, Types.Complaint>,
  apartments : Map.Map<Nat, Types.Apartment>,
  profiles : Map.Map<Principal, Types.UserProfile>,
) {

  // ---------- Registration ----------

  public shared ({ caller }) func registerAsHost(name : Text) : async { #ok; #err : Text } {
    ComplaintsLib.registerAsHost(profiles, caller, name);
  };

  public shared ({ caller }) func registerAsTenant(name : Text, apartmentId : Nat) : async { #ok; #err : Text } {
    ComplaintsLib.registerAsTenant(profiles, apartments, caller, name, apartmentId);
  };

  // ---------- Apartments ----------

  public query func getApartments() : async [Types.Apartment] {
    ComplaintsLib.getApartments(apartments);
  };

  public query ({ caller }) func getMyApartments() : async [Types.Apartment] {
    ComplaintsLib.getMyApartments(apartments, caller);
  };

  // ---------- Complaints ----------

  public query func getComplaint(id : Nat) : async ?Types.Complaint {
    ComplaintsLib.getComplaint(complaints, id);
  };

  public query func getApartmentComplaints(apartmentId : Nat) : async [Types.Complaint] {
    ComplaintsLib.getApartmentComplaints(complaints, apartmentId);
  };

  public query func getAllComplaints() : async [Types.Complaint] {
    ComplaintsLib.getAllComplaints(complaints);
  };

  public query ({ caller }) func getMyComplaints() : async [Types.Complaint] {
    ComplaintsLib.getMyComplaints(complaints, caller);
  };

  public shared ({ caller }) func updateComplaintStatus(
    id : Nat,
    status : Common.ComplaintStatus,
    resolutionNotes : ?Text,
  ) : async { #ok; #err : Text } {
    ComplaintsLib.updateComplaintStatus(complaints, profiles, apartments, caller, id, status, resolutionNotes);
  };

  // ---------- Additional Query Methods ----------

  public query func getComplaintsByStatus(status : Common.ComplaintStatus) : async [Types.Complaint] {
    ComplaintsLib.getComplaintsByStatus(complaints, status);
  };

  public query func getComplaintsByCategory(category : Common.ComplaintCategory) : async [Types.Complaint] {
    ComplaintsLib.getComplaintsByCategory(complaints, category);
  };

  public query func getComplaintStats(apartmentId : Nat) : async { total : Nat; open : Nat; inProgress : Nat; resolved : Nat } {
    ComplaintsLib.getComplaintStats(complaints, apartmentId);
  };

  public shared ({ caller }) func deleteComplaint(id : Nat) : async { #ok; #err : Text } {
    ComplaintsLib.deleteComplaint(complaints, profiles, apartments, caller, id);
  };

  // ---------- Profiles ----------

  public query ({ caller }) func getUserProfile() : async ?Types.UserProfile {
    ComplaintsLib.getUserProfile(profiles, caller);
  };

  public query ({ caller }) func isRegistered() : async Bool {
    ComplaintsLib.isRegistered(profiles, caller);
  };
};
