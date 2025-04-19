import { createHash } from 'crypto';

/**
 * Converts an Auth0 user ID to a valid UUID v5
 * This is needed because Auth0 IDs are in the format 'auth0|1234567890'
 * which is not a valid UUID, but our Supabase schema expects UUIDs
 * 
 * @param auth0Id The Auth0 user ID (e.g., 'auth0|1234567890')
 * @returns A valid UUID v5 derived from the Auth0 ID
 */
export function auth0IdToUuid(auth0Id: string): string {
  // Define a namespace for our UUIDs (using a random UUID)
  const NAMESPACE = '9f9b2131-d4d9-4c04-8a0c-b1d0fd064abe';
  
  // Convert namespace to Buffer
  const namespaceBytes = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  
  // Convert name to Buffer
  const nameBytes = Buffer.from(auth0Id);
  
  // Create a hash of the namespace concatenated with the name
  const hash = createHash('sha1')
    .update(Buffer.concat([namespaceBytes, nameBytes]))
    .digest();
  
  // Set the version (5) and variant bits
  hash[6] = (hash[6] & 0x0f) | 0x50; // Version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // Variant 1
  
  // Convert to UUID string format
  const uuid = [
    hash.slice(0, 4).toString('hex'),
    hash.slice(4, 6).toString('hex'),
    hash.slice(6, 8).toString('hex'),
    hash.slice(8, 10).toString('hex'),
    hash.slice(10, 16).toString('hex'),
  ].join('-');
  
  return uuid;
}

/**
 * Stores a mapping between Auth0 IDs and their corresponding UUIDs
 * This is useful for debugging and for maintaining the relationship
 */
export const auth0IdMapping: Record<string, string> = {};
