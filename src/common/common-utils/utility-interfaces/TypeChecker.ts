

export const isNullOrUndefined = (
  value: unknown
): value is null | undefined => {
  return value === null || value === undefined;
};

export const isEmpty = (value: unknown): boolean => {

  if (isNullOrUndefined(value)) return true;

  if (typeof value === "string") return value.trim() === "";

  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === "object") return Object.keys(value).length === 0;

  return false;
};

export const isNumeric = (value: unknown): boolean => {
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value !== "string") return false;
  return (

    !Number.isNaN(Number.parseFloat(value)) && Number.isFinite(Number(value))
  );
};

export const toNumber = (value: unknown, defaultValue: number = 0): number => {
  if (isNumeric(value)) {
    return Number(value);
  }
  return defaultValue;
};

export const isValidDate = (value: unknown): boolean => {

  if (value instanceof Date) return !Number.isNaN(value.getTime());

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }
  return false;
};

export const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> => {
  return Object.hasOwn(obj, prop);
};

export const isObjectWithProps = <T extends object>(
  value: unknown,
  requiredProps: (keyof T)[]
): value is T => {

  if (typeof value !== "object" || value === null) return false;

  return requiredProps.every((prop) => Object.hasOwn(value, prop));
};
