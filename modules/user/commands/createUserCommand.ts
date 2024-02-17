import { Command } from "commander";
import { z } from "zod";

import { CliCommand } from "@app/cli";
import { createUser } from "@app/modules/user/logic/common/createUser";
import { logInfo } from "@app/util/logger";

const schema = z.object({
  userName: z
    .string()
    .min(3, "User name must have at least 3 characters")
    .max(16, "User name must have at most 16 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "User name can only contain letters, numbers and an underscore (_)"
    ),
  email: z.string().email(),
  password: z.string().min(6, "Password must have at least 6 characters"),
  roles: z.string().describe("Comma separated"),
});

async function execute(options: unknown): Promise<void> {
  const data = schema.parse(options);

  const roles = data.roles.split(",").map((r) => r.trim());
  const user = await createUser({
    ...data,
    roles,
    invitationCodesCount: 0,
  });
  logInfo(`Created user:`);
  logInfo(JSON.stringify(user, undefined, 2));
}

export const createUserCommand: CliCommand = {
  register(program: Command): void {
    program
      .command("users:create")
      .requiredOption("--user-name <userName>", "user name")
      .requiredOption("--email <email>", "email")
      .requiredOption("--password <password>", "password")
      .requiredOption("--roles <roles>", "roles separated by commas")
      .action((options) => execute(options));
  },
};
