export function isNotEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length > 0;
}

export function checkTruthy<T extends object>(
  obj: T
): { [K in keyof T]: NonNullable<T[K]> } | null {
  const result = {} as { [K in keyof T]: NonNullable<T[K]> };

  for (const key in obj) {
    if (obj[key as keyof T] !== null && obj[key as keyof T] !== undefined) {
      result[key as keyof T] = obj[key as keyof T] as NonNullable<T[keyof T]>;
    } else {
      return null;
    }
  }

  return result;
}

// For single object
export function toCamelCase(
  obj: Record<string, unknown>,
  keyMapping: Record<string, string> = {}
): Record<string, unknown> {
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = keyMapping[key]
        ? keyMapping[key]
        : key.replace(/([-_][a-z])/g, (group) =>
            group.toUpperCase().replace("-", "").replace("_", "")
          );
      newObj[newKey as string] = obj[key];
    }
  }

  return newObj;
}

// For array of objects
export function arrayToCamelCase<T extends Record<string, unknown>>(
  arr: T[]
): T[] {
  return arr.map((obj) => toCamelCase(obj)) as T[];
}

function flattenFiltersWithPrefix(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (!!value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        acc,
        flattenFiltersWithPrefix(value as Record<string, unknown>, newKey)
      );
    } else {
      acc[newKey] = Array.isArray(value) ? value.join(",") : value;
    }

    return acc;
  }, {} as Record<string, unknown>);
}

export function flattenFilters(
  obj: Record<string, unknown>,
  prefix = "",
  dropEmpty = true
): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? key : key;
    if (!!value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        acc,
        flattenFilters(value as Record<string, unknown>, newKey, dropEmpty)
      );
    } else {
      const shouldAdd =
        !dropEmpty || (Array.isArray(value) ? value.length > 0 : value);
      if (shouldAdd) {
        acc[newKey] = Array.isArray(value) ? value.join(",") : value;
      }
    }
    return acc;
  }, {} as Record<string, unknown>);
}
