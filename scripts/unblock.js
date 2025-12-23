
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { loadEnv } = require('./_env');

const { env } = loadEnv();

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials in env file.');
}
const supabase = createClient(supabaseUrl, serviceKey);

const getArgValue = (key) => {
  const index = process.argv.indexOf(`--${key}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
};

const seedEmail = getArgValue('email') || 'dev@example.com';
const seedPassword = getArgValue('password') || 'password123';

async function getColumns(table) {
    const { data, error } = await supabase.from(table).select().limit(0);
    if (error) return [];
    // This is a hack to get keys from an empty select if possible, 
    // but better to try a real row if exists.
    const { data: oneRow } = await supabase.from(table).select().limit(1);
    if (oneRow && oneRow.length > 0) return Object.keys(oneRow[0]);
    return []; // Fallback to safe defaults
}

async function run() {
    console.log('🚀 Final Unblocker Start...');

    const email = seedEmail;
    const password = seedPassword;
    
    // 1. User
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let userId = users.find(u => u.email === email)?.id;
    if (!userId) {
        const { data: { user } } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
        userId = user.id;
        console.log('👤 Created User:', userId);
    } else {
        console.log('👤 Existing User:', userId);
    }

    // 2. Couple
    const { data: existingCouple } = await supabase.from('couples').select('id').eq('name', 'Casal Dev').maybeSingle();
    let coupleId = existingCouple?.id;
    if (!coupleId) {
        const { data: newCouple } = await supabase.from('couples').insert({ name: 'Casal Dev' }).select('id').single();
        coupleId = newCouple.id;
    }
    await supabase.from('couple_members').upsert({ couple_id: coupleId, user_id: userId, role: 'admin' });
    console.log('🏡 Couple Ready:', coupleId);

    // 3. Clear existing
    await supabase.from('transactions').delete().eq('couple_id', coupleId);
    await supabase.from('categories').delete().eq('couple_id', coupleId);

    // 4. Schema Detection
    // We'll just try to guess or use a safe subset.
    const fullCats = [
        { name: "Moradia", color: "#22c55e", icon: "home", type: 'expense' },
        { name: "Mercado", color: "#60a5fa", icon: "shopping_cart", type: 'expense' },
        { name: "Restaurantes", color: "#f97316", icon: "restaurant", type: 'expense' },
        { name: "Transporte", color: "#a78bfa", icon: "commute", type: 'expense' },
        { name: "Saúde", color: "#f43f5e", icon: "medical_services", type: 'expense' },
        { name: "Lazer", color: "#eab308", icon: "confirmation_number", type: 'expense' },
        { name: "Compras", color: "#ec4899", icon: "shopping_bag", type: 'expense' },
        { name: "Serviços", color: "#64748b", icon: "work", type: 'expense' },
    ];

    console.log('📂 Seeding categories (safe mode)...');
    for (const cat of fullCats) {
        const base = { name: cat.name, type: cat.type, icon: cat.icon, couple_id: coupleId, user_id: userId };
        // Try with color
        const { error } = await supabase.from('categories').insert({ ...base, color: cat.color });
        if (error && error.message.includes('color')) {
            // Retry without color
            await supabase.from('categories').insert(base);
        }
    }

    // 5. Transactions
    console.log('📥 Importing CSVs...');
    const samplesDir = path.resolve(__dirname, '../Sample_transaction_import/CSV');
    const files = [
        { path: 'MM/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv', source: 'MM', delimiter: ';' },
        { path: 'Amex/activity (8).csv', source: 'Amex', delimiter: ',' }
    ];

    for (const fileInfo of files) {
        const fullPath = path.join(samplesDir, fileInfo.path);
        if (!fs.existsSync(fullPath)) continue;
        const content = fs.readFileSync(fullPath, 'utf8');
        const results = Papa.parse(content, { header: false, delimiter: fileInfo.delimiter });
        const rows = results.data;
        let headerIdx = fileInfo.source === 'MM' ? rows.findIndex(r => r.includes('Authorised on')) : rows.findIndex(r => r.includes('Datum'));
        if (headerIdx === -1) continue;

        const headers = rows[headerIdx].map(h => h.trim().toLowerCase().replace(/\s/g, ''));
        const transactions = rows.slice(headerIdx + 1).filter(r => r.length > 2).map(row => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = row[i]);
            let date = fileInfo.source === 'MM' ? (obj.authorisedon || obj.processedon) : obj.datum;
            let description = fileInfo.source === 'MM' ? obj.description : obj.beschreibung;
            let amountRaw = fileInfo.source === 'MM' ? obj.amount : obj.betrag;
            if (!date || !amountRaw) return null;
            const dMatch = date.match(/(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
            let isoDate = new Date().toISOString().split('T')[0];
            if (dMatch) {
                const year = dMatch[3].length === 2 ? `20${dMatch[3]}` : dMatch[3];
                isoDate = `${year}-${dMatch[2].padStart(2, '0')}-${dMatch[1].padStart(2, '0')}`;
            }
            const amountSign = (val => {
                const cleaned = val.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
                return parseFloat(cleaned) || 0;
            })(amountRaw);
            
            return {
                couple_id: coupleId,
                user_id: userId,
                merchant: description || 'Desconhecido',
                amount: Math.abs(amountSign),
                amount_cf: amountSign,
                date: isoDate,
                source: fileInfo.source,
                status: 'confirmed'
            };
        }).filter(Boolean);

        await supabase.from('transactions').insert(transactions);
        console.log(`✅ ${fileInfo.source}: ${transactions.length} rows`);
    }

    console.log('🏁🏁 ALL DONE!');
}

run().catch(console.error);
