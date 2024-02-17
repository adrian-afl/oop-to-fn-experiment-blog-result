export const initArray = <T>(
  size: number,
  constructor: (index: number) => T
): T[] => {
  return [...new Array<T>(size)].map((_, i) => constructor(i));
};
