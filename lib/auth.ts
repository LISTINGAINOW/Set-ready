import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = '/tmp';
const USERS_FILE = join(DATA_DIR, 'users.json');
const STATIC_SALT = 'discreet-set-static-salt';

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
  const hash = createHash('sha256');
  hash.update(password + STATIC_SALT);
  return hash.digest('hex');
}

function normalizeUser(user: any): UserRecord {
  return {
    ...user,
    emailVerified: Boolean(user.emailVerified),
    verificationToken: user.verificationToken,
    verificationSentAt: user.verificationSentAt,
  };
}

export function readUsers(): UserRecord[] {
  if (!existsSync(USERS_FILE)) {
    const seedPath = join(process.cwd(), 'data', 'users.json');
    if (existsSync(seedPath)) {
      const seedData = readFileSync(seedPath, 'utf-8');
      const users = JSON.parse(seedData).map(normalizeUser);
      writeUsers(users);
      return users;
    }
    return [];
  }

  const data = readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data).map(normalizeUser);
}

export function writeUsers(users: UserRecord[]) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function sanitizeUser(user: UserRecord) {
  const { passwordHash, verificationToken, ...safeUser } = user;
  return safeUser;
}
