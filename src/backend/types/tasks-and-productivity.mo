import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type TaskId = Common.TaskId;

  public type Category = {
    #Work;
    #Personal;
    #Study;
    #Health;
    #Finance;
  };

  public type Priority = {
    #High;
    #Medium;
    #Low;
  };

  public type Task = {
    id : TaskId;
    userId : UserId;
    title : Text;
    description : Text;
    category : Category;
    priority : Priority;
    deadline : ?Timestamp;
    completed : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type CreateTaskInput = {
    title : Text;
    description : Text;
    category : Category;
    priority : Priority;
    deadline : ?Timestamp;
  };

  public type UpdateTaskInput = {
    title : ?Text;
    description : ?Text;
    category : ?Category;
    priority : ?Priority;
    deadline : ??Timestamp;
    completed : ?Bool;
  };

  public type TaskFilter = {
    priority : ?Priority;
    category : ?Category;
    completed : ?Bool;
    deadlineFrom : ?Timestamp;
    deadlineTo : ?Timestamp;
    searchText : ?Text;
  };

  public type UserSettings = {
    userId : UserId;
    displayName : Text;
    theme : { #light; #dark };
    notificationsEnabled : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type UpdateSettingsInput = {
    displayName : ?Text;
    theme : ?{ #light; #dark };
    notificationsEnabled : ?Bool;
  };

  public type ProductivityLog = {
    userId : UserId;
    date : Text; // ISO date string "YYYY-MM-DD"
    completedTaskIds : [TaskId];
    totalCompleted : Nat;
  };

  public type DayStats = {
    date : Text;
    completedCount : Nat;
  };

  public type WeeklyChart = {
    days : [DayStats];
    totalThisWeek : Nat;
  };

  public type ProductivityStats = {
    totalTasks : Nat;
    completedTasks : Nat;
    pendingTasks : Nat;
    weeklyChart : WeeklyChart;
    monthlyCompleted : Nat;
    completionRate : Nat; // percentage 0-100
  };
};
