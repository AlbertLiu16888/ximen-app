/**
 * Password validation using SHA-256 hash.
 * Actual passwords are NEVER stored in source code.
 * Only their hashed values are kept for comparison.
 */

// Pre-computed SHA-256 hashes for each mission's password
// To update: run hashPassword('new_password') in console and replace the hash
const MISSION_HASHES = {
  1:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  2:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  3:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  4:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  5:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  6:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  7:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  8:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  9:  '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
  10: '829f00a11ddfdebb51b67a913981eddb7937c3f8f01f4140415a24ff1cc29609',
};

/**
 * Hash a string using SHA-256 (async, uses Web Crypto API)
 */
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a password for a given mission ID
 * @param {number} missionId
 * @param {string} input - user's password attempt
 * @returns {Promise<boolean>}
 */
export async function validatePassword(missionId, input) {
  const expected = MISSION_HASHES[missionId];
  if (!expected) return false;
  const hashed = await sha256(input.trim());
  return hashed === expected;
}

/**
 * Utility: generate hash for a new password (for admin use in dev console)
 * Usage: import { hashPassword } from './passwordGuard'; hashPassword('mypass');
 */
export async function hashPassword(password) {
  const hash = await sha256(password);
  console.log(`Password: "${password}" → Hash: "${hash}"`);
  return hash;
}
