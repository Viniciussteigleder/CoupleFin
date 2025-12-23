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

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4.1-5.4 4.1-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.4 14.5 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6 0 7.5-4.2 7.5-6.4 0-.4 0-.7-.1-1H12z"
    />
    <path
      fill="#34A853"
      d="M12 20.8c3.4 0 6.2-1.1 8.2-3l-2.9-2.3c-1.1.8-2.6 1.4-5.3 1.4-3.2 0-5.9-2.7-5.9-6 0-.7.1-1.4.4-2L3.4 6.4C2.9 7.5 2.6 9 2.6 11.6c0 5.1 4.1 9.2 9.4 9.2z"
    />
    <path
      fill="#4A90E2"
      d="M21.4 11.4c0-.4 0-.7-.1-1H12v3.9h5.4c-.3 1.1-1.1 2.5-2.7 3.5l2.9 2.3c1.7-1.6 3-3.9 3-6.7z"
    />
    <path
      fill="#FBBC05"
      d="M6.1 10.9c-.2-.7-.2-1.4 0-2L3.4 6.4c-.6 1.2-.9 2.6-.9 4.2s.3 3 1 4.2l2.6-2.1z"
    />
  </svg>
);

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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const passwordTooShort = mode === "signup" && password.length > 0 && password.length < 6;
  const canSubmit =
    Boolean(email.trim()) &&
    Boolean(password) &&
    !(mode === "signup" && password.length < 6);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }
    if (mode === "signup" && password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "Use pelo menos 6 caracteres.",
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${resolveRedirectTo()}/callback`,
      },
    });
    if (error) {
      toast({
        title: "Erro ao conectar com Google",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
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
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="h-12 w-full rounded-full border-white/70 bg-white/70 text-sm font-semibold text-foreground shadow-sm hover:bg-white"
        >
          <GoogleIcon className="h-4 w-4" />
          Continuar com Google
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border/70" />
          <span>ou</span>
          <span className="h-px flex-1 bg-border/70" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Email
          </label>
          <Input
            type="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
            className="h-12 rounded-2xl border border-transparent bg-white/80 shadow-sm ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-black/15"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Senha
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setPasswordTouched(true)}
              disabled={loading}
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
              className="h-12 rounded-2xl border border-transparent bg-white/80 pr-16 shadow-sm ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-black/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {mode === "signup" && (passwordTouched || password.length > 0) && (
            <p
              className={`text-xs ${
                passwordTooShort ? "text-amber-600" : "text-muted-foreground"
              }`}
            >
              Use pelo menos 6 caracteres.
            </p>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
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
