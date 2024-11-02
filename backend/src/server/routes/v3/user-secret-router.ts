import { z } from "zod";

import { UserSecretCredentialsSchema, UserSecretsSchema } from "@app/db/schemas";
import { ForbiddenRequestError } from "@app/lib/errors";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { ActorType, AuthMode } from "@app/services/auth/auth-type";

export const registerUserSecretRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "GET",
    url: "/raw",
    schema: {
      description: "List all raw user secrets for an organization",
      security: [
        {
          bearerAuth: []
        }
      ],
      response: {
        200: z.object({
          userSecrets: UserSecretsSchema.omit({ encryptedCredentials: true })
            .extend({
              credentials: UserSecretCredentialsSchema
            })
            .array()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY]),
    handler: async (req) => {
      if (req.permission.type !== ActorType.USER) {
        throw new ForbiddenRequestError({ message: "Only users can retrieve secrets" });
      }

      const userSecrets = await server.services.userSecret.listRawUserSecretsForUser({
        userId: req.permission.id,
        orgId: req.permission.orgId
      });

      return { userSecrets };
    }
  });

  server.route({
    method: "POST",
    url: "/raw",
    schema: {
      description: "Create a user secret",
      security: [
        {
          bearerAuth: []
        }
      ],
      body: z
        .object({
          name: z.string().min(1).trim()
        })
        .and(UserSecretCredentialsSchema),
      response: {
        200: UserSecretsSchema.omit({ encryptedCredentials: true })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY]),
    handler: async (req) => {
      const { name, ...credentials } = req.body;

      if (req.permission.type !== ActorType.USER) {
        throw new ForbiddenRequestError({ message: "Only users can create user secrets" });
      }

      const userSecret = await server.services.userSecret.createUserSecret({
        orgId: req.permission.orgId,
        name,
        credentials,
        userId: req.permission.id
      });

      return userSecret;
    }
  });

  server.route({
    method: "DELETE",
    url: "/:userSecretId",
    schema: {
      description: "Delete a user secret",
      security: [
        {
          bearerAuth: []
        }
      ],
      params: z.object({
        userSecretId: z.string()
      }),
      response: {
        200: UserSecretsSchema.omit({ encryptedCredentials: true })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY]),
    handler: async (req) => {
      if (req.permission.type !== ActorType.USER) {
        throw new ForbiddenRequestError({ message: "Only users can delete user secrets" });
      }

      const userSecret = await server.services.userSecret.deleteUserSecret({
        userId: req.permission.id,
        userSecretId: req.params.userSecretId
      });

      return userSecret;
    }
  });

  server.route({
    method: "PATCH",
    url: "/raw/:userSecretId",
    schema: {
      description: "Update a user secret",
      security: [
        {
          bearerAuth: []
        }
      ],
      params: z.object({
        userSecretId: z.string()
      }),
      body: z
        .object({
          name: z.string().min(1).trim()
        })
        .and(UserSecretCredentialsSchema),
      response: {
        200: UserSecretsSchema.omit({ encryptedCredentials: true })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT, AuthMode.API_KEY]),
    handler: async (req) => {
      const { name, ...credentials } = req.body;

      if (req.permission.type !== ActorType.USER) {
        throw new ForbiddenRequestError({ message: "Only users can update user secrets" });
      }

      const userSecret = await server.services.userSecret.updateUserSecret({
        orgId: req.permission.orgId,
        userId: req.permission.id,
        userSecretId: req.params.userSecretId,
        name,
        credentials
      });

      return userSecret;
    }
  });
};
