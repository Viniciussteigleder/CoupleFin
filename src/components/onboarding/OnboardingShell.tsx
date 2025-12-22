"use client";

import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingShellProps {
  children: React.ReactNode;
  step: number;
  totalSteps?: number;
  title: string;
  description?: string;
  backHref?: string;
  onNext?: () => void;
  nextLabel?: string;
  disableNext?: boolean;
}

export function OnboardingShell({
  children,
  step,
  totalSteps = 5,
  title,
  description,
  backHref,
  onNext,
  nextLabel = "Continuar",
  disableNext = false,
}: OnboardingShellProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b px-4 lg:px-8">
        <div className="flex items-center gap-2">
            {backHref ? (
                <Link href={backHref}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                         <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
            ) : <div className="w-8" />}
          <span className="font-semibold text-primary">Couple Budget Coach</span>
        </div>
        <div className="w-32">
             <Progress value={progress} className="h-2" />
        </div>
      </header>
      
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
             {description && (
                <p className="text-muted-foreground">{description}</p>
             )}
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {children}
          </div>

          {onNext && (
              <div className="pt-4">
                  <Button className="w-full" size="lg" onClick={onNext} disabled={disableNext}>
                      {nextLabel}
                  </Button>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}
