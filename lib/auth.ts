import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/utils/supabase/admin';

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationSentAt?: string;
  createdAt: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function sanitizeUser(user: UserRecord) {
  const { passwordHash, verificationToken, ...safeUser } = user;
  return safeUser;
}

function dbRowToUserRecord(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    emailVerified: Boolean(row.email_verified),
    verificationToken: row.verification_token ? String(row.verification_token) : undefined,
    verificationSentAt: row.verification_sent_at ? String(row.verification_sent_at) : undefined,
    createdAt: String(row.created_at),
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return dbRowToUserRecord(data);
}

export async function createUser(user: UserRecord): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email.toLowerCase(),
    first_name: user.firstName,
    last_name: user.lastName,
    password_hash: user.passwordHash,
    email_verified: user.emailVerified,
    verification_token: user.verificationToken ?? null,
    verification_sent_at: user.verificationSentAt ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function verifyUserEmail(email: string): Promise<UserRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .update({ email_verified: true, verification_token: null, verification_sent_at: null })
    .eq('email', email.toLowerCase())
    .select()
    .maybeSingle();
  if (error || !data) return null;
  return dbRowToUserRecord(data);
}
