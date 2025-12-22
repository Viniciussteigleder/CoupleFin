import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthButtons } from "@/components/auth/AuthButtons";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Couple Budget Coach
        </p>
        <h1 className="text-3xl font-black">Bem-vindo de volta</h1>
        <p className="text-base text-muted-foreground">
          Entre para acompanhar o painel mensal e guiar o ritual financeiro.
        </p>
      </div>
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthButtons />
        </CardContent>
      </Card>
    </div>
  );
}
