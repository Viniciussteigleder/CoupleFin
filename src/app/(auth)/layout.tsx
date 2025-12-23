export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,520px)_1fr]">
        <div className="relative flex flex-col justify-center px-6 py-12 lg:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(15,23,42,0.08),_transparent_60%)]" />
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            {children}
          </div>
        </div>
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/70 to-rose-50/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_55%)]" />
          <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-white/80 blur-3xl" />
          <div className="absolute bottom-6 left-8 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              CasalFin
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold text-foreground">
                Visao clara do mes, sem friccao.
              </h2>
              <p className="text-sm text-muted-foreground">
                Importe seus extratos, confirme pendencias e acompanhe o
                progresso do casal ou da sua conta individual.
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 text-xs text-muted-foreground shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
              Dica: Uploads recentes aparecem direto no painel de confirmacao.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
