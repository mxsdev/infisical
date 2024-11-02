import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { TRawUserSecret } from "./types";

export const userSecretKeys = {
  allUserSecrets: () => ["userSecrets"] as const,
  getRawUserSecretById: (arg: { userSecretId: string }) => ["raw-user-secret", arg]
};

export const useGetUserSecrets = () => {
  return useQuery({
    queryKey: userSecretKeys.allUserSecrets(),
    queryFn: async () => {
      const { data } = await apiRequest.get<{ userSecrets: TRawUserSecret[] }>(
        "/api/v3/user-secrets/raw"
      );
      return data;
    }
  });
};
