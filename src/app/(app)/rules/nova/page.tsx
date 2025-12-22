import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegraNovaPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Criar regra"
        subtitle="Automatize categorias com palavras-chave."
      />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Nova regra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Palavra-chave</label>
            <Input className="mt-2" placeholder="Ex: mercado, uber" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline">Supermercado</Button>
              <Button size="sm" variant="outline">Transporte</Button>
              <Button size="sm" variant="outline">Moradia</Button>
            </div>
          </div>
          <Button>Salvar regra</Button>
        </CardContent>
      </Card>
    </div>
  );
}
