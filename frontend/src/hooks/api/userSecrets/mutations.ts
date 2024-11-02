import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { userSecretKeys } from "./queries";
import { TCreateUserSecretRequest } from "./types";

export const useCreateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TCreateUserSecretRequest) => {
      const { data } = await apiRequest.post("/api/v3/user-secrets/raw", inputData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

export const useDeleteUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userSecretId }: { userSecretId: string }) => {
      const { data } = await apiRequest.delete(`/api/v3/user-secrets/${userSecretId}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};

export const useUpdateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userSecretId,
      ...inputData
    }: TCreateUserSecretRequest & { userSecretId: string }) => {
      const { data } = await apiRequest.patch(
        `/api/v3/user-secrets/raw/${userSecretId}`,
        inputData
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretKeys.allUserSecrets())
  });
};
