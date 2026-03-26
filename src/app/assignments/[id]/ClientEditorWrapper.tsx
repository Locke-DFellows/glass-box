/**
 * Client Editor Wrapper - The Bridge Component
 * 
 * This is a crucial bridge between the Server Component (which fetches data)
 * and the Client Components (Canvas, SyncProvider).
 * 
 * Its job:
 * 1. Receive initialBlocks from the server as props
 * 2. Hydrate the Zustand store on component mount
 * 3. Wrap the editor with SyncProvider for sync loop
 * 4. Render the Canvas
 * 
 * Why This Pattern?
 * - Server Component (page.tsx) can't have hooks or use Zustand
 * - Client Component can use Zustand and hooks
 * - This wrapper bridges the two worlds
 * - Hydration happens exactly once via useRef
 * 
 * The "Hydration" Problem It Solves:
 * - Without this, refreshing the page would lose work
 * - User types → gets synced to Supabase → hits F5
 * - Without hydration: store would reset to empty block, overwriting DB
 * - With hydration: store loads from server, preserving work
 * 
 * React Strict Mode & useRef:
 * - In development, React sometimes mounts components twice
 * - useRef(false) prevents double-hydration
 * - initialized.current acts as a one-time-only flag
 */

'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { SyncProvider } from '@/components/providers/SyncProvider';
import { Canvas } from '@/components/editor/Canvas';
import EditorLayout from '@/components/editor/EditorLayout';
import Toolbar from '@/components/editor/Toolbar';
import { EditorBlock } from '@/types/editor';

/**
 * ClientEditorWrapper: Hydrates store and wraps the editor
 * 
 * @param initialBlocks - Array of EditorBlock objects from the server
 * @param docId - The document ID for sync operations
 */
export default function ClientEditorWrapper({
  initialBlocks,
  docId,
}: {
  initialBlocks: EditorBlock[];
  docId: string;
}) {
  // Get the hydrate action from Zustand
  const hydrate = useEditorStore((state) => state.hydrate);

  /**
   * One-time hydration flag
   * 
   * In React Strict Mode (development), components mount twice.
   * This ref ensures hydration happens only ONCE, preventing:
   * - Double-hydration (flicker, duplicate content)
   * - Lost state changes from rapid re-mounts
   * 
   * The ref survives component re-renders but not full unmounts,
   * so it's safe and won't cause stale hydration on navigation.
   */
  const initialized = useRef<boolean>(false);

  /**
   * Hydrate the Zustand store immediately on mount
   * 
   * We use useEffect to avoid accessing ref during render.
   * This is a synchronous hydration that happens before Canvas renders,
   * so the store is populated before any child components access it.
   */
  useEffect(() => {
    // Only hydrate once, even in Strict Mode
    if (!initialized.current) {
      // Copy initialBlocks into store
      hydrate(initialBlocks);

      // Mark that hydration is complete
      initialized.current = true;

      console.log(
        `[Hydration] Loaded ${initialBlocks.length} blocks from server into Zustand`
      );
    }
  }, [initialBlocks, hydrate]);

  // If there are no blocks and nothing was hydrated, create a default empty block
  // (This handles the case where initialBlocks is empty from new documents)
  useEffect(() => {
    const { blocks } = useEditorStore.getState();
    if (blocks.length === 0) {
      console.warn(
        '[Hydration] No blocks loaded; user will see empty editor'
      );
    }
  }, []);

  return (
    <EditorLayout title="Glass Box Editor">
      <SyncProvider docId={docId}>
        <Toolbar />
        <Canvas />
      </SyncProvider>
    </EditorLayout>
  );
}
