import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Types "types/tasks-and-productivity";
import TasksMixin "mixins/tasks-and-productivity-api";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let tasks = List.empty<Types.Task>();
  let userSettings = Map.empty<Principal, Types.UserSettings>();
  let productivityLogs = Map.empty<Text, Types.ProductivityLog>();
  var _nextTaskIdValue : Nat = 0;
  let nextTaskId = { var value = _nextTaskIdValue };

  include TasksMixin(accessControlState, tasks, userSettings, productivityLogs, nextTaskId);
};
