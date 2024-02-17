import { FastifyRequest } from "fastify";
import { ZodSchema, ZodUnknown, z } from "zod";

import { AuthorizedController } from "@app/util/api/registerAuthorizedController";
import { Controller } from "@app/util/api/registerController";

export interface RequestData<
  PathType extends ZodSchema = ZodUnknown,
  QueryType extends ZodSchema = ZodUnknown,
  BodyType extends ZodSchema = ZodUnknown,
> {
  body: z.infer<BodyType>;
  query: z.infer<QueryType>;
  path: z.infer<PathType>;
}

export const parseRequestData = <
  OutType extends ZodSchema = ZodUnknown,
  PathType extends ZodSchema = ZodUnknown,
  QueryType extends ZodSchema = ZodUnknown,
  BodyType extends ZodSchema = ZodUnknown,
>(
  controller:
    | Controller<OutType, PathType, QueryType, BodyType>
    | AuthorizedController<OutType, PathType, QueryType, BodyType>,
  request: FastifyRequest
): RequestData<PathType, QueryType, BodyType> => {
  return {
    body: controller.bodySchema.parse(request.body) as z.infer<BodyType>,
    path: controller.pathParamsSchema.parse(request.body) as z.infer<QueryType>,
    query: controller.queryParamsSchema.parse(
      request.body
    ) as z.infer<PathType>,
  };
};
