import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/tasks-and-productivity";
import Lib "../lib/tasks-and-productivity";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tasks : List.List<Types.Task>,
  userSettings : Map.Map<Principal, Types.UserSettings>,
  productivityLogs : Map.Map<Text, Types.ProductivityLog>,
  nextTaskId : { var value : Nat },
) {
  // ── Auth guard ─────────────────────────────────────────────────────────────

  func requireAuth(caller : Principal) {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
  };

  // ── Task CRUD ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func createTask(input : Types.CreateTaskInput) : async Types.Task {
    requireAuth(caller);
    let id = nextTaskId.value;
    nextTaskId.value += 1;
    Lib.createTask(tasks, id, caller, input, Time.now());
  };

  public query ({ caller }) func getTasks(filter : ?Types.TaskFilter) : async [Types.Task] {
    requireAuth(caller);
    Lib.getTasks(tasks, caller, filter);
  };

  public query ({ caller }) func getTask(taskId : Nat) : async ?Types.Task {
    requireAuth(caller);
    Lib.getTask(tasks, caller, taskId);
  };

  public shared ({ caller }) func updateTask(taskId : Nat, input : Types.UpdateTaskInput) : async ?Types.Task {
    requireAuth(caller);
    Lib.updateTask(tasks, caller, taskId, input, Time.now());
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async Bool {
    requireAuth(caller);
    Lib.deleteTask(tasks, caller, taskId);
  };

  public shared ({ caller }) func toggleTaskComplete(taskId : Nat) : async ?Types.Task {
    requireAuth(caller);
    Lib.toggleTaskComplete(tasks, productivityLogs, caller, taskId, Time.now());
  };

  // ── User Settings ──────────────────────────────────────────────────────────

  public query ({ caller }) func getUserSettings() : async ?Types.UserSettings {
    requireAuth(caller);
    // Return null only if truly not found; defaults are returned as a value
    switch (userSettings.get(caller)) {
      case (?s) ?s;
      case null {
        // Return default settings wrapped in ?
        ?Lib.getUserSettings(userSettings, caller, Time.now());
      };
    };
  };

  public shared ({ caller }) func updateUserSettings(input : Types.UpdateSettingsInput) : async Types.UserSettings {
    requireAuth(caller);
    Lib.updateUserSettings(userSettings, caller, input, Time.now());
  };

  // ── Productivity ───────────────────────────────────────────────────────────

  public query ({ caller }) func getProductivityStats() : async Types.ProductivityStats {
    requireAuth(caller);
    Lib.getProductivityStats(tasks, productivityLogs, caller, Time.now());
  };

  public query ({ caller }) func getWeeklyChart() : async Types.WeeklyChart {
    requireAuth(caller);
    Lib.getWeeklyChart(productivityLogs, caller, Time.now());
  };
};
