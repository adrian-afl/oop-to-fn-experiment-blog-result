import * as crypto from "crypto";
import { FastifyInstance, FastifyRequest } from "fastify";
import * as fastify from "fastify";
import { FastifyPluginCallback } from "fastify/types/plugin";
import { FastifyRegisterOptions } from "fastify/types/register";
import { ZodError } from "zod";

import { config } from "@app/config";
import { prisma } from "@app/modules/prisma/prisma";
import { listUsersController } from "@app/modules/user/controllers/listUsersController";
import { loginController } from "@app/modules/user/controllers/loginController";
import { meController } from "@app/modules/user/controllers/meController";
import { refreshTokenController } from "@app/modules/user/controllers/refreshTokenController";
import { registerUserController } from "@app/modules/user/controllers/registerUserController";
import { verifyController } from "@app/modules/user/controllers/verifyController";
import { getCurrentUserForRequest } from "@app/modules/user/logic/authentication/getCurrentUserForRequest";
import { registerAuthorizedController } from "@app/util/api/registerAuthorizedController";
import { registerController } from "@app/util/api/registerController";
import { ApplicationError } from "@app/util/exception/ApplicationError";
import { ForbiddenError } from "@app/util/exception/ForbiddenError";
import { NotAuthenticatedError } from "@app/util/exception/NotAuthenticatedError";
import { NotFoundError } from "@app/util/exception/NotFoundError";
import { UserError } from "@app/util/exception/UserError";
import { logError, logInfo } from "@app/util/logger";

import cors, { FastifyCorsOptions } from "@fastify/cors";
import { FastifyStaticOptions } from "@fastify/static";
import * as stattic from "@fastify/static";
import { User } from "@prisma/client";

export interface FastifyRequestWithAppData extends FastifyRequest {
  user: User | null;
  id: string;
  requestTime: Date;
  version: "anonymous";
}

export interface AuthorizedFastifyRequestWithAppData extends FastifyRequest {
  user: User;
  id: string;
  requestTime: Date;
  version: "authorized";
}

export interface ApiConfiguration {
  port: number;
  host?: string;
  cors?: FastifyCorsOptions;
  static?: FastifyStaticOptions;
  plugins?: {
    plugin: FastifyPluginCallback;
    options: FastifyRegisterOptions<unknown>;
  }[];
  setup?: (instance: FastifyInstance) => void;
}

export const api = async (
  config: ApiConfiguration
): Promise<FastifyInstance> => {
  const server = fastify({
    requestIdHeader: false,
    genReqId: function (req) {
      type ExtendedRequest = FastifyRequest & {
        requestTime: Date;
      };
      const treq = req as unknown as ExtendedRequest;
      treq.requestTime = new Date();
      return crypto.randomUUID();
    },
  });

  if (config.cors) {
    await server.register(cors, config.cors);
  }

  if (config.static) {
    await server.register(stattic.default, config.static);
  }

  if (config.plugins) {
    for (const plugin of config.plugins) {
      await server.register(plugin.plugin, plugin.options);
    }
  }

  registerController(server, registerUserController);
  registerController(server, loginController);
  registerController(server, verifyController);
  registerAuthorizedController(server, meController);
  registerAuthorizedController(server, refreshTokenController);
  registerAuthorizedController(server, listUsersController);

  server.setErrorHandler(async (err: Error, _req, rep) => {
    logError(JSON.stringify(err));
    if (err instanceof ZodError) {
      await rep.status(400).send({ validationIssues: err.issues });
    } else if (err instanceof UserError) {
      await rep.status(400).send({ error: err.message });
    } else if (err instanceof ApplicationError) {
      await rep.status(500).send({ error: err.message });
    } else if (err instanceof NotAuthenticatedError) {
      await rep.status(401).send({ error: err.message });
    } else if (err instanceof ForbiddenError) {
      await rep.status(403).send({ error: err.message });
    } else if (err instanceof NotFoundError) {
      await rep.status(404).send({ error: err.message });
    } else {
      await rep.status(500).send({
        error: (err as { message?: string }).message ?? "unknown",
      });
    }
  });

  server.addHook("preHandler", async (ireq: FastifyRequest) => {
    const req = ireq as FastifyRequestWithAppData;
    req.id = crypto.randomUUID();
    req.requestTime = new Date();
    req.user = await getCurrentUserForRequest(req);
    req.version = "anonymous";
  });

  logInfo("Starting the fastify server");
  await new Promise<void>((resolve, reject) => {
    server.listen({ port: config.port, host: config.host ?? "::" }, (err) => {
      if (err) {
        logError(err.message);
        reject(err);
      }
      resolve();
    });
  });
  logInfo(`Server listening at ${config.port}`);

  return server;
};

void prisma.$connect().then(
  () =>
    void api({
      cors: { origin: "*" },
      port: config.apiPort,
    }).then(async () => {
      //await prisma.$disconnect();
    })
);
