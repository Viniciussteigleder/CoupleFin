"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

type Mode = "login" | "signup";

const resolveRedirectTo = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

export function AuthForm({ mode }: { mode: Mode }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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
      toast({
        title: mode === "signup" ? "Erro ao criar conta" : "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (mode === "signup" && !data.session) {
      toast({
        title: "Conta criada",
        description: "Confirme o email para concluir o acesso.",
      });
      setLoading(false);
      return;
    }

    trackEvent("login_success");
    router.replace("/dashboard");
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Informe seu email",
        description: "Digite o email para enviarmos o link de redefinição.",
      });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${resolveRedirectTo()}/reset-password`,
    });
    if (error) {
      toast({
        title: "Erro ao enviar link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Link enviado",
        description: "Confira seu email para redefinir a senha.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={loading} variant="secondary">
          {loading
            ? mode === "signup"
              ? "Criando..."
              : "Entrando..."
            : mode === "signup"
            ? "Criar conta"
            : "Entrar"}
        </Button>
      </div>

      {mode === "login" ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            className="transition hover:text-foreground"
            onClick={handleResetPassword}
            disabled={loading}
          >
            Esqueci minha senha
          </button>
          <Link href="/signup" className="transition hover:text-foreground">
            Criar conta
          </Link>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="transition hover:text-foreground">
            Entrar
          </Link>
        </div>
      )}
    </div>
  );
}
