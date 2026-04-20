import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Types "../types/tasks-and-productivity";

module {
  public type Task = Types.Task;
  public type UserSettings = Types.UserSettings;
  public type ProductivityLog = Types.ProductivityLog;
  public type TaskFilter = Types.TaskFilter;
  public type CreateTaskInput = Types.CreateTaskInput;
  public type UpdateTaskInput = Types.UpdateTaskInput;
  public type ProductivityStats = Types.ProductivityStats;
  public type WeeklyChart = Types.WeeklyChart;
  public type DayStats = Types.DayStats;

  // ── Helpers ────────────────────────────────────────────────────────────────

  /// Build composite log key: "{principalText}/{date}"
  public func logKey(userId : Principal, date : Text) : Text {
    userId.toText() # "/" # date;
  };

  /// Convert nanosecond timestamp (Int) to ISO date string "YYYY-MM-DD"
  /// Uses proleptic Gregorian calendar arithmetic.
  public func timestampToDate(ts : Int) : Text {
    // Convert nanoseconds to days since Unix epoch (1970-01-01)
    let secondsPerDay : Int = 86_400;
    let nsPerSecond : Int = 1_000_000_000;
    let dayIndex : Int = ts / nsPerSecond / secondsPerDay; // days since 1970-01-01

    // Shift epoch to 1 Mar 0000 for easier Gregorian math
    let z : Int = dayIndex + 719_468;
    let era : Int = (if (z >= 0) z else z - 146_096) / 146_097;
    let doe : Int = z - era * 146_097; // day of era [0, 146096]
    let yoe : Int = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365; // year of era [0, 399]
    let y : Int = yoe + era * 400;
    let doy : Int = doe - (365 * yoe + yoe / 4 - yoe / 100); // day of year [0, 365]
    let mp : Int = (5 * doy + 2) / 153; // month of year [0, 11] (Mar=0)
    let d : Int = doy - (153 * mp + 2) / 5 + 1; // day [1, 31]
    let m : Int = mp + (if (mp < 10) 3 else -9); // month [1, 12]
    let yr : Int = y + (if (m <= 2) 1 else 0);

    let yearText = padLeft(Int.abs(yr).toText(), 4, '0');
    let monthText = padLeft(Int.abs(m).toText(), 2, '0');
    let dayText = padLeft(Int.abs(d).toText(), 2, '0');
    yearText # "-" # monthText # "-" # dayText;
  };

  /// Left-pad a text with a character to reach minLen
  func padLeft(t : Text, minLen : Nat, pad : Char) : Text {
    let sz = t.size();
    if (sz >= minLen) return t;
    var result = t;
    var i = sz;
    while (i < minLen) {
      result := Text.fromChar(pad) # result;
      i += 1;
    };
    result;
  };

  // ── Task operations ────────────────────────────────────────────────────────

  public func createTask(
    tasks : List.List<Task>,
    nextId : Nat,
    caller : Principal,
    input : CreateTaskInput,
    now : Int,
  ) : Task {
    let task : Task = {
      id = nextId;
      userId = caller;
      title = input.title;
      description = input.description;
      category = input.category;
      priority = input.priority;
      deadline = input.deadline;
      completed = false;
      createdAt = now;
      updatedAt = now;
    };
    tasks.add(task);
    task;
  };

  public func getTasks(
    tasks : List.List<Task>,
    caller : Principal,
    filter : ?TaskFilter,
  ) : [Task] {
    let filtered = tasks.filter(func(t : Task) : Bool {
      // Must belong to caller
      if (not Principal.equal(t.userId, caller)) return false;

      switch (filter) {
        case null true;
        case (?f) {
          // Priority filter
          switch (f.priority) {
            case (?p) { if (t.priority != p) return false };
            case null {};
          };
          // Category filter
          switch (f.category) {
            case (?c) { if (t.category != c) return false };
            case null {};
          };
          // Completed filter
          switch (f.completed) {
            case (?done) { if (t.completed != done) return false };
            case null {};
          };
          // Deadline range filter
          switch (f.deadlineFrom) {
            case (?from) {
              switch (t.deadline) {
                case null return false;
                case (?dl) { if (dl < from) return false };
              };
            };
            case null {};
          };
          switch (f.deadlineTo) {
            case (?to) {
              switch (t.deadline) {
                case null return false;
                case (?dl) { if (dl > to) return false };
              };
            };
            case null {};
          };
          // Search text filter (case-insensitive title or description match)
          switch (f.searchText) {
            case (?searchQuery) {
              let q = searchQuery.toLower();
              if (
                not t.title.toLower().contains(#text q) and
                not t.description.toLower().contains(#text q)
              ) return false;
            };
            case null {};
          };
          true;
        };
      };
    });
    filtered.toArray();
  };

  public func getTask(
    tasks : List.List<Task>,
    caller : Principal,
    taskId : Nat,
  ) : ?Task {
    tasks.find(func(t : Task) : Bool {
      t.id == taskId and Principal.equal(t.userId, caller)
    });
  };

  public func updateTask(
    tasks : List.List<Task>,
    caller : Principal,
    taskId : Nat,
    input : UpdateTaskInput,
    now : Int,
  ) : ?Task {
    var result : ?Task = null;
    tasks.mapInPlace(func(t : Task) : Task {
      if (t.id == taskId and Principal.equal(t.userId, caller)) {
        let updated : Task = {
          t with
          title = switch (input.title) { case (?v) v; case null t.title };
          description = switch (input.description) { case (?v) v; case null t.description };
          category = switch (input.category) { case (?v) v; case null t.category };
          priority = switch (input.priority) { case (?v) v; case null t.priority };
          deadline = switch (input.deadline) {
            case (?v) v; // ??Timestamp — outer ? present, inner ?Timestamp is the new value
            case null t.deadline;
          };
          completed = switch (input.completed) { case (?v) v; case null t.completed };
          updatedAt = now;
        };
        result := ?updated;
        updated;
      } else t;
    });
    result;
  };

  public func deleteTask(
    tasks : List.List<Task>,
    caller : Principal,
    taskId : Nat,
  ) : Bool {
    let sizeBefore = tasks.size();
    let remaining = tasks.filter(func(t : Task) : Bool {
      not (t.id == taskId and Principal.equal(t.userId, caller))
    });
    // Replace list contents in place by clearing and re-adding
    tasks.clear();
    tasks.append(remaining);
    tasks.size() < sizeBefore;
  };

  public func toggleTaskComplete(
    tasks : List.List<Task>,
    productivityLogs : Map.Map<Text, ProductivityLog>,
    caller : Principal,
    taskId : Nat,
    now : Int,
  ) : ?Task {
    var result : ?Task = null;
    tasks.mapInPlace(func(t : Task) : Task {
      if (t.id == taskId and Principal.equal(t.userId, caller)) {
        let newCompleted = not t.completed;
        let updated : Task = { t with completed = newCompleted; updatedAt = now };
        let date = timestampToDate(now);
        let key = logKey(caller, date);

        if (newCompleted) {
          // Record in productivity log
          switch (productivityLogs.get(key)) {
            case null {
              productivityLogs.add(key, {
                userId = caller;
                date = date;
                completedTaskIds = [taskId];
                totalCompleted = 1;
              });
            };
            case (?existing) {
              let newIds = existing.completedTaskIds.concat([taskId]);
              productivityLogs.add(key, {
                existing with
                completedTaskIds = newIds;
                totalCompleted = newIds.size();
              });
            };
          };
        } else {
          // Remove from productivity log
          switch (productivityLogs.get(key)) {
            case null {};
            case (?existing) {
              let newIds = existing.completedTaskIds.filter(func(id : Nat) : Bool { id != taskId });
              if (newIds.size() == 0) {
                productivityLogs.remove(key);
              } else {
                productivityLogs.add(key, {
                  existing with
                  completedTaskIds = newIds;
                  totalCompleted = newIds.size();
                });
              };
            };
          };
        };

        result := ?updated;
        updated;
      } else t;
    });
    result;
  };

  // ── Settings operations ────────────────────────────────────────────────────

  public func getUserSettings(
    settings : Map.Map<Principal, UserSettings>,
    caller : Principal,
    now : Int,
  ) : UserSettings {
    switch (settings.get(caller)) {
      case (?s) s;
      case null {
        // Return defaults (not persisted until updateUserSettings is called)
        {
          userId = caller;
          displayName = "";
          theme = #light;
          notificationsEnabled = true;
          createdAt = now;
          updatedAt = now;
        };
      };
    };
  };

  public func updateUserSettings(
    settings : Map.Map<Principal, UserSettings>,
    caller : Principal,
    input : Types.UpdateSettingsInput,
    now : Int,
  ) : UserSettings {
    let existing = switch (settings.get(caller)) {
      case (?s) s;
      case null {
        {
          userId = caller;
          displayName = "";
          theme = #light;
          notificationsEnabled = true;
          createdAt = now;
          updatedAt = now;
        };
      };
    };
    let updated : UserSettings = {
      existing with
      displayName = switch (input.displayName) { case (?v) v; case null existing.displayName };
      theme = switch (input.theme) { case (?v) v; case null existing.theme };
      notificationsEnabled = switch (input.notificationsEnabled) { case (?v) v; case null existing.notificationsEnabled };
      updatedAt = now;
    };
    settings.add(caller, updated);
    updated;
  };

  // ── Productivity operations ────────────────────────────────────────────────

  public func getWeeklyChart(
    productivityLogs : Map.Map<Text, ProductivityLog>,
    caller : Principal,
    now : Int,
  ) : WeeklyChart {
    let secondsPerDay : Int = 86_400;
    let nsPerSecond : Int = 1_000_000_000;
    let nsPerDay : Int = secondsPerDay * nsPerSecond;

    // Build last 7 days (today inclusive)
    var days : [DayStats] = [];
    var totalThisWeek : Nat = 0;
    var i : Int = 6;
    while (i >= 0) {
      let dayTs = now - i * nsPerDay;
      let date = timestampToDate(dayTs);
      let key = logKey(caller, date);
      let count = switch (productivityLogs.get(key)) {
        case (?log) log.totalCompleted;
        case null 0;
      };
      totalThisWeek += count;
      days := days.concat([{ date = date; completedCount = count }]);
      i -= 1;
    };
    { days = days; totalThisWeek = totalThisWeek };
  };

  /// Extract "YYYY-MM" prefix from a "YYYY-MM-DD" date string
  func yearMonth(date : Text) : Text {
    let chars = date.toArray();
    if (chars.size() < 7) return date;
    var prefix = "";
    var j = 0;
    while (j < 7) {
      prefix := prefix # Text.fromChar(chars[j]);
      j += 1;
    };
    prefix;
  };

  public func getProductivityStats(
    tasks : List.List<Task>,
    productivityLogs : Map.Map<Text, ProductivityLog>,
    caller : Principal,
    now : Int,
  ) : ProductivityStats {
    // Count tasks belonging to caller
    let userTasks = tasks.filter(func(t : Task) : Bool {
      Principal.equal(t.userId, caller)
    });
    let total = userTasks.size();
    let completed = userTasks.filter(func(t : Task) : Bool { t.completed }).size();
    let pending = total - completed;

    // Monthly completed: sum log entries whose date matches current YYYY-MM
    let currentMonth = yearMonth(timestampToDate(now));
    var monthlyCompleted : Nat = 0;
    for ((_, log) in productivityLogs.entries()) {
      if (
        Principal.equal(log.userId, caller) and
        Text.equal(yearMonth(log.date), currentMonth)
      ) {
        monthlyCompleted += log.totalCompleted;
      };
    };

    let weeklyChart = getWeeklyChart(productivityLogs, caller, now);
    let completionRate = if (total == 0) 0 else (completed * 100) / total;

    {
      totalTasks = total;
      completedTasks = completed;
      pendingTasks = pending;
      weeklyChart = weeklyChart;
      monthlyCompleted = monthlyCompleted;
      completionRate = completionRate;
    };
  };
};
