/**
 * Editor Type Definitions - Block-Based Document Schema
 * 
 * This module defines the "DNA" of our document system using a block-based JSON structure.
 * Instead of a single string representation, documents are composed of semantic blocks (paragraphs,
 * headings, list items, etc.) with unique IDs for audit trail tracking and metadata for provenance.
 * 
 * Security considerations:
 * - Block IDs are internal references only and should never be exposed to untrusted sources
 * - Content strings must be sanitized before rendering to prevent XSS attacks
 * - Author field is metadata only; authorization checks should not rely solely on this field
 */

/**
 * BlockType: Semantic HTML element types supported in the editor
 * 
 * - 'p': Paragraph text
 * - 'h1': Heading level 1
 * - 'h2': Heading level 2
 * - 'li': List item
 */
export type BlockType = 'p' | 'h1' | 'h2' | 'li';

/**
 * EditorBlock: A single block unit in the document
 * 
 * Each block has:
 * - A unique ID (instead of relying on array index) so that blocks maintain identity
 *   even when reordered, moved, or deleted. This enables reliable audit trails and
 *   "Replay" tracking.
 * - A type indicating the semantic meaning (paragraph, heading, list item)
 * - Content as raw text (sanitization happens at render time)
 * - Optional metadata for tracking authorship and edit history
 */
export interface EditorBlock {
  /** Unique identifier for the block - enables reliable tracking across document restructuring */
  id: string;

  /** The semantic type of this block (paragraph, heading, list item) */
  type: BlockType;

  /** The raw text content - must be sanitized before rendering to prevent XSS */
  content: string;

  /** Optional metadata tracking block provenance and edit history */
  metadata?: {
    /** Timestamp of last edit (milliseconds since epoch) */
    lastEdited: number;

    /** Origin of this block - distinguishes human edits, AI-generated content, and pasted content */
    author: 'human' | 'ai' | 'pasted';
  };
}

/**
 * DocumentState: The complete state of a document
 * 
 * This is the "Virtual DOM" of our editor system. The UI renders from this state,
 * but this JSON structure is the authoritative source of truth for document content.
 * 
 * The blocks array represents the ordered sequence of content blocks.
 * The selection field tracks the current cursor position for editing operations.
 */
export interface DocumentState {
  /** Ordered array of content blocks forming the document */
  blocks: EditorBlock[];

  /**
   * Current text selection/cursor position
   * 
   * null = no selection (e.g., when document is empty or no block is focused)
   * blockId = which block contains the cursor
   * offset = character offset within that block's content
   */
  selection: {
    /** ID of the block containing the cursor */
    blockId: string;
    /** Character offset within the block's content string */
    offset: number;
  } | null;
}
