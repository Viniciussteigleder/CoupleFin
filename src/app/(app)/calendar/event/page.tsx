import { Suspense } from "react";
import EventPageClient from "./EventPageClient";

export const dynamic = "force-dynamic";

export default function CalendarEventPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando...</div>}>
      <EventPageClient />
    </Suspense>
  );
}
