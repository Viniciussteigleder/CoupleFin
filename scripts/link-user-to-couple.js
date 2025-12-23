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

async function linkUserToCouple() {
  console.log('🔗 Linking dev user to seeded couple...');

  // 1. Find the dev user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const devUser = users.find(u => u.email === 'dev@example.com');
  
  if (!devUser) {
    console.error('❌ User dev@example.com not found!');
    return;
  }
  
  console.log('✅ Found user:', devUser.id);

  // 2. Find the couple with transactions
  const { data: couples } = await supabase
    .from('couples')
    .select('id, name')
    .order('created_at', { ascending: false });
  
  if (!couples || couples.length === 0) {
    console.error('❌ No couples found!');
    return;
  }

  // Find the couple with the most transactions (likely the seeded one)
  let targetCouple = null;
  for (const couple of couples) {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('couple_id', couple.id);
    
    console.log(`Couple "${couple.name}" (${couple.id}): ${count} transactions`);
    
    if (count && count > 0) {
      targetCouple = couple;
      break;
    }
  }

  if (!targetCouple) {
    console.error('❌ No couple with transactions found!');
    return;
  }

  console.log(`✅ Target couple: "${targetCouple.name}" (${targetCouple.id})`);

  // 3. Link user to couple
  const { error } = await supabase
    .from('couple_members')
    .upsert({
      couple_id: targetCouple.id,
      user_id: devUser.id,
      role: 'admin'
    }, { onConflict: 'couple_id,user_id' });

  if (error) {
    console.error('❌ Error linking:', error.message);
  } else {
    console.log('✅ Successfully linked user to couple!');
    console.log('\n🎉 You can now login with:');
    console.log('   Email: dev@example.com');
    console.log('   Password: password123');
    console.log('\n   The dashboard should show all seeded transactions.');
  }
}

linkUserToCouple().catch(console.error);
