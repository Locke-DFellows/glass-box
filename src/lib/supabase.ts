/**
 * Supabase Client Configuration
 * 
 * This module initializes the Supabase client that connects to the backend database.
 * It's used by the Sync Engine to persist document state.
 * 
 * Architecture:
 * - Singleton pattern: One client instance shared across the app
 * - Environment variables loaded at build time
 * - Non-null assertion (!) ensures early crashes if credentials are missing
 * 
 * Security Considerations:
 * - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are intentionally public
 *   (anon key is meant for client-side access via RLS policies)
 * - RLS (Row-Level Security) policies on Supabase tables MUST enforce data access rules
 * - Never store sensitive secrets here; use server-only environment variables
 * - All database writes should include user_id validation via RLS
 * - Implement rate limiting to prevent abuse of public endpoints
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase URL and Anon Key from environment
 * 
 * Non-null assertion (!) means:
 * - If these env vars don't exist, TypeScript type error at build time
 * - If they exist but are undefined, runtime error on createClient()
 * 
 * This "fail fast" approach is better than failing silently with undefined values
 * that cause cryptic errors later in the sync process.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Singleton Supabase client instance
 * 
 * Used throughout the app to:
 * - Sync document blocks to the database
 * - Query user's past documents
 * - Subscribe to real-time updates (if implemented)
 * 
 * All database operations must respect RLS policies that check user_id
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
