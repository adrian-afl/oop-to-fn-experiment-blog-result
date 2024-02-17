export function getSourceName<T>(source: T): string {
  const cast = source as {
    constructor?: { name?: string };
    name?: string;
    toString: () => string;
  };
  let src: string = source ? cast.toString() : "undefined";
  if (typeof source !== "string") {
    let found = false;
    try {
      if (cast.name) {
        src = cast.name;
        found = true;
      }
    } catch (e) {
      //
    }
    try {
      if (!found && source && cast.constructor) {
        if (cast.constructor.name) {
          src = cast.constructor.name;
        } else {
          src = "object";
        }
      }
    } catch (e) {
      //
    }
  }
  return src;
}
