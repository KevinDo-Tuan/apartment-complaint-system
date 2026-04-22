import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/complaints";
import Common "../types/common";

module {

  // ---------- Apartments ----------

  public func createApartment(
    apartments : Map.Map<Nat, Types.Apartment>,
    nextApartmentId : Nat,
    caller : Principal,
    name : Text,
    address : Text,
  ) : (Nat, Nat) {
    if (name.size() == 0) {
      return (nextApartmentId, nextApartmentId);
    };
    let id = nextApartmentId;
    let apartment : Types.Apartment = {
      id;
      name;
      address;
      hostPrincipal = caller;
      createdAt = Time.now();
    };
    apartments.add(id, apartment);
    (id, nextApartmentId + 1);
  };

  public func getApartments(apartments : Map.Map<Nat, Types.Apartment>) : [Types.Apartment] {
    apartments.values().toArray();
  };

  public func getMyApartments(
    apartments : Map.Map<Nat, Types.Apartment>,
    caller : Principal,
  ) : [Types.Apartment] {
    apartments.values().filter(func(a) { a.hostPrincipal == caller }).toArray();
  };

  public func getApartmentById(
    apartments : Map.Map<Nat, Types.Apartment>,
    id : Nat,
  ) : ?Types.Apartment {
    apartments.get(id);
  };

  // ---------- User Profiles ----------

  public func registerAsHost(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
    name : Text,
  ) : { #ok; #err : Text } {
    if (name.size() == 0) return #err("Name cannot be empty");
    switch (profiles.get(caller)) {
      case (?_) { #err("Already registered") };
      case null {
        let profile : Types.UserProfile = {
          principal = caller;
          name;
          role = #Host;
          apartmentId = null;
          createdAt = Time.now();
        };
        profiles.add(caller, profile);
        #ok;
      };
    };
  };

  public func registerAsTenant(
    profiles : Map.Map<Principal, Types.UserProfile>,
    apartments : Map.Map<Nat, Types.Apartment>,
    caller : Principal,
    name : Text,
    apartmentId : Nat,
  ) : { #ok; #err : Text } {
    if (name.size() == 0) return #err("Name cannot be empty");
    switch (profiles.get(caller)) {
      case (?_) { #err("Already registered") };
      case null {
        switch (apartments.get(apartmentId)) {
          case null { #err("Apartment not found") };
          case (?_) {
            let profile : Types.UserProfile = {
              principal = caller;
              name;
              role = #Tenant;
              apartmentId = ?apartmentId;
              createdAt = Time.now();
            };
            profiles.add(caller, profile);
            #ok;
          };
        };
      };
    };
  };

  public func getUserProfile(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  public func isRegistered(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
  ) : Bool {
    switch (profiles.get(caller)) {
      case (?_) true;
      case null false;
    };
  };

  // ---------- Complaints ----------

  public func postComplaint(
    complaints : Map.Map<Nat, Types.Complaint>,
    profiles : Map.Map<Principal, Types.UserProfile>,
    apartments : Map.Map<Nat, Types.Apartment>,
    nextComplaintId : Nat,
    caller : Principal,
    apartmentId : Nat,
    title : Text,
    description : Text,
    category : Common.ComplaintCategory,
    priority : Common.ComplaintPriority,
  ) : ({ #ok : Nat; #err : Text }, Nat) {
    if (title.size() == 0) return (#err("Title cannot be empty"), nextComplaintId);
    if (description.size() == 0) return (#err("Description cannot be empty"), nextComplaintId);
    switch (profiles.get(caller)) {
      case null { (#err("You must be registered to post a complaint"), nextComplaintId) };
      case (?profile) {
        switch (profile.role) {
          case (#Host) { (#err("Hosts cannot post complaints — only tenants can"), nextComplaintId) };
          case (#Tenant) {
            switch (apartments.get(apartmentId)) {
              case null { (#err("Apartment not found"), nextComplaintId) };
              case (?_) {
                let now = Time.now();
                let id = nextComplaintId;
                let complaint : Types.Complaint = {
                  id;
                  tenantPrincipal = caller;
                  apartmentId;
                  title;
                  description;
                  category;
                  priority;
                  status = #Open;
                  createdAt = now;
                  updatedAt = now;
                  resolvedAt = null;
                  resolutionNotes = null;
                };
                complaints.add(id, complaint);
                (#ok(id), nextComplaintId + 1);
              };
            };
          };
        };
      };
    };
  };

  public func getComplaint(
    complaints : Map.Map<Nat, Types.Complaint>,
    id : Nat,
  ) : ?Types.Complaint {
    complaints.get(id);
  };

  public func getApartmentComplaints(
    complaints : Map.Map<Nat, Types.Complaint>,
    apartmentId : Nat,
  ) : [Types.Complaint] {
    complaints.values().filter(func(c) { c.apartmentId == apartmentId }).toArray();
  };

  public func getAllComplaints(
    complaints : Map.Map<Nat, Types.Complaint>,
  ) : [Types.Complaint] {
    complaints.values().toArray();
  };

  public func getMyComplaints(
    complaints : Map.Map<Nat, Types.Complaint>,
    caller : Principal,
  ) : [Types.Complaint] {
    complaints.values().filter(func(c) { c.tenantPrincipal == caller }).toArray();
  };

  public func updateComplaintStatus(
    complaints : Map.Map<Nat, Types.Complaint>,
    _profiles : Map.Map<Principal, Types.UserProfile>,
    apartments : Map.Map<Nat, Types.Apartment>,
    caller : Principal,
    id : Nat,
    status : Common.ComplaintStatus,
    resolutionNotes : ?Text,
  ) : { #ok; #err : Text } {
    switch (complaints.get(id)) {
      case null { #err("Complaint not found") };
      case (?complaint) {
        switch (apartments.get(complaint.apartmentId)) {
          case null { #err("Apartment not found") };
          case (?apartment) {
            if (apartment.hostPrincipal != caller) {
              return #err("Only the host of this apartment can update complaint status");
            };
            let now = Time.now();
            let resolvedAt : ?Common.Timestamp = switch (status) {
              case (#Resolved) ?now;
              case (_) complaint.resolvedAt;
            };
            let updated : Types.Complaint = {
              complaint with
              status;
              resolutionNotes;
              updatedAt = now;
              resolvedAt;
            };
            complaints.add(id, updated);
            #ok;
          };
        };
      };
    };
  };

  // ---------- Additional Query Methods ----------

  public func getComplaintsByStatus(
    complaints : Map.Map<Nat, Types.Complaint>,
    status : Common.ComplaintStatus,
  ) : [Types.Complaint] {
    complaints.values().filter(func(c) {
      switch (c.status, status) {
        case (#Open, #Open) true;
        case (#InProgress, #InProgress) true;
        case (#Resolved, #Resolved) true;
        case (_, _) false;
      };
    }).toArray();
  };

  public func getComplaintsByCategory(
    complaints : Map.Map<Nat, Types.Complaint>,
    category : Common.ComplaintCategory,
  ) : [Types.Complaint] {
    complaints.values().filter(func(c) {
      switch (c.category, category) {
        case (#Maintenance, #Maintenance) true;
        case (#Noise, #Noise) true;
        case (#Cleanliness, #Cleanliness) true;
        case (#Safety, #Safety) true;
        case (#Other, #Other) true;
        case (_, _) false;
      };
    }).toArray();
  };

  public func getComplaintStats(
    complaints : Map.Map<Nat, Types.Complaint>,
    apartmentId : Nat,
  ) : { total : Nat; open : Nat; inProgress : Nat; resolved : Nat } {
    var total = 0;
    var open = 0;
    var inProgress = 0;
    var resolved = 0;
    complaints.values().forEach(func(c) {
      if (c.apartmentId == apartmentId) {
        total += 1;
        switch (c.status) {
          case (#Open) { open += 1 };
          case (#InProgress) { inProgress += 1 };
          case (#Resolved) { resolved += 1 };
        };
      };
    });
    { total; open; inProgress; resolved };
  };

  public func deleteComplaint(
    complaints : Map.Map<Nat, Types.Complaint>,
    _profiles : Map.Map<Principal, Types.UserProfile>,
    apartments : Map.Map<Nat, Types.Apartment>,
    caller : Principal,
    id : Nat,
  ) : { #ok; #err : Text } {
    switch (complaints.get(id)) {
      case null { #err("Complaint not found") };
      case (?complaint) {
        // Allow deletion by the complaint author
        if (complaint.tenantPrincipal == caller) {
          complaints.remove(id);
          return #ok;
        };
        // Allow deletion by the host of the apartment
        switch (apartments.get(complaint.apartmentId)) {
          case null { #err("Apartment not found") };
          case (?apartment) {
            if (apartment.hostPrincipal == caller) {
              complaints.remove(id);
              #ok;
            } else {
              #err("Only the complaint author or apartment host can delete a complaint");
            };
          };
        };
      };
    };
  };
};
