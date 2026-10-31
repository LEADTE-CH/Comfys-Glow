import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this migration.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const sourceFile = resolve(process.cwd(), process.env.LEGACY_DB_FILE || 'data/db.json');
const legacy = JSON.parse(await readFile(sourceFile, 'utf8'));

function assertNoError(error) {
  if (error) throw new Error(error.message);
}

async function findOrCreateAuthUser(user) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  assertNoError(error);
  const found = data.users.find((candidate) => candidate.email?.toLowerCase() === user.email.toLowerCase());
  if (found) return found;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: randomBytes(32).toString('base64url'),
    email_confirm: true,
    user_metadata: { migrated_profile: true },
  });
  assertNoError(createError);
  if (!created.user) throw new Error(`Supabase did not create an auth account for legacy profile ${user.id}.`);
  return created.user;
}

const legacyUsers = legacy.users || [];
for (const legacyUser of legacyUsers) {
  const authUser = await findOrCreateAuthUser(legacyUser);
  const { passwordHash: _passwordHash, ...safeUser } = legacyUser;
  const profile = {
    ...safeUser,
    email: authUser.email || legacyUser.email.toLowerCase(),
    wishlist: legacyUser.wishlist || [],
    recentlyViewed: legacyUser.recentlyViewed || [],
  };
  const { error } = await supabase.from('profiles').upsert(
    {
      auth_user_id: authUser.id,
      legacy_id: legacyUser.id,
      email: profile.email.toLowerCase(),
      role: legacyUser.role === 'admin' ? 'admin' : 'customer',
      data: profile,
    },
    { onConflict: 'auth_user_id' }
  );
  assertNoError(error);
}

const recordGroups = [
  ['products', legacy.products || []],
  ['orders', legacy.orders || []],
  ['delivery_zones', legacy.deliveryZones || []],
  ['reviews', legacy.reviews || []],
  ['contact_messages', legacy.contactMessages || []],
  ['email_notifications', legacy.emailNotifications || []],
  ['settings', legacy.settings ? [{ ...legacy.settings, id: 'global' }] : []],
];

let migratedRecords = 0;
for (const [kind, records] of recordGroups) {
  if (!records.length) continue;
  const rows = records.map((data) => ({
    kind,
    id: data.id,
    lookup:
      kind === 'products'
        ? data.slug
        : kind === 'orders'
          ? data.reference
          : null,
    data,
  }));
  const { error } = await supabase.from('app_records').upsert(rows, { onConflict: 'kind,id' });
  assertNoError(error);
  migratedRecords += rows.length;
}

console.log(`Migrated ${legacyUsers.length} account profiles and ${migratedRecords} application records.`);
console.log('Legacy password hashes were not imported. Use Supabase Auth password recovery to set new passwords.');
