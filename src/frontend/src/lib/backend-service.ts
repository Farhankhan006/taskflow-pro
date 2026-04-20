/**
 * Typed wrappers for all canister calls via the backend actor.
 * Never call actor methods directly from components — always use these wrappers.
 * Translates between frontend types (null for optional) and backend types (undefined for optional).
 */
import type { backendInterface } from "../backend";
import type {
  CreateTaskInput,
  ProductivityStats,
  Task,
  TaskFilter,
  UpdateSettingsInput,
  UpdateTaskInput,
  UserSettings,
  WeeklyChart,
} from "./types";

type Actor = backendInterface;

// Patch: backend uses undefined, frontend uses null
function backendTaskToTask(
  t: Awaited<ReturnType<Actor["getTask"]>>,
): Task | null {
  if (t == null) return null;
  return {
    ...t,
    category: t.category as Task["category"],
    priority: t.priority as Task["priority"],
    deadline: t.deadline !== undefined ? t.deadline : null,
  } as Task;
}

function backendTasksToTasks(
  tasks: Awaited<ReturnType<Actor["getTasks"]>>,
): Task[] {
  return tasks.map((t) => ({
    ...t,
    category: t.category as Task["category"],
    priority: t.priority as Task["priority"],
    deadline: t.deadline !== undefined ? t.deadline : null,
  })) as Task[];
}

function backendSettingsToSettings(
  s: Awaited<ReturnType<Actor["getUserSettings"]>>,
): UserSettings | null {
  if (s == null) return null;
  return {
    ...s,
    theme: s.theme as "light" | "dark",
  } as UserSettings;
}

function createTaskInputToBackend(
  input: CreateTaskInput,
): Parameters<Actor["createTask"]>[0] {
  return {
    ...input,
    category: input.category as Parameters<Actor["createTask"]>[0]["category"],
    priority: input.priority as Parameters<Actor["createTask"]>[0]["priority"],
    deadline: input.deadline !== null ? input.deadline : undefined,
  };
}

function taskFilterToBackend(
  filter: TaskFilter | null,
): Parameters<Actor["getTasks"]>[0] {
  if (!filter) return null;
  return {
    priority:
      filter.priority !== null
        ? (filter.priority as Parameters<Actor["getTasks"]>[0] extends object
            ? never
            : never)
        : undefined,
    category: filter.category !== null ? (filter.category as never) : undefined,
    completed: filter.completed !== null ? filter.completed : undefined,
    deadlineFrom:
      filter.deadlineFrom !== null ? filter.deadlineFrom : undefined,
    deadlineTo: filter.deadlineTo !== null ? filter.deadlineTo : undefined,
    searchText: filter.searchText !== null ? filter.searchText : undefined,
  } as Parameters<Actor["getTasks"]>[0];
}

function updateTaskInputToBackend(
  input: UpdateTaskInput,
): Parameters<Actor["updateTask"]>[1] {
  return {
    title: input.title !== null ? input.title : undefined,
    description: input.description !== null ? input.description : undefined,
    category: input.category !== null ? (input.category as never) : undefined,
    priority: input.priority !== null ? (input.priority as never) : undefined,
    completed: input.completed !== null ? input.completed : undefined,
    deadline: input.deadline,
  } as Parameters<Actor["updateTask"]>[1];
}

function updateSettingsInputToBackend(
  input: UpdateSettingsInput,
): Parameters<Actor["updateUserSettings"]>[0] {
  return {
    displayName: input.displayName !== null ? input.displayName : undefined,
    theme: input.theme !== null ? (input.theme as never) : undefined,
    notificationsEnabled:
      input.notificationsEnabled !== null
        ? input.notificationsEnabled
        : undefined,
  } as Parameters<Actor["updateUserSettings"]>[0];
}

export function createBackendService(actor: Actor) {
  return {
    async createTask(input: CreateTaskInput): Promise<Task> {
      const result = await actor.createTask(createTaskInputToBackend(input));
      return backendTaskToTask(result) as Task;
    },

    async getTasks(filter: TaskFilter | null): Promise<Task[]> {
      const result = await actor.getTasks(taskFilterToBackend(filter));
      return backendTasksToTasks(result);
    },

    async getTask(taskId: bigint): Promise<Task | null> {
      const result = await actor.getTask(taskId);
      return backendTaskToTask(result);
    },

    async updateTask(
      taskId: bigint,
      input: UpdateTaskInput,
    ): Promise<Task | null> {
      const result = await actor.updateTask(
        taskId,
        updateTaskInputToBackend(input),
      );
      return backendTaskToTask(result);
    },

    async deleteTask(taskId: bigint): Promise<boolean> {
      return actor.deleteTask(taskId);
    },

    async toggleTaskComplete(taskId: bigint): Promise<Task | null> {
      const result = await actor.toggleTaskComplete(taskId);
      return backendTaskToTask(result);
    },

    async getUserSettings(): Promise<UserSettings | null> {
      const result = await actor.getUserSettings();
      return backendSettingsToSettings(result);
    },

    async updateUserSettings(
      input: UpdateSettingsInput,
    ): Promise<UserSettings> {
      const result = await actor.updateUserSettings(
        updateSettingsInputToBackend(input),
      );
      return {
        ...result,
        theme: result.theme as "light" | "dark",
      } as UserSettings;
    },

    async getProductivityStats(): Promise<ProductivityStats> {
      return actor.getProductivityStats() as Promise<ProductivityStats>;
    },

    async getWeeklyChart(): Promise<WeeklyChart> {
      return actor.getWeeklyChart() as Promise<WeeklyChart>;
    },
  };
}

export type BackendService = ReturnType<typeof createBackendService>;
