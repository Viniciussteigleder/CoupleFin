"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const redirectTo =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function AuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectTo}/callback`,
      },
    });
    setLoading(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        className="w-full"
        onClick={() => handleOAuth("google")}
        disabled={loading !== null}
      >
        {loading === "google" ? "Conectando..." : "Continuar com Google"}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuth("github")}
        disabled={loading !== null}
      >
        {loading === "github" ? "Conectando..." : "Continuar com GitHub"}
      </Button>
    </div>
  );
}
