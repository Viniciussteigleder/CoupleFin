"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/app/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-background px-4 lg:static lg:h-[72px] lg:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64">
           {/* Reusing Sidebar for mobile */}
           <Sidebar /> 
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Placeholder for Breadcrumbs or Page Title if needed */}
      </div>
      <div className="flex items-center gap-2">
         {/* User Menu / Avatar would go here */}
         <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
            US
         </div>
      </div>
    </header>
  );
}
