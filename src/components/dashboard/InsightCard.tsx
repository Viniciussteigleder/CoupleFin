"use client";

import { Card, CardContent } from "@/components/ui/card";

interface InsightCardProps {
  title: string;
  message: string;
  onViewDetails?: () => void;
}

export function InsightCard({ title, message, onViewDetails }: InsightCardProps) {
  return (
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg relative overflow-hidden border-0">
      {/* Decorative blur */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
      
      <CardContent className="relative z-10 p-6">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3 opacity-90">
          <span className="material-symbols-outlined text-[20px] text-white">lightbulb</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">{title}</span>
        </div>
        
        {/* Message */}
        <p className="text-lg font-medium leading-snug mb-4 text-white">
          {message}
        </p>
        
        {/* CTA */}
        {onViewDetails && (
          <button 
            onClick={onViewDetails}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1 text-white"
          >
            Ver detalhes 
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
