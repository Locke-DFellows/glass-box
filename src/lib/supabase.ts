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
 * Graceful Fallback Pattern (inspired by lumina-editor):
 * - If env vars are missing, use placeholder values instead of crashing
 * - This allows the app to render with a clear error message
 * - Better UX than a blank white screen or cryptic TypeScript error
 * - Prevents build-time failures that block developers
 * 
 * The app will still function UI-wise, but sync operations will fail gracefully.
 * This helps during development/setup when credentials aren't configured yet.
 * 
 * Security Note: Placeholders are intentionally invalid; Supabase will reject all
 * requests, which is the correct behavior. Never use fake credentials in production.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key_missing';

/**
 * Flag to detect if Supabase is properly configured
 * 
 * Used to display warning messages when credentials are missing.
 * Allows graceful degradation instead of hard failures.
 */
export const isSupabaseConfigured = 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Singleton Supabase client instance
 * 
 * Used throughout the app to:
 * - Sync document blocks to the database
 * - Query user's past documents
 * - Subscribe to real-time updates (if implemented)
 * 
 * All database operations must respect RLS policies that check user_id
 * 
 * If isSupabaseConfigured is false, sync operations will fail gracefully.
 * Check isSupabaseConfigured before assuming sync will succeed.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
