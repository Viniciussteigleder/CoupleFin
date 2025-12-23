"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const resolveRedirectTo = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

export function AuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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

  const handleEmailAuth = async () => {
    if (!email || !password) {
      alert("Por favor, preencha email e senha.");
      return;
    }

    setLoading("email");
    const supabase = createClient();
    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${resolveRedirectTo()}/login`,
            },
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

    if (error) {
      alert(`${mode === "signup" ? "Erro ao criar conta" : "Erro ao fazer login"}: ${error.message}`);
      setLoading(null);
    } else {
      if (mode === "signup" && !data.session) {
        alert("Conta criada. Confirme o email para concluir o acesso.");
        setLoading(null);
        return;
      }
      router.replace("/dashboard");
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
          onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading !== null}
          onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
        />
        <Button
          onClick={handleEmailAuth}
          disabled={loading !== null}
          variant="secondary"
        >
          {loading === "email"
            ? mode === "signup"
              ? "Criando..."
              : "Entrando..."
            : mode === "signup"
            ? "Criar conta com Email"
            : "Entrar com Email"}
        </Button>
        <button
          type="button"
          className="text-xs text-muted-foreground transition hover:text-foreground"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          disabled={loading !== null}
        >
          {mode === "login"
            ? "Ainda não tem conta? Criar agora"
            : "Já tem conta? Fazer login"}
        </button>
      </div>
    </div>
  );
}
