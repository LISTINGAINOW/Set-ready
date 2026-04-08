import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  sessionVersion: number;
  verificationToken?: string;
  verificationSentAt?: string;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: string;
  resetPasswordSentAt?: string;
  createdAt: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function sanitizeUser(user: UserRecord) {
  const { passwordHash, sessionVersion, verificationToken, resetPasswordTokenHash, ...safeUser } = user;
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
    sessionVersion: Number(row.session_version ?? 1),
    verificationToken: row.verification_token ? String(row.verification_token) : undefined,
    verificationSentAt: row.verification_sent_at ? String(row.verification_sent_at) : undefined,
    resetPasswordTokenHash: row.reset_password_token_hash ? String(row.reset_password_token_hash) : undefined,
    resetPasswordExpiresAt: row.reset_password_expires_at ? String(row.reset_password_expires_at) : undefined,
    resetPasswordSentAt: row.reset_password_sent_at ? String(row.reset_password_sent_at) : undefined,
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

export async function findUserByPasswordResetToken(token: string): Promise<UserRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_password_token_hash', hashAuthToken(token))
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
    session_version: user.sessionVersion,
    verification_token: user.verificationToken ?? null,
    verification_sent_at: user.verificationSentAt ?? null,
    reset_password_token_hash: user.resetPasswordTokenHash ?? null,
    reset_password_expires_at: user.resetPasswordExpiresAt ?? null,
    reset_password_sent_at: user.resetPasswordSentAt ?? null,
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

export async function setUserPasswordResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('users')
    .update({
      reset_password_token_hash: tokenHash,
      reset_password_expires_at: expiresAt,
      reset_password_sent_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: existingUser, error: readError } = await supabase
    .from('users')
    .select('session_version')
    .eq('id', userId)
    .single();

  if (readError || !existingUser) throw new Error(readError?.message || 'User not found');

  const nextSessionVersion = Number(existingUser.session_version ?? 1) + 1;

  const { error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      session_version: nextSessionVersion,
      reset_password_token_hash: null,
      reset_password_expires_at: null,
      reset_password_sent_at: null,
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}
