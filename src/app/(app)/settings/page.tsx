"use client";

import { useState } from "react";
import { Globe, Coins, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [language, setLanguage] = useState("pt");
  const [location, setLocation] = useState("de");
  const [currency, setCurrency] = useState("eur");
  const [aiAutomation, setAiAutomation] = useState(true);

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Preferências atualizadas com sucesso.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie preferências, idioma e privacidade.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Idioma e Região
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Idioma do App</Label>
                <p className="text-sm text-muted-foreground">
                  Português é o padrão do app.
                </p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Localização</Label>
                <p className="text-sm text-muted-foreground">
                  Usada para datas e formatos locais.
                </p>
              </div>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="br">Brasil</SelectItem>
                  <SelectItem value="de">Alemanha</SelectItem>
                  <SelectItem value="us">Estados Unidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Moeda Principal</Label>
                <p className="text-sm text-muted-foreground">
                  Símbolo utilizado nos relatórios.
                </p>
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eur">Euro (€)</SelectItem>
                  <SelectItem value="brl">Real (R$)</SelectItem>
                  <SelectItem value="usd">Dólar ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Barra de progresso do mês</Label>
                <span className="text-xs text-muted-foreground">65% usado</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div className="h-3 w-2/3 rounded-full bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Automações da IA</Label>
                <p className="text-sm text-muted-foreground">
                  Sugestões automáticas e insights do mês.
                </p>
              </div>
              <Switch checked={aiAutomation} onCheckedChange={setAiAutomation} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" className="rounded-xl">Cancelar</Button>
          <Button onClick={handleSave} className="rounded-xl px-8">Salvar Alterações</Button>
        </div>
      </div>
    </div>
  );
}
