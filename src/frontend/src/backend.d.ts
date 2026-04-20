import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface CreateTaskInput {
    title: string;
    description: string;
    deadline?: Timestamp;
    category: Category;
    priority: Priority;
}
export interface Task {
    id: TaskId;
    title: string;
    userId: UserId;
    createdAt: Timestamp;
    completed: boolean;
    description: string;
    deadline?: Timestamp;
    updatedAt: Timestamp;
    category: Category;
    priority: Priority;
}
export type UserId = Principal;
export interface DayStats {
    date: string;
    completedCount: bigint;
}
export interface UpdateSettingsInput {
    theme?: Variant_dark_light;
    notificationsEnabled?: boolean;
    displayName?: string;
}
export type TaskId = bigint;
export interface UserSettings {
    theme: Variant_dark_light;
    notificationsEnabled: boolean;
    displayName: string;
    userId: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface TaskFilter {
    deadlineTo?: Timestamp;
    deadlineFrom?: Timestamp;
    completed?: boolean;
    searchText?: string;
    category?: Category;
    priority?: Priority;
}
export interface UpdateTaskInput {
    title?: string;
    completed?: boolean;
    description?: string;
    deadline?: Timestamp | null;
    category?: Category;
    priority?: Priority;
}
export interface WeeklyChart {
    days: Array<DayStats>;
    totalThisWeek: bigint;
}
export interface ProductivityStats {
    totalTasks: bigint;
    completionRate: bigint;
    completedTasks: bigint;
    monthlyCompleted: bigint;
    weeklyChart: WeeklyChart;
    pendingTasks: bigint;
}
export enum Category {
    Study = "Study",
    Health = "Health",
    Work = "Work",
    Personal = "Personal",
    Finance = "Finance"
}
export enum Priority {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_dark_light {
    dark = "dark",
    light = "light"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(input: CreateTaskInput): Promise<Task>;
    deleteTask(taskId: bigint): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getProductivityStats(): Promise<ProductivityStats>;
    getTask(taskId: bigint): Promise<Task | null>;
    getTasks(filter: TaskFilter | null): Promise<Array<Task>>;
    getUserSettings(): Promise<UserSettings | null>;
    getWeeklyChart(): Promise<WeeklyChart>;
    isCallerAdmin(): Promise<boolean>;
    toggleTaskComplete(taskId: bigint): Promise<Task | null>;
    updateTask(taskId: bigint, input: UpdateTaskInput): Promise<Task | null>;
    updateUserSettings(input: UpdateSettingsInput): Promise<UserSettings>;
}
