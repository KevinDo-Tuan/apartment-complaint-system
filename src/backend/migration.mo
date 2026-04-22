import Map "mo:core/Map";
import Principal "mo:core/Principal";
import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";

module {

  // ---- Types from the old blog actor (mo:base/OrderedMap) ----

  type OldUserProfile = {
    username : Text;
    name : ?Text;
    bio : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    displayName : Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
    isFollowedByCurrentUser : Bool;
  };

  type OldComment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    likedBy : [Principal];
    authorName : ?Text;
    authorProfilePicture : ?Blob;
    isLikedByCurrentUser : Bool;
  };

  type OldPost = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    likedBy : [Principal];
    authorName : ?Text;
    authorProfilePicture : ?Blob;
    isLikedByCurrentUser : Bool;
  };

  type OldUserRelationship = {
    follower : Principal;
    following : Principal;
    timestamp : Time.Time;
  };

  // ---- New complaint system types ----

  type ComplaintStatus = {
    #Open;
    #InProgress;
    #Resolved;
  };

  type ComplaintCategory = {
    #Maintenance;
    #Noise;
    #Cleanliness;
    #Safety;
    #Other;
  };

  type ComplaintPriority = {
    #Low;
    #Medium;
    #High;
  };

  type UserRole = {
    #Host;
    #Tenant;
  };

  type Apartment = {
    id : Nat;
    name : Text;
    address : Text;
    hostPrincipal : Principal;
    createdAt : Int;
  };

  type UserProfile = {
    principal : Principal;
    name : Text;
    role : UserRole;
    apartmentId : ?Nat;
    createdAt : Int;
  };

  type Complaint = {
    id : Nat;
    tenantPrincipal : Principal;
    apartmentId : Nat;
    title : Text;
    description : Text;
    category : ComplaintCategory;
    priority : ComplaintPriority;
    status : ComplaintStatus;
    createdAt : Int;
    updatedAt : Int;
    resolvedAt : ?Int;
    resolutionNotes : ?Text;
  };

  // ---- OldActor: the previous blog system stable fields ----

  public type OldActor = {
    var userProfiles : OrderedMap.Map<Principal, OldUserProfile>;
    var usersByUsername : OrderedMap.Map<Text, Principal>;
    var reservedUsernames : [Text];
    var posts : OrderedMap.Map<Nat, OldPost>;
    var nextPostId : Nat;
    var comments : OrderedMap.Map<Nat, OldComment>;
    var nextCommentId : Nat;
    var relationships : OrderedMap.Map<Text, OldUserRelationship>;
    var profilePictures : [(Principal, Blob)];
  };

  // ---- NewActor: the complaint system stable fields ----

  public type NewActor = {
    complaints : Map.Map<Nat, Complaint>;
    apartments : Map.Map<Nat, Apartment>;
    profiles : Map.Map<Principal, UserProfile>;
    var nextComplaintId : Nat;
    var nextApartmentId : Nat;
  };

  // Migrate from old blog system to new complaint system.
  // All old blog data is intentionally dropped; new state starts empty.
  public func run(_old : OldActor) : NewActor {
    {
      complaints = Map.empty<Nat, Complaint>();
      apartments = Map.empty<Nat, Apartment>();
      profiles = Map.empty<Principal, UserProfile>();
      var nextComplaintId = 0;
      var nextApartmentId = 0;
    };
  };
};
