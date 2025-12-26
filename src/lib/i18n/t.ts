import pt from "../../../copy/pt.json";

type CopyValue = string | Record<string, unknown> | undefined;

const getValue = (key: string): CopyValue =>
  key.split(".").reduce<CopyValue>((acc, segment) => {
    if (typeof acc === "string" || acc === undefined) {
      return undefined;
    }
    const value = (acc as Record<string, unknown>)[segment];
    return value as CopyValue;
  }, pt as Record<string, CopyValue>);

export const t = (key: string): string => {
  const value = getValue(key);
  return typeof value === "string" ? value : key;
};
