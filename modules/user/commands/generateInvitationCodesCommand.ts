import { Command } from "commander";
import { z } from "zod";

import { CliCommand } from "@app/cli";
import { getUserById } from "@app/modules/user/logic/common/getUserById";
import { generateInvitationCodes } from "@app/modules/user/logic/invitationCodes/generateInvitationCodes";
import { UserError } from "@app/util/exception/UserError";
import { logInfo } from "@app/util/logger";

const schema = z.object({
  count: z.coerce.number(),
  ownerId: z.string().uuid(),
});

async function execute(options: unknown): Promise<void> {
  const data = schema.parse(options);

  const user = await getUserById(data.ownerId);
  if (!user) {
    throw new UserError("User not found");
  }
  const codes = await generateInvitationCodes(user, data.count);
  logInfo(`Created codes:`);
  logInfo(
    JSON.stringify(
      codes.map((x) => x.code),
      undefined,
      2
    )
  );
}

export const generateInvitationCodesCommand: CliCommand = {
  register(program: Command): void {
    program
      .command("codes:generate")
      .requiredOption("--owner-id <ownerId>", "ID of the owner user")
      .option("--count <count>", "how many to generate", "5")
      .action((options) => execute(options));
  },
};
