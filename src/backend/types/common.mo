import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  public type Timestamp = Time.Time; // Int (nanoseconds)

  public type UserId = Principal;

  public type UserRole = {
    #Host;
    #Tenant;
  };

  public type ComplaintStatus = {
    #Open;
    #InProgress;
    #Resolved;
  };

  public type ComplaintCategory = {
    #Maintenance;
    #Noise;
    #Cleanliness;
    #Safety;
    #Other;
  };

  public type ComplaintPriority = {
    #Low;
    #Medium;
    #High;
  };
};
