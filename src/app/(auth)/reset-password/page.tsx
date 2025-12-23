"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      if (typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
      setLoading(false);
    };

    init();
  }, []);

  const handleUpdate = async () => {
    if (!password || password.length < 6) {
      toast({
        title: "Senha invalida",
        description: "Use pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Senhas diferentes",
        description: "Confirme a mesma senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Senha atualizada",
      description: "Voce ja pode entrar com a nova senha.",
    });
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Redefinir senha
        </p>
        <h1 className="text-3xl font-black">Crie uma nova senha</h1>
        <p className="text-base text-muted-foreground">
          Escolha uma senha segura para continuar.
        </p>
      </div>
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Atualizar senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : hasSession ? (
            <>
              <Input
                type="password"
                placeholder="Nova senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirmar senha"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              <Button onClick={handleUpdate}>Salvar nova senha</Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Abra o link de redefinicao no mesmo navegador em que solicitou o
              envio.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
