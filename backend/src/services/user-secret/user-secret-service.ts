import { z } from "zod";

import { UserSecretCredentialsSchema } from "@app/db/schemas";
import { NotFoundError } from "@app/lib/errors";

import { TKmsServiceFactory } from "../kms/kms-service";
import { KmsDataKey } from "../kms/kms-types";
import { TUserSecretDALFactory } from "./user-secret-dal";

type TUserSecretServiceFactoryDep = {
  userSecretDAL: TUserSecretDALFactory;
  kmsService: TKmsServiceFactory;
};

export type TUserSecretServiceFactory = ReturnType<typeof userSecretServiceFactory>;

export const userSecretServiceFactory = ({ userSecretDAL, kmsService }: TUserSecretServiceFactoryDep) => {
  const listRawUserSecretsForUser = async ({ userId, orgId }: { userId: string; orgId: string }) => {
    const { decryptor: secretManagerDecryptor } = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.Organization,
      orgId
    });

    const userSecrets = await userSecretDAL.find(
      { userId, orgId },
      {
        sort: [["createdAt", "desc"]]
      }
    );

    return userSecrets.map(({ encryptedCredentials, ...userSecret }) => ({
      ...userSecret,
      credentials: UserSecretCredentialsSchema.parse(
        JSON.parse(secretManagerDecryptor({ cipherTextBlob: encryptedCredentials }).toString())
      )
    }));
  };

  const createUserSecret = async ({
    orgId,
    userId,
    name,
    credentials
  }: {
    // TODO: move payload to types file...
    userId: string;
    orgId: string;
    name: string;
    credentials: z.output<typeof UserSecretCredentialsSchema>;
  }) => {
    const { encryptor: secretManagerEncryptor } = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.Organization,
      orgId
    });

    return userSecretDAL.create({
      orgId,
      userId,

      name,
      type: credentials.type,

      encryptedCredentials: secretManagerEncryptor({ plainText: Buffer.from(JSON.stringify(credentials)) })
        .cipherTextBlob
    });
  };

  const deleteUserSecret = async ({ userId, userSecretId }: { userId: string; userSecretId: string }) => {
    const deletedRows = await userSecretDAL.delete({
      id: userSecretId,
      userId
    });

    if (deletedRows.length === 0) {
      throw new NotFoundError({ message: "User secret not found" });
    }

    return deletedRows[0];
  };

  const updateUserSecret = async ({
    orgId,
    userId,
    userSecretId,
    name,
    credentials
  }: {
    orgId: string;
    userId: string;
    userSecretId: string;
    name: string;
    credentials: z.output<typeof UserSecretCredentialsSchema>;
  }) => {
    const { encryptor: secretManagerEncryptor } = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.Organization,
      orgId
    });

    const updatedUserSecrets = await userSecretDAL.update(
      {
        id: userSecretId,
        userId
      },
      {
        name,
        type: credentials.type,
        encryptedCredentials: secretManagerEncryptor({ plainText: Buffer.from(JSON.stringify(credentials)) })
          .cipherTextBlob
      }
    );

    if (updatedUserSecrets.length === 0) {
      throw new NotFoundError({ message: "User secret not found" });
    }

    return updatedUserSecrets[0];
  };

  return {
    createUserSecret,
    listRawUserSecretsForUser,
    deleteUserSecret,
    updateUserSecret
  };
};
