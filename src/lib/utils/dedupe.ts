import { Transaction } from "@/types/transactions";
import { daysBetween } from "@/lib/utils/dates";

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return 1;

  const aTokens = new Set(a.split(" "));
  const bTokens = new Set(b.split(" "));
  let intersection = 0;

  aTokens.forEach((token) => {
    if (bTokens.has(token)) intersection += 1;
  });

  const union = new Set([...aTokens, ...bTokens]).size || 1;
  return intersection / union;
}

export function isPotentialDuplicate(a: Transaction, b: Transaction) {
  const merchantScore = similarity(normalize(a.merchant), normalize(b.merchant));
  const sameAmount = Math.abs(a.amount - b.amount) < 0.01;
  const closeDates = daysBetween(a.date, b.date) <= 2;
  return merchantScore >= 0.6 && sameAmount && closeDates;
}

export function findDuplicateGroups(transactions: Transaction[]) {
  const groups: Transaction[][] = [];
  const visited = new Set<string>();

  for (let i = 0; i < transactions.length; i += 1) {
    const current = transactions[i];
    if (visited.has(current.id)) continue;

    const group = [current];
    for (let j = i + 1; j < transactions.length; j += 1) {
      const candidate = transactions[j];
      if (visited.has(candidate.id)) continue;
      if (isPotentialDuplicate(current, candidate)) {
        group.push(candidate);
      }
    }

    if (group.length > 1) {
      group.forEach((item) => visited.add(item.id));
      groups.push(group);
    }
  }

  return groups;
}
