import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: member } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member?.couple_id) {
      const coupleName = user.user_metadata?.full_name
        ? `Casal de ${String(user.user_metadata.full_name).split(" ")[0]}`
        : user.email
        ? `Casal de ${user.email.split("@")[0]}`
        : "Casal";

      const { data: couple } = await supabase
        .from("couples")
        .insert({ name: coupleName })
        .select("id")
        .single();

      if (couple?.id) {
        await supabase.from("couple_members").insert({
          couple_id: couple.id,
          user_id: user.id,
          role: "admin",
        });
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
