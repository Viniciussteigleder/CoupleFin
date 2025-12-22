"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lightbulb, ArrowRight, AlertCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

// Mock implementation of Skeleton
function SkeletonMock({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-muted rounded-md ${className}`} />;
}

type Insight = {
    id: string;
    title: string;
    body: string;
    cta: { label: string; href: string };
    severity: "warning" | "tip" | "success";
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
        .then(res => res.json())
        .then(json => {
            if (json.ok) setInsights(json.data);
        })
        .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-xl font-semibold md:text-2xl">Insights</h1>
         <p className="text-sm text-muted-foreground">Recomendações inteligentes para suas finanças.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {loading && (
             <>
                <SkeletonMock className="h-48 w-full" />
                <SkeletonMock className="h-48 w-full" />
                <SkeletonMock className="h-48 w-full" />
             </>
         )}

         {!loading && insights.length === 0 && (
            <div className="col-span-full rounded-xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
              Sem insights disponíveis no momento. Faça uploads para gerar recomendações.
            </div>
         )}

         {!loading && insights.map(i => (
             <Card key={i.id} className={cn("flex flex-col border-none shadow-sm h-full", 
                 i.severity === "warning" ? "bg-amber-50" : 
                 i.severity === "success" ? "bg-emerald-50" : "bg-blue-50"
             )}>
                 <CardHeader className="pb-3 relative">
                    <div className="flex items-center gap-2 mb-2">
                        {i.severity === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
                        {i.severity === "tip" && <Lightbulb className="h-5 w-5 text-blue-500" />}
                        {i.severity === "success" && <TrendingUp className="h-5 w-5 text-green-500" />}
                        <span className={cn("text-xs font-bold uppercase", 
                             i.severity === "warning" ? "text-amber-700" : 
                             i.severity === "success" ? "text-emerald-700" : "text-blue-700"
                        )}>
                            {i.severity === "warning" ? "Atenção" : i.severity === "tip" ? "Dica" : "Conquista"}
                        </span>
                    </div>
                    <CardTitle className={cn("text-lg", 
                        i.severity === "warning" ? "text-amber-900" : 
                        i.severity === "success" ? "text-emerald-900" : "text-blue-900"
                    )}>{i.title}</CardTitle>
                 </CardHeader>
                 <CardContent className="flex-1">
                     <p className={cn("text-sm leading-relaxed", 
                        i.severity === "warning" ? "text-amber-800" : 
                        i.severity === "success" ? "text-emerald-800" : "text-blue-800"
                     )}>
                         {i.body}
                     </p>
                 </CardContent>
                 <CardFooter>
                     <Button variant="ghost" className={cn("w-full justify-between hover:bg-black/5", 
                        i.severity === "warning" ? "text-amber-900" : 
                        i.severity === "success" ? "text-emerald-900" : "text-blue-900"
                     )} asChild>
                         <Link href={i.cta.href}>
                             {i.cta.label}
                             <ArrowRight className="h-4 w-4" />
                         </Link>
                     </Button>
                 </CardFooter>
             </Card>
         ))}
      </div>
    </div>
  );
}
