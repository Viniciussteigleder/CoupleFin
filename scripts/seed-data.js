
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

// Utility to parse currency
function parseCurrency(value) {
  if (!value) return 0;
  const cleaned = value
    .replace(/[€\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(cleaned) || 0;
}

async function seed() {
  console.log('🚀 Starting Seeding...');

  // 1. Get or Create Couple
  let coupleId;
  const { data: couples } = await supabase.from('couples').select('id').limit(1);
  if (couples && couples.length > 0) {
    coupleId = couples[0].id;
    console.log('✅ Using existing couple:', coupleId);
  } else {
    const { data: newCouple, error: cErr } = await supabase.from('couples').insert({ name: 'Casal Real' }).select('id').single();
    if (cErr) throw cErr;
    coupleId = newCouple.id;
    console.log('✅ Created new couple:', coupleId);
  }

  // 2. Categories
  const defaultCategories = [
    { name: "Moradia", color: "#22c55e", icon: "home", type: 'expense' },
    { name: "Mercado", color: "#60a5fa", icon: "shopping_cart", type: 'expense' },
    { name: "Restaurantes", color: "#f97316", icon: "restaurant", type: 'expense' },
    { name: "Transporte", color: "#a78bfa", icon: "commute", type: 'expense' },
    { name: "Saúde", color: "#f43f5e", icon: "medical_services", type: 'expense' },
    { name: "Lazer", color: "#eab308", icon: "confirmation_number", type: 'expense' },
    { name: "Compras", color: "#ec4899", icon: "shopping_bag", type: 'expense' },
    { name: "Serviços", color: "#64748b", icon: "work", type: 'expense' },
  ];

  for (const cat of defaultCategories) {
    await supabase.from('categories').upsert({ ...cat, couple_id: coupleId }, { onConflict: 'name,couple_id' });
  }
  const { data: dbCats } = await supabase.from('categories').select('*').eq('couple_id', coupleId);
  console.log(`✅ Seeded ${dbCats.length} categories.`);

  // 3. Import Samples
  const samplesDir = path.resolve(__dirname, '../Sample_transaction_import/CSV');
  const files = [
    { path: 'MM/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv', source: 'MM', delimiter: ';' },
    { path: 'Amex/activity (8).csv', source: 'Amex', delimiter: ',' }
  ];

  for (const fileInfo of files) {
    const fullPath = path.join(samplesDir, fileInfo.path);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Skip ${fileInfo.path} - not found.`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const results = Papa.parse(content, { header: false, delimiter: fileInfo.delimiter });
    const rows = results.data;
    
    // Simple heuristic to find header and data
    let headerIdx = -1;
    if (fileInfo.source === 'MM') {
      headerIdx = rows.findIndex(r => r.includes('Authorised on'));
    } else {
      headerIdx = rows.findIndex(r => r.includes('Datum'));
    }

    if (headerIdx === -1) {
      console.warn(`⚠️ No header found in ${fileInfo.path}`);
      continue;
    }

    const headers = rows[headerIdx].map(h => h.trim().toLowerCase().replace(/\s/g, ''));
    const transactions = rows.slice(headerIdx + 1).filter(r => r.length > 2).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        
        // Map to DB schema
        let date, description, amountRaw;
        if (fileInfo.source === 'MM') {
            date = obj.authorisedon || obj.processedon;
            description = obj.description;
            amountRaw = obj.amount;
        } else {
            date = obj.datum;
            description = obj.beschreibung;
            amountRaw = obj.betrag;
        }

        if (!date || !amountRaw) return null;

        // Parse date DD.MM.YYYY or DD/MM/YYYY
        const dMatch = date.match(/(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
        let isoDate = new Date().toISOString().split('T')[0];
        if (dMatch) {
            const year = dMatch[3].length === 2 ? `20${dMatch[3]}` : dMatch[3];
            isoDate = `${year}-${dMatch[2].padStart(2, '0')}-${dMatch[1].padStart(2, '0')}`;
        }

        const amountSign = parseCurrency(amountRaw);
        
        return {
            couple_id: coupleId,
            merchant: description || 'Desconhecido',
            amount: Math.abs(amountSign),
            amount_cf: amountSign,
            date: isoDate,
            source: fileInfo.source,
            status: 'confirmed',
            created_at: new Date().toISOString()
        }
    }).filter(Boolean);

    console.log(`📥 Importing ${transactions.length} rows from ${fileInfo.source}...`);
    const { error: insErr } = await supabase.from('transactions').insert(transactions);
    if (insErr) console.error('❌ Insert Error:', insErr);
    else console.log(`✅ Success for ${fileInfo.source}`);
  }

  console.log('🏁 Seeding finished successfully!');
}

seed().catch(console.error);
