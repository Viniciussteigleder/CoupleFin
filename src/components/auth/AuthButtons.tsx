"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const resolveRedirectTo = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

export function AuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${resolveRedirectTo()}/callback`,
      },
    });
    setLoading(null);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading("email");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      setLoading(null);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex flex-col gap-4">
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading !== null}
          onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading !== null}
          onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
        />
        <Button
          onClick={handleEmailLogin}
          disabled={loading !== null}
          variant="secondary"
        >
          {loading === "email" ? "Entrando..." : "Entrar com Email"}
        </Button>
      </div>
    </div>
  );
}

