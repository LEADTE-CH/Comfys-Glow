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

const newPassword = process.argv[2] || 'AdminGlow2026!';
const targetEmail = process.argv[3] || 'clementcomfort@gmail.com';

async function setPassword() {
  const { data, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const user = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
  if (!user) {
    console.error(`User with email "${targetEmail}" was not found in Supabase Auth.`);
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });

  if (updateError) {
    console.error('Failed to update password:', updateError.message);
    process.exit(1);
  }

  console.log('--------------------------------------------------');
  console.log(' Admin Password Updated Successfully in Supabase!');
  console.log('--------------------------------------------------');
  console.log(` Email:    ${targetEmail}`);
  console.log(` Password: ${newPassword}`);
  console.log(' Role:     admin');
  console.log('--------------------------------------------------');
}

setPassword();
