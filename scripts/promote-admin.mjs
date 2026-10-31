import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before running this script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const targetEmail = (process.argv[2] || 'clementcomfort@gmail.com').toLowerCase().trim();

async function promoteAdmin() {
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', targetEmail)
    .maybeSingle();

  if (findError) {
    console.error('Error searching profile:', findError.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`Profile with email "${targetEmail}" was not found in Supabase profiles.`);
    process.exit(1);
  }

  const updatedData = { ...profile.data, role: 'admin' };
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', data: updatedData })
    .eq('auth_user_id', profile.auth_user_id);

  if (updateError) {
    console.error('Error updating profile to admin:', updateError.message);
    process.exit(1);
  }

  console.log('--------------------------------------------------');
  console.log(' ✅ User Promoted to Administrator Successfully!');
  console.log('--------------------------------------------------');
  console.log(` Email: ${targetEmail}`);
  console.log(` Name:  ${profile.data?.fullName || 'N/A'}`);
  console.log(' Role:  admin');
  console.log('--------------------------------------------------');
}

promoteAdmin();
