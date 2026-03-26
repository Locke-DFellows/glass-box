/**
 * Sync Provider - The "Heartbeat" Sync Engine
 * 
 * This provider watches the Zustand editor store and periodically syncs
 * document state to Supabase. It's the bridge between the local state
 * and the persistent backend.
 * 
 * Responsibilities:
 * - Watch the blocks array in Zustand store
 * - Detect changes using JSON.stringify comparison
 * - Send document state to Supabase every 10 seconds (if changed)
 * - Prevent concurrent sync requests
 * - Handle network errors gracefully
 * 
 * Architecture:
 * - SyncProvider is a wrapper component; it passes children through
 * - Uses side effects (useEffect) to run the sync loop independently
 * - Decoupled from Canvas; can be applied to any editor instance
 * 
 * Database Schema Expected:
 * documents table:
 * - id (UUID, primary key)
 * - content (JSONB) - the blocks array
 * - updated_at (timestamp)
 * - user_id (UUID) - who owns this document
 * - created_at (timestamp)
 * 
 * Security Considerations:
 * - docId is passed as a prop; server should validate user owns this doc
 * - Supabase RLS policies MUST enforce user_id checks on the documents table
 * - Content is sent as JSON; SQL injection impossible with Supabase client
 * - Never trust the client's timestamps; use database-generated updated_at
 * - TODO: Implement conflict resolution for concurrent edits
 * - TODO: Add cryptographic hashing to detect integrity issues on sync
 */

'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { supabase } from '@/lib/supabase';

/**
 * SyncProvider: Watches editor state and syncs to Supabase
 * 
 * @param children - Child components (typically Canvas)
 * @param docId - The document ID to sync to
 * 
 * This component doesn't render anything visible; it's purely side-effects.
 * All the "work" happens in the useEffect hook below.
 */
export function SyncProvider({
  children,
  docId,
}: {
  children: React.ReactNode;
  docId: string;
}) {
  // Get the blocks array from Zustand
  // Using selector to only re-subscribe when blocks change
  const blocks = useEditorStore((state) => state.blocks);

  /**
   * Traffic Light for concurrent syncs
   * 
   * If a sync is in progress and the 10-second timer fires again,
   * we check this flag and skip the sync. This prevents:
   * - Multiple upsert requests fighting each other
   * - Wasting bandwidth on slow connections
   * - Race conditions in the database
   */
  const isSyncing = useRef<boolean>(false);

  /**
   * Last known good sync state
   * 
   * We stringify the blocks array and store it.
   * On the next sync interval, we compare the current JSON to this.
   * If they're identical, skip the network request.
   * 
   * Why JSON.stringify and not deep equality check?
   * - JSON.stringify is fast and simple
   * - It's deterministic (same input = same output)
   * - Works for our plain-object block structure
   * - Fewer CPU cycles than deep comparison
   */
  const lastSyncedContent = useRef<string>(JSON.stringify(blocks));

  useEffect(() => {
    /**
     * The Sync Function
     * 
     * This runs every 10 seconds if there are changes to sync.
     * It's async because network requests take time.
     */
    const sync = async () => {
      // 1. OPTIMIZATION: Check if content actually changed
      const currentContent = JSON.stringify(blocks);

      // If nothing changed since last sync, skip the network call
      if (currentContent === lastSyncedContent.current) {
        console.log(
          '[Sync] No changes detected; skipping sync to Supabase'
        );
        return;
      }

      // 2. SAFETY: Check if a sync is already in progress
      // If so, skip this cycle (the previous sync will catch the latest changes)
      if (isSyncing.current) {
        console.log(
          '[Sync] Sync already in progress; skipping this cycle'
        );
        return;
      }

      // 3. SET THE TRAFFIC LIGHT: Mark that we're syncing
      isSyncing.current = true;

      try {
        console.log('[Sync] Sending document state to Supabase...');

        // 4. THE UPSERT: Send blocks array to Supabase
        // 
        // Choice: "update" not "insert"
        // - update: Overwrites the current state (we want the "latest" version)
        // - insert: Would fail if doc already exists (we don't want that)
        // - upsert: Would require INSERT into ... ON CONFLICT, more complex
        //
        // For "current state," update is correct.
        // For "provenance events," we'd use insert (next step).
        const { error } = await supabase
          .from('documents')
          .update({
            // Supabase client automatically handles JSONB serialization
            // The blocks array is serialized as JSON in the database
            content: blocks,

            // Server-side timestamp: Never trust client time
            // Using database-generated timestamp prevents clock skew attacks
            updated_at: new Date().toISOString(),
          })
          .eq('id', docId);

        // 5. ERROR HANDLING
        if (error) {
          // Log the error but don't crash; let the next sync try again
          console.error('[Sync] Supabase update failed:', error.message);
          return; // Exit early; don't update lastSyncedContent
        }

        // 6. SUCCESS: Update our "last known good" reference
        lastSyncedContent.current = currentContent;

        console.log(
          `[Sync] ✅ Document synced successfully. Blocks: ${blocks.length}`
        );
      } catch (err) {
        // Network errors, parsing errors, etc.
        console.error('[Sync] Unexpected error during sync:', err);
        // Don't update lastSyncedContent; let next sync try again
      } finally {
        // 7. RELEASE THE TRAFFIC LIGHT
        isSyncing.current = false;
      }
    };

    // 8. THE HEARTBEAT: Run sync every 10 seconds
    // 
    // Why 10 seconds?
    // - Fast enough to feel real-time (student sees "saved" quickly)
    // - Slow enough to batch multiple edits into one sync
    // - Saves on database writes and bandwidth
    // - Reduces server load
    //
    // In production, this could be configurable or adaptive
    // (faster on good WiFi, slower on slow connections)
    const interval = setInterval(sync, 10000);

    // 9. CLEANUP: Clear interval when component unmounts
    // or when docId changes
    return () => clearInterval(interval);
  }, [blocks, docId]);

  // Provider just wraps children; it doesn't render anything itself
  return <>{children}</>;
}
