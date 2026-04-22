import Common "common";

module {
  public type Apartment = {
    id : Nat;
    name : Text;
    address : Text;
    hostPrincipal : Principal;
    createdAt : Common.Timestamp;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    role : Common.UserRole;
    apartmentId : ?Nat;
    createdAt : Common.Timestamp;
  };

  public type Complaint = {
    id : Nat;
    tenantPrincipal : Principal;
    apartmentId : Nat;
    title : Text;
    description : Text;
    category : Common.ComplaintCategory;
    priority : Common.ComplaintPriority;
    status : Common.ComplaintStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
    resolvedAt : ?Common.Timestamp;
    resolutionNotes : ?Text;
  };
};
