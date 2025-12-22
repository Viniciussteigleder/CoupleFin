import { createClient } from "@/lib/supabase/client";

export interface CategoryOption {
  id: string;
  name: string;
}

export async function fetchCategories(): Promise<CategoryOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
