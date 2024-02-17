import * as winston from "winston";

import { config } from "@app/config";
import { getExecutionPath } from "@app/util/getExecutionPath";

export const availableLogLevels: readonly string[] = [
  "none",
  "error",
  "warn",
  "info",
  "verbose",
  "debug",
] as const;
export type LogLevel = (typeof availableLogLevels)[number];

let logger: winston.Logger | undefined = undefined;
function setupLogger(): void {
  if (config.logLevel !== "none") {
    logger = winston.createLogger({
      level: config.logLevel,
      // format: winston.format.combine(
      //   winston.format.metadata(),
      //   winston.format.prettyPrint()
      // ),
      format: winston.format.printf(
        (info) =>
          `[${info.codePath as string} ${info.level}]: ${info.message as string}`
      ),
      transports: [new winston.transports.Console()],
    });
    logDebug(`Current log level: ${config.logLevel}`);
  }
}

setupLogger();

function formatAndLog(level: LogLevel, time: Date, messageRaw: unknown): void {
  const message =
    typeof messageRaw === "string"
      ? messageRaw
      : JSON.stringify(messageRaw, undefined, 2);
  logger?.log(level, message, {
    time,
    codePath: getExecutionPath({ removeTailingBreadcrumbs: 2 }).breadcrumbs,
  });
}

export function logError(message: unknown): void {
  formatAndLog("error", new Date(), message);
}

export function logWarn(message: unknown): void {
  formatAndLog("warn", new Date(), message);
}

export function logInfo(message: unknown): void {
  formatAndLog("info", new Date(), message);
}

export function logVerbose(message: unknown): void {
  formatAndLog("verbose", new Date(), message);
}

export function logDebug(message: unknown): void {
  formatAndLog("debug", new Date(), message);
}
