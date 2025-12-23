
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const IMPORT_DIR = "/Users/viniciussteigleder/Documents/Web apps - vide coding/upload files";
const DEFAULT_COUPLE_NAME = "Casal Exemplo";

async function main() {
  console.log("Iniciando importação...");

  if (!fs.existsSync(IMPORT_DIR)) {
      console.error(`Diretório não encontrado: ${IMPORT_DIR}`);
      // Fallback relative for testing if absolute fails in other envs
      // process.exit(1); 
  }

  // 1. Get or Create User (mock or real)
  // For script, we might need a real user ID or we create a couple and attach later.
  // We'll create a couple directly first.
  
  let coupleId: string;

  const { data: couples } = await supabase.from("couples").select("*").eq("name", DEFAULT_COUPLE_NAME).single();
  
  if (couples) {
      coupleId = couples.id;
      console.log(`Usando casal existente: ${coupleId}`);
  } else {
      const { data: newCouple, error } = await supabase.from("couples").insert({ name: DEFAULT_COUPLE_NAME }).select().single();
      if (error) throw error;
      coupleId = newCouple.id;
      console.log(`Novo casal criado: ${coupleId}`);
  }

  // 2. Read Files
  const files = fs.readdirSync(IMPORT_DIR).filter(f => f.endsWith(".csv"));
  console.log(`Encontrados ${files.length} arquivos CSV.`);

  for (const file of files) {
      const filePath = path.join(IMPORT_DIR, file);
      const content = fs.readFileSync(filePath, "utf8");
      
      Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
              console.log(`Processando ${file} (${results.data.length} linhas)...`);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const transactions = results.data.map((row: any) => {
                 // Map CSV columns to schema. Assuming 'Date', 'Description', 'Amount'.
                 // Adjust keys based on actual CSV format.
                 const amountStr = (row['Amount'] || row['Valor'] || "0")
                    .replace("R$", "")
                    .replace("€", "")
                    .replace(/\s/g, "")
                    .replace(",", ".");
                 const amount = parseFloat(amountStr);
                 
                 return {
                     couple_id: coupleId,
                     date: row['Date'] || row['Data'] || new Date().toISOString(),
                     merchant: row['Description'] || row['Descrição'] || "Sem descrição",
                     amount: amount,
                     amount_cf: amount, // Keep both for safety based on existing schema
                     status: 'pending',
                 };
              });

              // BATCH INSERT
              if (transactions.length > 0) {
                  const chunked = chunk(transactions, 100);
                  for (const batch of chunked) {
                      const { error } = await supabase.from("transactions").insert(batch);
                      if (error) console.error(`Erro ao inserir lote de ${file}:`, error);
                  }
                  console.log(`Importado ${file} com sucesso.`);
              }
          }
      });
  }
}

function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

main().catch(console.error);
