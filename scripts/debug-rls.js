
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

async function debugRLS() {
    console.log('🔍 Debugging RLS for dev@example.com');

    // 1. Get User ID
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const devUser = users.find(u => u.email === 'dev@example.com');
    if (!devUser) {
        console.error('❌ User not found');
        return;
    }
    console.log(`👤 User ID: ${devUser.id}`);

    // 2. Get Couple Membership
    const { data: memberships, error: memErr } = await supabase
        .from('couple_members')
        .select('*, couples(*)')
        .eq('user_id', devUser.id);
    
    if (memErr) console.error('❌ Mem Error:', memErr);
    console.log('🔗 Memberships:', JSON.stringify(memberships, null, 2));

    if (!memberships || memberships.length === 0) {
        console.warn('⚠️ User has NO memberships! This explains the 403.');
        return;
    }

    const coupleId = memberships[0].couple_id;

    // 3. Check Transactions count for this couple
    const { count, error: txErr } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId);
    
    if (txErr) console.error('❌ Tx Error:', txErr);
    console.log(`📊 Transactions for couple ${coupleId}: ${count}`);

    // 4. Test RLS Emulation (if possible, hard with service key)
    // We can't easily emulate RLS with service key, but the data above proves if the link EXISTS physically.
}

debugRLS().catch(console.error);
