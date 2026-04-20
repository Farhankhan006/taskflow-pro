import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import { createBackendService } from "../lib/backend-service";
import type { UpdateSettingsInput, UserSettings } from "../lib/types";

function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service: actor ? createBackendService(actor as any) : null,
    ready: !!actor && !isFetching,
  };
}

export function useUserSettingsQuery() {
  const { service, ready } = useBackend();
  return useQuery<UserSettings | null>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      if (!service) return null;
      return service.getUserSettings();
    },
    enabled: ready,
    staleTime: 120_000,
  });
}

export function useUpdateSettingsMutation() {
  const { service } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateSettingsInput) => {
      if (!service) throw new Error("Backend not available");
      return service.updateUserSettings(input);
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["userSettings"], updatedSettings);
    },
  });
}
