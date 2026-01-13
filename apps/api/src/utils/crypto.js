import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token) {
  // Simple hash for token storage
  // In production, use crypto.createHash
  return Buffer.from(token).toString('base64');
}
