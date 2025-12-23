import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Criar conta
        </p>
        <h1 className="text-3xl font-black">Comece agora</h1>
        <p className="text-base text-muted-foreground">
          Configure sua conta e importe o primeiro extrato.
        </p>
      </div>
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
        </CardContent>
      </Card>
    </div>
  );
}
