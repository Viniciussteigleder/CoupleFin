import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        subtitle="Preferencias da conta e notificacoes."
        action={<Button variant="outline">Salvar</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Email: casal@exemplo.com</p>
          <p>Plano: Premium</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguranca</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>Encerrar a sessao neste dispositivo.</p>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
