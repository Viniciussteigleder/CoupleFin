import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/SignOutButton";

const languages = ["Portuguese (BR)", "English", "Spanish"];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Configuracoes"
        subtitle="Preferencias da conta e notificacoes."
        action={<Button variant="outline">Salvar</Button>}
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span className="font-semibold text-foreground">casal@exemplo.com</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Plano</span>
            <span className="font-semibold text-foreground">Premium</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Idioma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Portugues e o idioma padrao do app.
          </p>
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <Button
                key={language}
                size="sm"
                variant={language === "Portuguese (BR)" ? "default" : "outline"}
              >
                {language}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Alertas semanais</span>
              <span className="font-semibold text-foreground">Ativo</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div className="h-3 w-4/5 rounded-full bg-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Resumo do mes</span>
              <span className="font-semibold text-foreground">Ativo</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div className="h-3 w-3/5 rounded-full bg-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
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
