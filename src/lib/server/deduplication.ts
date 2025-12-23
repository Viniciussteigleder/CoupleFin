
import { createClient } from "@/lib/supabase/server";

interface Candidate {
  merchant: string;
  amount: number;
  date: string;
}

interface DuplicateMatch {
  candidateIndex: number; // Index in the input array
  existingId: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

// 1. Normalize Merchant
// "Uber *Trip 123" -> "ubertrip123"
export function normalizeMerchant(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, ""); // Remove punctuation & spaces
}

// 2. Levenshtein Distance for Similarity
function levenshtein(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function getSimilarity(a: string, b: string): number {
  const normA = normalizeMerchant(a);
  const normB = normalizeMerchant(b);
  if (!normA || !normB) return 0;

  const distance = levenshtein(normA, normB);
  const maxLength = Math.max(normA.length, normB.length);
  return 1 - distance / maxLength;
}

// 3. Find Duplicates
// We will look for transactions within +/- 2 days with the same amount (or very close)
export async function findDuplicates(
  candidates: Candidate[]
): Promise<Map<number, DuplicateMatch>> {
  const supabase = createClient();
  const duplicatesMap = new Map<number, DuplicateMatch>();

  if (candidates.length === 0) return duplicatesMap;

  // Optimize: query DB for the entire date range of the batch
  const dates = candidates.map((c) => new Date(c.date).getTime());
  const minDate = new Date(Math.min(...dates) - 2 * 24 * 60 * 60 * 1000).toISOString();
  const maxDate = new Date(Math.max(...dates) + 2 * 24 * 60 * 60 * 1000).toISOString();

  const { data: existingTxs } = await supabase
    .from("transactions")
    .select("id, merchant, amount_cf, date")
    .gte("date", minDate)
    .lte("date", maxDate);

  if (!existingTxs || existingTxs.length === 0) return duplicatesMap;

  candidates.forEach((candidate, index) => {
    const candidateDate = new Date(candidate.date).getTime();
    
    // Filter existing by date window (+/- 2 days) and amount
    const potentialMatches = existingTxs.filter((tx) => {
      const txDate = new Date(tx.date).getTime();
      const dayDiff = Math.abs(candidateDate - txDate) / (1000 * 3600 * 24);
      
      // Amount check: allow 0.01 diff
      const amountDiff = Math.abs(tx.amount_cf - candidate.amount);
      
      return dayDiff <= 2 && amountDiff <= 0.01;
    });

    if (potentialMatches.length > 0) {
      // Check merchant similarity
      let bestMatch: { id: string; score: number } | null = null;
      
      for (const match of potentialMatches) {
        const score = getSimilarity(candidate.merchant, match.merchant);
        if (score >= 0.6) {
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { id: match.id, score };
          }
        }
      }

      if (bestMatch) {
        duplicatesMap.set(index, {
          candidateIndex: index,
          existingId: bestMatch.id,
          confidence: bestMatch.score > 0.9 ? "high" : "medium",
          reason: `Similarity: ${(bestMatch.score * 100).toFixed(0)}%`,
        });
      }
    }
  });

  return duplicatesMap;
}
