/**
 * Editor Canvas Component
 * 
 * Renders the editable document surface based on the blocks array from useEditorStore.
 * This is the main UI that users interact with for content editing.
 * 
 * Session Tracking:
 * - Each editor instance generates a unique sessionId via useRef
 * - sessionId persists for the lifetime of the mounted component
 * - Used to group edits into "work sessions" for audit trail and academic integrity checks
 * - Timestamps between sessions reveal breaks; detects suspicious bursts of output
 * 
 * Keyboard Handling:
 * - Enter: Creates new paragraph block at current_index + 1 (prevents browser <br> insertion)
 * - Backspace (empty block): Deletes block to prevent empty block bloat in database
 * - All keyboard behavior is intercepted with e.preventDefault() for total control
 * 
 * Design Philosophy:
 * - Minimal, distraction-free interface inspired by Apple Notes
 * - contentEditable divs for each block enable native text editing
 * - Tailwind CSS for consistent, responsive styling
 * - Block type (p, h1, h2, li) determines visual hierarchy
 * 
 * Performance:
 * - useRef (not useState) for sessionId to prevent unnecessary re-renders
 * - Changing sessionId on re-mount shouldn't flicker cursor position
 * 
 * "Clean Data" Principle:
 * - Every block stored is a clean string with no HTML tags or rich-text artifacts
 * - Makes it trivial for AI/analysis tools to parse documents later
 * - No messy <br>, <div>, or formatting tags to decode
 * 
 * Security:
 * - Content is displayed as plain text within contentEditable divs (HTML tags are text, not rendered)
 * - User input is captured via onInput handler and stored in state as plain strings
 * - XSS prevention: contentEditable divs cannot execute scripts; dangerous content is text-only
 * - sessionId is not sensitive but should be validated server-side against user_id via RLS
 * - TODO: Send session_start events to Supabase for audit trail tracking
 * - TODO: Implement content sanitization before any server sync or persistence
 */

'use client';

import React, { useEffect, useState } from 'react';
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
   * Solution: Don't generate sessionId on server. Wait until useEffect (browser only).
   */
  const [hasMounted, setHasMounted] = useState(false);

  // Generate a unique session ID on component mount
  // Stored in state (not ref) so it's safe to render
  // Start empty; will be populated in useEffect (browser only)
  const [sessionId, setSessionId] = useState<string>('');

  const { blocks, updateBlock, addBlock, deleteBlock, lastAddedId } =
    useEditorStore();

  /**
   * Hydration Safety: Generate sessionId only in the browser
   * 
   * This useEffect runs ONLY after the component is hydrated in the browser.
   * By this time, Zustand has been populated from the server, and we're safe
   * to create browser-only resources like UUIDs.
   * 
   * This also signals that React is ready to render interactive elements.
   */
  useEffect(() => {
    // Generate sessionId only in the browser (not on server)
    setSessionId(uuidv4());
    
    // Tell React the component is mounted and safe to render
    setHasMounted(true);
    
    console.log(`[Audit] Glass Box Session Started: ${sessionId}`);
    // Example future implementation:
    // await supabase.from('audit_sessions').insert({
    //   session_id: sessionId,
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
   * Handle text input on a contentEditable block
   * 
   * @param blockId - ID of the block being edited
   * @param text - New text content from contentEditable innerText
   * 
   * Flow:
   * 1. Update the local "Source of Truth" (Zustand store)
   * 2. Eventually: Emit event for sync engine (captureEvent logic)
   * 
   * Why innerText instead of textContent?
   * - innerText respects visible text layout and rendering
   * - textContent would include hidden text and script tag content
   * - Security: Plain text only; HTML tags become literal characters
   */
  const handleBlockInput = (blockId: string, text: string) => {
    // Update local state
    updateBlock(blockId, text);

    // Log for now; later this will trigger captureEvent for sync engine
    // Future: This event will include sessionId for grouping edits
    console.log(
      `[Session ${sessionId}] Block ${blockId} updated: "${text}"`
    );

    // TODO: Implement captureEvent to queue this change for Supabase sync
    // captureEvent({
    //   event_type: 'block_updated',
    //   block_id: blockId,
    //   session_id: sessionId,
    //   content: text,
    //   timestamp: Date.now(),
    // });
  };

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
        `[Session ${sessionId}] User created new block at index ${index + 1}`
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
          `[Session ${sessionId}] Deleted empty block: ${blocks[index].id}`
        );
      }
    }
  };

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
  if (!hasMounted) {
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
        {/* Store sessionId in state so it can be safely rendered */}
        {hasMounted && (
          <div className="Canvas_DebugInfo_1">
            <p>Session ID: {sessionId || 'initializing...'}</p>
            <p>Blocks: {blocks.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
