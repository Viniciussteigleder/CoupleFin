export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,520px)_1fr]">
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
          {children}
        </div>
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-slate-100" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl" />
          <div className="relative z-10 flex h-full w-full flex-col justify-between p-12">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              CasalFin
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                Visao clara do mes, sem friccao.
              </h2>
              <p className="text-sm text-muted-foreground">
                Importe seus extratos, confirme pendencias e acompanhe o
                progresso do casal ou da sua conta individual.
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-muted-foreground">
              Dica: Uploads recentes aparecem direto no painel de confirmacao.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
