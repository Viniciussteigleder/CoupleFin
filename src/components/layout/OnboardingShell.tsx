"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const steps = [
  { href: "/onboarding/boas-vindas", label: "Boas-vindas", icon: "waving_hand" },
  { href: "/onboarding/categorias", label: "Categorias", icon: "grid_view" },
  { href: "/onboarding/orcamentos", label: "Orcamentos", icon: "receipt_long" },
  { href: "/onboarding/cartoes", label: "Cartoes", icon: "credit_card" },
  { href: "/onboarding/ritual", label: "Ritual", icon: "sparkles" },
  { href: "/onboarding/importar", label: "Primeiro import", icon: "cloud_upload" },
];

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeIndex = steps.findIndex((step) => pathname.startsWith(step.href));
  const progress = activeIndex === -1 ? 1 : activeIndex + 1;

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-80 flex-col border-r border-border/60 bg-muted/40 lg:flex">
        <div className="flex h-full flex-col p-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="material-symbols-outlined text-2xl">savings</span>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Budget Coach</p>
              <span className="text-xs text-muted-foreground">Couple Edition</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Configuracao inicial
            </p>
            <div className="flex flex-col">
              {steps.map((step, index) => {
                const isActive = pathname.startsWith(step.href);
                const isDone = index < activeIndex;

                return (
                  <Link
                    key={step.href}
                    href={step.href}
                    className={cn(
                      "relative flex items-center gap-4 py-3",
                      isDone ? "opacity-60" : "opacity-100"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isDone
                          ? "bg-foreground text-background"
                          : "border border-border text-muted-foreground"
                      )}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isDone ? "check" : step.icon}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        isActive ? "font-semibold text-foreground" : "text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    {index < steps.length - 1 ? (
                      <div className="absolute left-4 top-11 h-6 w-0.5 -translate-x-1/2 bg-border" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-soft">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-muted" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">Precisa de ajuda?</span>
                <span className="text-xs text-muted-foreground">Fale com o suporte</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">savings</span>
            <span className="font-semibold">Budget Coach</span>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            Passo {progress} de {steps.length}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 lg:px-16">
          {children}
        </div>
      </main>
    </div>
  );
}
