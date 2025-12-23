
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

async function debugSchemaMore() {
    console.log('🔍 Debugging Categories and Accounts...');

    // 1. Categories
    const { data: cat, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
    
    if (catErr) console.error('❌ Cat Select Error:', catErr);
    else if (cat.length > 0) {
        console.log('✅ Categories columns:', Object.keys(cat[0]));
    } else {
        console.log('⚠️ Categories table is empty or inaccessible');
    }

    // 2. Accounts
    const { data: acc, error: accErr } = await supabase
        .from('accounts')
        .select('*')
        .limit(1);
    
    if (accErr) console.error('❌ Acc Select Error:', accErr);
    else if (acc.length > 0) {
        console.log('✅ Accounts columns:', Object.keys(acc[0]));
    } else {
        console.log('⚠️ Accounts table is empty or inaccessible');
    }
}

debugSchemaMore().catch(console.error);
