import { FastifyRequest } from "fastify";
import { RouteOptions } from "fastify/types/route";

export const rateLimit = (
  max: number,
  global: boolean
): Partial<RouteOptions> => ({
  config: {
    rateLimit: {
      max,
      ...(global
        ? {
            keyGenerator: () => "global",
            global: true,
          }
        : {
            keyGenerator: (request: FastifyRequest) =>
              request.headers.authorization ?? request.ip,
            global: true,
          }),
    },
  },
});
