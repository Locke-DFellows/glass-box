'use client';

import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '@/store/useEditorStore';

/**
 * Canvas: Main editor rendering component
 * 
 * Renders each block as a contentEditable div with professional styling.
 * Tracks session ID for audit logging and academic integrity verification.
 */
export const Canvas: React.FC = () => {
  /**
   * Mounted state for hydration safety
   * 
   * Prevents hydration mismatch (server renders empty, client renders with UUIDs).
   * We don't render interactive blocks until we're safely in the browser.
   * 
   * Problem: uuidv4() generates different IDs on server vs. client.
   * If server renders ID-A but client renders ID-B, Next.js warns about mismatch.
   * 
   * Solution: Server renders { hasMounted: false, sessionId: '' }
   * Client updates via useLayoutEffect with { hasMounted: true, sessionId: uuid }
   */
  const [mount, setMount] = useState({
    hasMounted: false,
    sessionId: '',
  });

  const { blocks, updateBlock, addBlock, deleteBlock, lastAddedId } =
    useEditorStore();

  /**
   * Debounce timeout ref (inspired by lumina-editor's 2-second debounce)
   * 
   * Prevents excessive Zustand updates during rapid typing.
   * Instead of updating on every keystroke, batches changes into groups.
   * 
   * Why debounce?
   * - Reduces Zustand subscriber notifications
   * - Reduces unnecessary re-renders
   * - Reduces SyncProvider's change detection cycles
   * - Still feels real-time to the user (2000ms is imperceptible)
   * - Saves bandwidth by batching server syncs
   * 
   * Debounce time: 2000ms (matches lumina-editor approach)
   * This batches multiple edits into one Zustand update.
   */
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Circular update prevention ref
   * 
   * When syncing content from external sources (e.g., collaborative updates),
   * we update the contentEditable element's innerText directly.
   * This would normally trigger a handleBlockInput call (infinite loop).
   * 
   * isInternalChange flag prevents this:
   * - Set to true before making an external update
   * - handleBlockInput skips Zustand updates when this is true
   * - Set back to false after the update completes
   * 
   * This pattern (from lumina-editor) is essential for canvas-based editors
   * where both React state and DOM state must stay in sync.
   */
  const isInternalChangeRef = useRef<boolean>(false);

  /**
   * Hydration Safety: Generate sessionId only in the browser
   * 
   * INTENTIONAL PATTERN: setState in useLayoutEffect for mount initialization
   * 
   * This is a standard React pattern where:
   * - useLayoutEffect runs synchronously after hydration, before paint
   * - setState is called to initialize component state from browser resources
   * - This does NOT cause cascading renders because it runs once per mount
   * - There are no dependencies, so no render cycles occur
   * 
   * Pylance Warning: Pylance warns about setState in effects to prevent cascading
   * renders. However, this is a mount-time initialization effect that synchronizes
   * with an external system (browser UUID generation), which is an approved use case
   * per React documentation.
   * 
   * This pattern is correct and performant. The Pylance warning is overly cautious.
   * See: https://react.dev/learn/synchronizing-with-effects#effects-depend-on-nothing
   */
  useLayoutEffect(() => {
    // Generate sessionId only in the browser (not on server)
    const newSessionId = uuidv4();
    
    // INTENTIONAL: setState in effect for mount initialization
    // This synchronizes React state with browser resources (UUID generation)
    setMount({
      hasMounted: true,
      sessionId: newSessionId,
    });
    
    console.log(`[Audit] Glass Box Session Started: ${newSessionId}`);
    // Example future implementation:
    // await supabase.from('audit_sessions').insert({
    //   session_id: newSessionId,
    //   user_id: getCurrentUserId(),
    //   started_at: new Date().toISOString(),
    // });
  }, []);

  /**
   * Focus Manager: Auto-focus newly created blocks
   * 
   * When a new block is added via the addBlock action, the Zustand store
   * sets lastAddedId to signal the UI that a new block needs focus.
   * 
   * This useEffect watches lastAddedId and:
   * 1. Finds the DOM element for the newly created block (using data-block-id)
   * 2. Calls .focus() on it
   * 3. Positions the cursor at the END of the block (not the beginning)
   * 4. Uses the Range API for cross-browser compatibility
   * 
   * The "Signal" Pattern:
   * - Decouples Logic (adding a block) from UI (focusing it)
   * - Prevents race conditions from trying to focus before DOM updates
   * - Keeps component code clean and testable
   * 
   * Why Range.collapse(false)?
   * - true = collapse to start (cursor at beginning)
   * - false = collapse to end (cursor at end)
   * - This is critical for the "Notes" feel: hitting Enter should let you type immediately
   */
  useEffect(() => {
    if (lastAddedId) {
      // Use a small timeout to ensure the DOM has been painted
      const timeoutId = setTimeout(() => {
        // 1. Find the element by our custom data attribute
        const element = document.querySelector(
          `[data-block-id="${lastAddedId}"]`
        ) as HTMLElement;

        if (element) {
          // 2. Focus the element
          element.focus();

          // 3. Position cursor at the end of the block
          const range = document.createRange();
          const selection = window.getSelection();

          // selectNodeContents copies all content from the element
          range.selectNodeContents(element);

          // collapse(false) means "move to end"
          // collapse(true) would move to beginning
          range.collapse(false);

          // Clear any existing ranges and apply the new one
          selection?.removeAllRanges();
          selection?.addRange(range);

          console.log(
            `[Focus Manager] Focused newly created block: ${lastAddedId}`
          );
        }
      }, 0);

      // Cleanup: clear timeout if component unmounts before focus completes
      return () => clearTimeout(timeoutId);
    }
  }, [lastAddedId]);

  /**
   * Handle text input on a contentEditable block (with debouncing)
   * 
   * @param blockId - ID of the block being edited
   * @param text - New text content from contentEditable innerText
   * 
   * Flow:
   * 1. Skip if this is an internal/external change (prevent circular updates)
   * 2. Debounce the Zustand update by 2 seconds
   * 3. Eventually: Emit event for sync engine (captureEvent logic)
   * 
   * Why innerText instead of textContent?
   * - innerText respects visible text layout and rendering
   * - textContent would include hidden text and script tag content
   * - Security: Plain text only; HTML tags become literal characters
   * 
   * Debouncing (inspired by lumina-editor):
   * - Batches rapid typing into single Zustand updates
   * - Reduces re-renders and SyncProvider change detection
   * - Still feels real-time (2s is imperceptible to user)
   * - Saves server bandwidth by batching syncs
   */
  const handleBlockInput = useCallback((blockId: string, text: string) => {
    // Security: Skip if this update came from an external source (circular update prevention)
    if (isInternalChangeRef.current) {
      console.log(
        `[Session ${mount.sessionId}] Skipped circular update for block ${blockId}`
      );
      return;
    }

    // Clear existing debounce timer if user is still typing
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the update: wait 2 seconds after user stops typing
    debounceTimeoutRef.current = setTimeout(() => {
      // Now update the store with all accumulated changes
      updateBlock(blockId, text);

      // Log for audit trail
      console.log(
        `[Session ${mount.sessionId}] Block ${blockId} debounced update: "${text}"`
      );

      // TODO: Implement captureEvent to queue this change for Supabase sync
      // captureEvent({
      //   event_type: 'block_updated',
      //   block_id: blockId,
      //   session_id: mount.sessionId,
      //   content: text,
      //   timestamp: Date.now(),
      // });
    }, 2000); // 2 second debounce (matches lumina-editor)
  }, [updateBlock, mount.sessionId]);

  /**
   * Handle keyboard events on contentEditable blocks
   * 
   * Intercepts Enter and Backspace to prevent browser's default rich-text behavior
   * and implement clean, predictable block management.
   * 
   * Enter Key:
   * - Creates a new paragraph block after the current block
   * - Prevents default browser <br> or <div> insertion
   * - New block appears at index + 1 (exactly where user expects)
   * 
   * Backspace Key (on empty block):
   * - Deletes the current block if content is completely empty
   * - Prevents empty block bloat in database
   * - Only deletes if blocks.length > 1 (never delete last block)
   * 
   * @param e - React keyboard event
   * @param index - Index of the current block in blocks array
   * 
   * Security: Clean data principle—every block stored is a clean string,
   * no messy HTML tags. Makes it easy for AI/analysis tools to parse later.
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    // Handle Enter key: create new paragraph
    if (e.key === 'Enter') {
      // Prevent browser's default rich-text editing behavior
      e.preventDefault();

      // Tell Zustand store to insert new paragraph at index + 1
      addBlock('p', index + 1);

      // Log the intention for now; later will tie to captureEvent
      console.log(
        `[Session ${mount.sessionId}] User created new block at index ${index + 1}`
      );

      // TODO: Implement auto-focus to newly created block
      // This will require a ref or setTimeout to wait for DOM update
    }

    // Handle Backspace key: delete empty block to prevent bloat
    if (e.key === 'Backspace' && e.currentTarget.innerText === '') {
      // Only delete if:
      // 1. Block is empty (innerText === '')
      // 2. Document has more than one block (never delete the last block)
      if (blocks.length > 1) {
        e.preventDefault();

        // Stop propagation to prevent any default behavior
        e.stopPropagation();

        // Delete the empty block by its ID
        deleteBlock(blocks[index].id);

        console.log(
          `[Session ${mount.sessionId}] Deleted empty block: ${blocks[index].id}`
        );
      }
    }
  };

  /**
   * Cleanup: Clear debounce timer on unmount
   * 
   * Prevents memory leaks and stale closures.
   * Also clears the circular update prevention flag.
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      isInternalChangeRef.current = false;
    };
  }, []);

  /**
   * Hydration Guard: Don't render interactive blocks until mounted
   * 
   * Before the browser mounts the component, we return a simple loading skeleton.
   * This ensures the server-rendered HTML matches the client-rendered HTML.
   * 
   * Why?
   * - Server has no sessionId (empty string initially)
   * - Client would generate a sessionId in useEffect
   * - Without this guard, server/client HTML would differ
   * - React would warn: "did not match. Server: ... Client: ..."
   * 
   * By returning a matching skeleton, we look identical to the server until
   * the component is truly interactive.
   */
  if (!mount.hasMounted) {
    return (
      <div className="Canvas_LoadingSkeleton_1" />
    );
  }

  return (
    <div className="Canvas_Container_1">
      {/* Editable blocks container */}
      <div className="Canvas_BlocksContainer_1">
        {/* Render all blocks */}
        {blocks.map((block, index) => (
        <div
          key={block.id}
          contentEditable
          suppressContentEditableWarning={true}
          className="Canvas_ContentBlock_1"
          onInput={(e) => {
            const text = e.currentTarget.innerText;
            handleBlockInput(block.id, text);
          }}
          onKeyDown={(e) => handleKeyDown(e, index)}
          data-block-id={block.id}
          role="textbox"
          aria-label={`Editable ${block.type} block`}
        >
          {block.content}
        </div>
      ))}

        {/* Debug: Show current session (remove in production) */}
        {/* Both values are set together in mount state after hydration */}
        {mount.hasMounted && (
          <div className="Canvas_DebugInfo_1">
            <p>Session ID: {mount.sessionId || 'initializing...'}</p>
            <p>Blocks: {blocks.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
