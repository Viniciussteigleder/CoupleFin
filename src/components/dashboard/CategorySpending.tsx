"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface CategorySpendingProps {
  categories: {
    name: string;
    icon: string;
    spent: number;
    percentage: number;
    color: string; // Tailwind color class like "orange", "blue", "purple"
  }[];
  total: number;
}

export function CategorySpending({ categories, total }: CategorySpendingProps) {
  // Calculate donut segments
  let cumulativeOffset = 0;
  const segments = categories.map((cat) => {
    const segment = {
      ...cat,
      offset: cumulativeOffset,
    };
    cumulativeOffset += cat.percentage;
    return segment;
  });

  return (
    <Card className="bg-white dark:bg-card-dark rounded-2xl shadow-card border border-gray-100 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-8">
        {/* Category List */}
        <div className="flex-1 space-y-4">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                cat.color === "orange" && "bg-orange-50 text-orange-500",
                cat.color === "blue" && "bg-blue-50 text-blue-500",
                cat.color === "purple" && "bg-purple-50 text-purple-500",
                cat.color === "green" && "bg-green-50 text-green-500",
                cat.color === "red" && "bg-red-50 text-red-500",
              )}>
                <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  <span className="text-sm font-bold">{cat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      cat.color === "orange" && "bg-orange-400",
                      cat.color === "blue" && "bg-blue-500",
                      cat.color === "purple" && "bg-purple-500",
                      cat.color === "green" && "bg-green-500",
                      cat.color === "red" && "bg-red-500",
                    )}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Donut Chart */}
        <div className="w-full sm:w-48 h-48 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Ring background */}
            <path
              className="text-gray-100 dark:text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {/* Segments */}
            {segments.map((seg, i) => (
              <path
                key={i}
                className={cn(
                  seg.color === "orange" && "text-orange-400",
                  seg.color === "blue" && "text-blue-500",
                  seg.color === "purple" && "text-purple-500",
                  seg.color === "green" && "text-green-500",
                  seg.color === "red" && "text-red-500",
                )}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${seg.percentage}, 100`}
                strokeDashoffset={`-${seg.offset}`}
              />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
