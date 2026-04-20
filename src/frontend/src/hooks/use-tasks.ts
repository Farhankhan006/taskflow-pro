import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import { createBackendService } from "../lib/backend-service";
import type {
  CreateTaskInput,
  Task,
  TaskFilter,
  UpdateTaskInput,
} from "../lib/types";

function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service: actor ? createBackendService(actor as any) : null,
    ready: !!actor && !isFetching,
  };
}

export function useTasksQuery(filter: TaskFilter | null = null) {
  const { service, ready } = useBackend();
  return useQuery<Task[]>({
    queryKey: ["tasks", filter],
    queryFn: async () => {
      if (!service) return [];
      return service.getTasks(filter);
    },
    enabled: ready,
    staleTime: 30_000,
  });
}

export function useTaskQuery(taskId: bigint | null) {
  const { service, ready } = useBackend();
  return useQuery<Task | null>({
    queryKey: ["task", taskId?.toString()],
    queryFn: async () => {
      if (!service || taskId === null) return null;
      return service.getTask(taskId);
    },
    enabled: ready && taskId !== null,
  });
}

export function useCreateTaskMutation() {
  const { service } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!service) throw new Error("Backend not available");
      return service.createTask(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["productivityStats"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyChart"] });
    },
  });
}

export function useUpdateTaskMutation() {
  const { service } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      input,
    }: { taskId: bigint; input: UpdateTaskInput }) => {
      if (!service) throw new Error("Backend not available");
      return service.updateTask(taskId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["productivityStats"] });
    },
  });
}

export function useDeleteTaskMutation() {
  const { service } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!service) throw new Error("Backend not available");
      return service.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["productivityStats"] });
    },
  });
}

export function useToggleTaskMutation() {
  const { service } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!service) throw new Error("Backend not available");
      return service.toggleTaskComplete(taskId);
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["productivityStats"] });
    },
  });
}
