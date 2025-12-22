import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthButtons } from "@/components/auth/AuthButtons";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Couple Budget Coach
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Bem-vindo de volta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre para acompanhar o painel mensal e guiar o ritual financeiro.
        </p>
      </div>
      <Card>
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
