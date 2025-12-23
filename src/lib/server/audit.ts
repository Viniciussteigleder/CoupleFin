
import { createClient } from "@/lib/supabase/server";

export type EventType =
  | "import_csv"
  | "rule_created"
  | "rule_applied_past"
  | "rule_applied_new"
  | "transaction_confirmed"
  | "transaction_categorized"
  | "transaction_marked_duplicate"
  | "duplicates_merged"
  | "duplicates_kept"
  | "ritual_started"
  | "ritual_completed";

export async function logTransactionEvent(
  type: EventType,
  entityId: string | null,
  payload: Record<string, unknown>
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(`[Audit] Failed to log event ${type}: No authenticated user.`);
    return;
  }

  try {
    const { error } = await supabase.from("transaction_events").insert({
      user_id: user.id,
      type,
      entity_id: entityId,
      payload_json: payload,
    });

    if (error) {
      console.error(`[Audit] Failed to insert event ${type}:`, error);
    }
  } catch (err) {
    console.error(`[Audit] Exception logging event ${type}:`, err);
  }
}
