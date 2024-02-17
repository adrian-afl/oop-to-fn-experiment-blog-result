import * as path from "path";

export interface StackEntry {
  identifier: string;
  path: string;
  line: number;
  column: number;
}

export function getExecutionPath(
  options: {
    filterDir?: string;
    limit?: number;
    removeTailingBreadcrumbs?: number;
  } = {}
): {
  stack: StackEntry[];
  local: StackEntry[];
  named: StackEntry[];
  breadcrumbs: string;
} {
  const detectorRegex = /at (.+?) \((.+?)\)/;

  const inobj = { stack: "" } satisfies { stack: string };

  const oldLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = options.limit ?? 10;
  Error.captureStackTrace(inobj);
  Error.stackTraceLimit = oldLimit;

  const stack = inobj.stack
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x.startsWith("at"))
    .map((x) => x.match(detectorRegex))
    .filter((x) => !!x) as RegExpMatchArray[];
  stack.shift();
  for (let i = 0; i < (options.removeTailingBreadcrumbs ?? 0); i++) {
    stack.shift();
  }
  stack.reverse();

  const detections: StackEntry[] = stack.map((x) => {
    const identifier = x[1];
    const pathlinecol = x[2].split(":");
    const column =
      pathlinecol.length > 2 ? parseInt(pathlinecol.pop() ?? "0") : 0;
    const line =
      pathlinecol.length > 1 ? parseInt(pathlinecol.pop() ?? "0") : 0;
    const p = pathlinecol.join(":");
    return { identifier, path: p, line, column };
  });

  const local = detections.filter(
    (x) =>
      x.path.startsWith(path.resolve(options.filterDir ?? process.cwd())) &&
      !x.path.includes("node_modules") // TODO just read it from tsconfig
  );

  const named = local
    .filter((x) => !x.identifier.includes("<anonymous>"))
    .filter((x) => !x.identifier.startsWith("Object."))
    .filter((x) => !x.identifier.startsWith("Module."));

  const breadcrumbs = named.map((x) => x.identifier).join("/");

  return { stack: detections, local, named, breadcrumbs };
}
