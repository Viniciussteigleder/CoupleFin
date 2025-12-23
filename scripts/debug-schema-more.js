
const { createClient } = require('@supabase/supabase-js');
const { loadEnv } = require('./_env');

const { env } = loadEnv();

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials in env file.');
}
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
