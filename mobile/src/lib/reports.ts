import { createSupabaseClient } from "@/src/lib/supabase/client";

export async function reportMessage(messageId: string, reason?: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("message_reports").insert({
    message_id: messageId,
    reason: reason?.trim() || null,
  });
  if (error) throw new Error(error.message);
}
