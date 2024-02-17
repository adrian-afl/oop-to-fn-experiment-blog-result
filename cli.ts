import { Command } from "commander";
import { ZodError } from "zod";

import { prisma } from "@app/modules/prisma/prisma";
import { createUserCommand } from "@app/modules/user/commands/createUserCommand";
import { generateInvitationCodesCommand } from "@app/modules/user/commands/generateInvitationCodesCommand";
import { listUsersCommand } from "@app/modules/user/commands/listUsersCommand";
import { ApplicationError } from "@app/util/exception/ApplicationError";
import { UserError } from "@app/util/exception/UserError";
import { logInfo } from "@app/util/logger";

export interface CliCommand {
  register(program: Command): void;
}

const registerCliCommand = (program: Command, cmd: CliCommand): void => {
  cmd.register(program);
};

export const cli = async (): Promise<void> => {
  const program = new Command();
  program.name("cli").description("cli").version("1.0.0");

  registerCliCommand(program, createUserCommand);
  registerCliCommand(program, generateInvitationCodesCommand);
  registerCliCommand(program, listUsersCommand);

  try {
    await program.parseAsync();
  } catch (err) {
    if (err instanceof ZodError) {
      for (const issue of err.issues) {
        logInfo(JSON.stringify(issue));
      }
    } else if (err instanceof UserError) {
      logInfo(`User Error: ${err.message}`);
    } else if (err instanceof ApplicationError) {
      logInfo(`Server Error: ${err.message}`);
    } else {
      logInfo(
        `Generic Error: ${(err as { message?: string }).message ?? "unknown"}`
      );
    }
  }
};

void prisma.$connect().then(
  () =>
    void cli().then(async () => {
      await prisma.$disconnect();
    })
);
