"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function AuditPage() {
    // We don't have audit logs in store for MVP explicitly in the seed/store definition
    // I will mock some or show empty state.
    // Ideally we would add auditLogs to store.
    const logs = [
        { id: "1", date: new Date().toISOString(), action: "Login", actor: "Vinicius", details: "Acesso realizado via Google" },
        { id: "2", date: new Date(Date.now() - 1000000).toISOString(), action: "Importação", actor: "Vinicius", details: "Upload de CSV processado" },
        { id: "3", date: new Date(Date.now() - 2000000).toISOString(), action: "Alteração", actor: "Maria", details: "Meta de viagem atualizada" },
    ];

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-xl font-semibold md:text-2xl">Audit Log</h1>
         <p className="text-sm text-muted-foreground">Registro de atividades e alterações.</p>
      </div>

      <div className="border rounded-lg bg-card">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead className="hidden md:table-cell">Detalhes</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {logs.map(log => (
                      <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                              {format(new Date(log.date), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>{log.actor}</TableCell>
                          <TableCell><span className="font-medium">{log.action}</span></TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.details}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>
    </div>
  );
}
