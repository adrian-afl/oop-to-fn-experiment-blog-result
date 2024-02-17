import { Command } from "commander";
import { z } from "zod";

import { CliCommand } from "@app/cli";
import { listUsers } from "@app/modules/user/logic/common/listUsers";
import { createPagination } from "@app/util/createPagination";
import { logInfo } from "@app/util/logger";

const schema = z.object({
  searchByUserName: z.optional(z.string()),
  skip: z.coerce.number(),
  take: z.coerce.number(),
});

async function execute(options: unknown): Promise<void> {
  const data = schema.parse(options);

  const users = await listUsers({
    searchByUserName: data.searchByUserName ?? null,
    pagination: createPagination({ ...data, limit: 400 }),
  });
  logInfo(`Found ${users.length} users`);
  for (const user of users) {
    logInfo(JSON.stringify(user, undefined, 2));
  }
}

export const listUsersCommand: CliCommand = {
  register(program: Command): void {
    program
      .command("users:list")
      .option(
        "--search-by-user-name <searchByUserName>",
        "Optional filter by user name"
      )
      .option("--skip <skip>", "how many to read", "0")
      .option("--take <take>", "how many to skip", "20")
      .action((options) => execute(options));
  },
};
