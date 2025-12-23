
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function debugSchema() {
    console.log('🔍 Debugging Schema and data...');

    // 1. Check Transactions columns (by selecting * limit 1)
    const { data: tx, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);
    
    if (txErr) console.error('❌ Tx Select Error:', txErr);
    else if (tx.length > 0) {
        console.log('✅ Transactions table columns:', Object.keys(tx[0]));
    } else {
        console.log('⚠️ Transactions table is empty or inaccessible');
    }

    // 2. Check dev user membership again
    const userEmail = 'dev@example.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const devUser = users.find(u => u.email === userEmail);
    if (!devUser) return console.log('User not found');

    const { data: memberships } = await supabase
        .from('couple_members')
        .select('*, couples(*)')
        .eq('user_id', devUser.id);
    
    console.log('🔗 Memberships:', JSON.stringify(memberships, null, 2));

    // 3. Test RLS Emulation (Simulate user request)
    // We can't simulate exact 400 bad request logic here easily without a real client key,
    // but knowing the columns is 90% of the battle.
}

debugSchema().catch(console.error);
