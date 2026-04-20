import type { backendInterface, Category, Priority, Task, UserRole, UserSettings, ProductivityStats, WeeklyChart, Variant_dark_light } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const mockPrincipal = Principal.anonymous();

const mockTasks: Task[] = [
  {
    id: BigInt(1),
    title: "Design system update",
    userId: mockPrincipal,
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1000000),
    completed: false,
    description: "Update all design tokens to new brand palette",
    deadline: BigInt(Date.now() + 86400000 * 2) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
    category: "Work" as unknown as Category,
    priority: "High" as unknown as Priority,
  },
  {
    id: BigInt(2),
    title: "Morning run 5km",
    userId: mockPrincipal,
    createdAt: BigInt(Date.now() - 86400000 * 2) * BigInt(1000000),
    completed: true,
    description: "Maintain daily fitness routine",
    deadline: BigInt(Date.now() - 3600000) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
    category: "Health" as unknown as Category,
    priority: "Medium" as unknown as Priority,
  },
  {
    id: BigInt(3),
    title: "Study TypeScript generics",
    userId: mockPrincipal,
    createdAt: BigInt(Date.now() - 86400000 * 3) * BigInt(1000000),
    completed: false,
    description: "Deep dive into advanced TypeScript patterns",
    deadline: BigInt(Date.now() + 86400000 * 5) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
    category: "Study" as unknown as Category,
    priority: "Medium" as unknown as Priority,
  },
  {
    id: BigInt(4),
    title: "Review monthly budget",
    userId: mockPrincipal,
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1000000),
    completed: false,
    description: "Check Q2 expenses and adjust savings plan",
    deadline: BigInt(Date.now() + 86400000) * BigInt(1000000),
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
    category: "Finance" as unknown as Category,
    priority: "Low" as unknown as Priority,
  },
  {
    id: BigInt(5),
    title: "Call family",
    userId: mockPrincipal,
    createdAt: BigInt(Date.now()) * BigInt(1000000),
    completed: false,
    description: "Weekly family catch-up call",
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
    category: "Personal" as unknown as Category,
    priority: "Low" as unknown as Priority,
  },
];

const mockSettings: UserSettings = {
  theme: "dark" as unknown as Variant_dark_light,
  notificationsEnabled: true,
  displayName: "Alex Johnson",
  userId: mockPrincipal,
  createdAt: BigInt(Date.now() - 86400000 * 30) * BigInt(1000000),
  updatedAt: BigInt(Date.now()) * BigInt(1000000),
};

const mockWeeklyChart: WeeklyChart = {
  days: [
    { date: "Mon", completedCount: BigInt(3) },
    { date: "Tue", completedCount: BigInt(5) },
    { date: "Wed", completedCount: BigInt(2) },
    { date: "Thu", completedCount: BigInt(7) },
    { date: "Fri", completedCount: BigInt(4) },
    { date: "Sat", completedCount: BigInt(6) },
    { date: "Sun", completedCount: BigInt(1) },
  ],
  totalThisWeek: BigInt(28),
};

const mockStats: ProductivityStats = {
  totalTasks: BigInt(42),
  completionRate: BigInt(73),
  completedTasks: BigInt(31),
  monthlyCompleted: BigInt(18),
  weeklyChart: mockWeeklyChart,
  pendingTasks: BigInt(11),
};

export const mockBackend: backendInterface = {
  _initializeAccessControl: async (): Promise<void> => undefined,
  assignCallerUserRole: async (_user: Principal, _role: UserRole): Promise<void> => undefined,
  createTask: async (input) => ({
    id: BigInt(Date.now()),
    title: input.title,
    userId: mockPrincipal,
    createdAt: BigInt(Date.now()) * BigInt(1000000),
    completed: false,
    description: input.description,
    deadline: input.deadline,
    updatedAt: BigInt(Date.now()) * BigInt(1000000),
    category: input.category,
    priority: input.priority,
  }),
  deleteTask: async (_taskId: bigint): Promise<boolean> => true,
  getCallerUserRole: async (): Promise<UserRole> => "user" as unknown as UserRole,
  getProductivityStats: async (): Promise<ProductivityStats> => mockStats,
  getTask: async (taskId: bigint): Promise<Task | null> =>
    mockTasks.find(t => t.id === taskId) ?? null,
  getTasks: async (_filter): Promise<Array<Task>> => mockTasks,
  getUserSettings: async (): Promise<UserSettings | null> => mockSettings,
  getWeeklyChart: async (): Promise<WeeklyChart> => mockWeeklyChart,
  isCallerAdmin: async (): Promise<boolean> => false,
  toggleTaskComplete: async (taskId: bigint): Promise<Task | null> => {
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) return null;
    return { ...task, completed: !task.completed };
  },
  updateTask: async (taskId: bigint, input): Promise<Task | null> => {
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) return null;
    const { deadline, ...rest } = input;
    const updated: Task = { ...task, ...rest };
    if (deadline !== undefined) {
      if (deadline !== null) updated.deadline = deadline;
      else delete updated.deadline;
    }
    return updated;
  },
  updateUserSettings: async (input): Promise<UserSettings> => ({
    ...mockSettings,
    ...input,
  }),
};
