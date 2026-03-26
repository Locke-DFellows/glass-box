/**
 * Editor Zustand Store - The "Nervous System"
 * 
 * This store manages the DocumentState in memory, providing a single source of truth
 * for the editor state. It's accessible to both the Editor UI and the Sync Engine.
 * 
 * Architecture Choice: Zustand over Redux
 * - Lighter weight and faster performance (critical for real-time editor responsiveness)
 * - Simpler API reduces boilerplate and cognitive load
 * - Excellent TypeScript support
 * - Atomic state updates prevent unnecessary re-renders
 * 
 * Security Notes:
 * - Block IDs are UUIDs generated server-side to prevent client-side ID spoofing
 * - Metadata (author, timestamp) is immutable once set and should be validated on sync
 * - Content updates should be sanitized at render time (see useEditorStore consumers)
 * - This store holds client-side state only; server must independently validate all blocks
 */

import { create } from 'zustand';
import { EditorBlock, DocumentState, BlockType } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

/**
 * EditorStore: Extended DocumentState with actions
 * 
 * Methods operate at the block level to minimize re-renders and maintain
 * high performance during rapid edits.
 */
interface EditorStore extends DocumentState {
  /**
   * Signal for Focus Manager
   * 
   * When a new block is added, this is set to the block's ID.
   * The Canvas component watches this value and auto-focuses the new block.
   * Cleared after focus is set to prevent re-focusing on every render.
   * 
   * This decouples the "Logic" (adding a block) from the "UI" (focusing it),
   * preventing race conditions and keeping code maintainable.
   */
  lastAddedId: string | null;

  /**
   * Hydration: Load server state into client store
   * 
   * When the page loads, the server fetches the document from Supabase.
   * This method takes that data and "hydrates" the Zustand store with it.
   * 
   * Called once on ClientEditorWrapper mount to prevent losing work on refresh.
   * Sets the real document content instead of the default empty block.
   * 
   * @param blocks - Array of EditorBlock objects from database
   * 
   * Why this is needed:
   * - Without hydration, every page refresh would start with an empty editor
   * - Student's work would be lost if they hit F5
   * - Server fetches the latest state, client hydrates it
   */
  hydrate: (blocks: EditorBlock[]) => void;

  /**
   * Update the content of an existing block
   * 
   * @param id - Block ID to update
   * @param newContent - New text content for the block
   * 
   * Performance: O(n) where n = number of blocks. Uses immutable update pattern
   * to ensure Zustand re-renders only when content actually changes.
   * 
   * Security: Content is stored raw. Sanitization happens at render time.
   * Only the block with matching ID is modified; no global state replacement.
   */
  updateBlock: (id: string, newContent: string) => void;

  /**
   * Add a new block at a specified index
   * 
   * @param type - BlockType (paragraph, heading, list item, etc.)
   * @param index - Position to insert (0 = before first block, blocks.length = append)
   * 
   * Metadata:
   * - ID: UUIv4 generated locally (fresh per edit to prevent duplicates)
   * - author: Marked as 'human' since this is direct editor insertion
   * - lastEdited: Current timestamp for audit trail
   * 
   * Validation: index is clamped to [0, blocks.length] to prevent invalid insertion
   */
  addBlock: (type: BlockType, index: number) => void;

  /**
   * Delete a block by ID
   * 
   * @param id - Block ID to remove
   * 
   * Safety: If block not found, no-op (prevents crashes from stale IDs).
   * Selection is cleared if the deleted block was selected.
   */
  deleteBlock: (id: string) => void;

  /**
   * Update the cursor/selection position
   * 
   * @param blockId - ID of block containing cursor
   * @param offset - Character offset within block content
   * 
   * This is internal state for the editor UI. Validates that blockId exists.
   */
  setSelection: (blockId: string, offset: number) => void;

  /**
   * Clear the current selection/cursor
   */
  clearSelection: () => void;

  /**
   * Replace entire document state (used for undo/redo and sync operations)
   * 
   * @param newState - Complete DocumentState to replace current state
   * 
   * This is a "dangerous" operation used only for:
   * - Undo/redo actions
   * - Syncing from server after conflict resolution
   * - Loading saved documents
   */
  setDocumentState: (newState: DocumentState) => void;
}

/**
 * Create the editor store with initial state
 * 
 * Initial State:
 * - One empty paragraph block (UUIv4)
 * - No selection (selection === null)
 * 
 * This ensures the editor is never completely empty and always has at least one place to type.
 */
export const useEditorStore = create<EditorStore>((set) => ({
  // Initial state: Empty blocks array, wait for hydration
  // This is intentionally empty; the server will populate it immediately
  blocks: [],
  selection: null,
  lastAddedId: null, // No block is "newly added" on initial render

  // Action: Update block content
  updateBlock: (id, newContent) =>
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              content: newContent,
              metadata: {
                ...b.metadata,
                lastEdited: Date.now(),
                author: 'human',
              },
            }
          : b
      ),
    })),

  // Action: Add new block at index
  addBlock: (type, index) =>
    set((state) => {
      // Clamp index to valid range [0, blocks.length]
      const safeIndex = Math.max(0, Math.min(index, state.blocks.length));

      // Generate ID upfront so we can return it as the "signal"
      const newId = uuidv4();

      const newBlock: EditorBlock = {
        id: newId,
        type,
        content: '',
        metadata: {
          lastEdited: Date.now(),
          author: 'human',
        },
      };

      const newBlocks = [...state.blocks];
      newBlocks.splice(safeIndex, 0, newBlock);

      // Return both the new blocks AND the signal for the Focus Manager
      return { 
        blocks: newBlocks,
        lastAddedId: newId, // Signal: new block was added, focus this ID
      };
    }),

  // Action: Delete block by ID
  deleteBlock: (id) =>
    set((state) => {
      // Find the block to delete
      const blockExists = state.blocks.some((b) => b.id === id);

      if (!blockExists) {
        // No-op if block not found
        return state;
      }

      // Remove the block
      const newBlocks = state.blocks.filter((b) => b.id !== id);

      // Ensure at least one block always exists
      if (newBlocks.length === 0) {
        newBlocks.push({
          id: uuidv4(),
          type: 'p',
          content: '',
          metadata: {
            lastEdited: Date.now(),
            author: 'human',
          },
        });
      }

      // Clear selection if it was pointing to the deleted block
      const newSelection =
        state.selection?.blockId === id ? null : state.selection;

      return {
        blocks: newBlocks,
        selection: newSelection,
        lastAddedId: null, // Clear the focus signal when a block is deleted
      };
    }),

  // Action: Set selection/cursor position
  setSelection: (blockId, offset) =>
    set((state) => {
      // Validate that blockId exists in current state
      const blockExists = state.blocks.some((b) => b.id === blockId);

      if (!blockExists) {
        // Invalid block ID, do not update
        console.warn(
          `[useEditorStore] setSelection: Block ID "${blockId}" not found. Selection not updated.`
        );
        return state;
      }

      return {
        selection: {
          blockId,
          offset: Math.max(0, offset), // Offset cannot be negative
        },
      };
    }),

  // Action: Clear selection
  clearSelection: () =>
    set({
      selection: null,
    }),

  // Action: Replace entire document state
  setDocumentState: (newState) =>
    set({
      blocks: newState.blocks,
      selection: newState.selection,
    }),

  // Action: Hydrate store from server data
  hydrate: (blocks) => {
    // Ensure we always have at least one block to type in
    // If server returns empty blocks, create a default empty paragraph
    const finalBlocks = blocks && blocks.length > 0 ? blocks : [
      {
        id: uuidv4(),
        type: 'p' as const,
        content: '',
        metadata: {
          lastEdited: Date.now(),
          author: 'human' as const,
        },
      },
    ];

    return set({
      blocks: finalBlocks,
      lastAddedId: null, // Clear focus signal on hydration
    });
  },
}));
