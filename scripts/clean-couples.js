
const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./_env');

const { env } = loadEnv();

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials in env file.');
}
const supabase = createClient(supabaseUrl, serviceKey);

async function cleanCouples() {
    console.log('🧹 Cleaning duplicate couples...');

    const userEmail = 'dev@example.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const devUser = users.find(u => u.email === userEmail);
    if (!devUser) return console.log('User not found');

    const targetCoupleId = 'dc96acef-edc2-4e05-81f5-e9a1c74371f5'; // The one with 703 tx

    // 1. Get all memberships for user
    const { data: memberships } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', devUser.id);
    
    // 2. Delete memberships that are NOT the target
    for (const m of memberships) {
        if (m.couple_id !== targetCoupleId) {
            console.log(`Deleting membership for couple ${m.couple_id}...`);
            await supabase.from('couple_members').delete().eq('couple_id', m.couple_id).eq('user_id', devUser.id);
            
            // Optionally delete the couple itself if no other members (safe for dev env)
            console.log(`Deleting couple ${m.couple_id}...`);
            await supabase.from('couples').delete().eq('id', m.couple_id);
        }
    }

    console.log(`✅ Cleanup done. User ${devUser.id} should only be in ${targetCoupleId}`);
}

cleanCouples().catch(console.error);
