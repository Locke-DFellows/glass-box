/**
 * SEMANTIC CLASS NAME CONVENTION - Glass Box Editor
 * 
 * Purpose:
 * - Replace scattered Tailwind utilities with meaningful, semantic identifiers
 * - Easier to understand what each element is for at a glance
 * - Simplifies refactoring and maintenance
 * - Makes CSS styling centralized and manageable
 * 
 * Convention Pattern:
 * ComponentName_ElementFunction_Variant
 * 
 * Examples:
 * - EditorLayout_Header_1 (Header in EditorLayout component)
 * - Toolbar_Button_1 (Button in Toolbar component)  
 * - Canvas_ContentBlock_1 (Content block in Canvas)
 * 
 * Variant Number:
 * - Usually "_1" for single/main version of an element
 * - "_Active" for state variants (e.g., TabButton_Active_1)
 * - Could be "_2", "_3" etc. if multiple similar elements exist
 * 
 * ============================================================================
 * IMPLEMENTATION DETAILS
 * ============================================================================
 * 
 * Location: src/styles/semantic-classes.css
 * - All semantic class definitions live in one file
 * - Uses Tailwind @apply directives for styling
 * - Imported in src/app/globals.css
 * 
 * Files Updated:
 * 1. src/components/editor/EditorLayout.tsx  - Main page layout
 * 2. src/components/editor/Toolbar.tsx       - Formatting toolbar
 * 3. src/components/editor/Canvas.tsx        - Editor content area
 * 4. src/app/assignments/[id]/page.tsx       - Assignment page
 * 5. src/app/layout.tsx                      - Root layout
 * 6. src/app/globals.css                     - Import semantic CSS
 * 
 * ============================================================================
 * SEMANTIC CLASS REFERENCE
 * ============================================================================
 */

/* ============================================================================
   EditorLayout Component
   Main page structure with header, content area, and gradient background
   ============================================================================ */

.EditorLayout_Background_GradientWrapper_1
  Purpose: Full-height container with 3-tone gradient background
  Props: min-h-screen, gradient from slate → blue → indigo
  Style: Sophisticated, modern appearance with layered depth

.EditorLayout_Header_1
  Purpose: Top header bar with status and action buttons
  Props: Backdrop blur, white/translucent background, rounded corners
  Style: Frosted glass effect over gradient background
  
.EditorLayout_TitleSection_1
  Purpose: Container for title and status indicators on left side of header
  Props: Flex layout, grouped horizontally
  Style: Left-aligned section with title and badges

.EditorLayout_StatusIndicator_Dot_1
  Purpose: Animated green dot showing "live" connection status
  Props: 3x3 size, emerald color, pulsing animation
  Style: Visual indicator of active session

.EditorLayout_DocumentTitle_1
  Purpose: Main document title displayed in header
  Props: Slate color, semibold font, lg size
  Style: Clear, readable heading

.EditorLayout_StatusBadge_AutoSaved_1
  Purpose: "Auto-saved" badge reassuring users work is persisted
  Props: Light slate background, small text, rounded pill
  Style: Subtle indicator badge

.EditorLayout_ActionButtons_Group_1
  Purpose: Container for action buttons on right side of header
  Props: Flex layout, horizontal gap
  Style: Right-aligned button group

.EditorLayout_Button_Settings_1
  Purpose: Settings button (gear icon)
  Props: Hover effects, rounded, interactive feedback
  Style: Settings/actions button in header

.EditorLayout_MainContent_1
  Purpose: Main document/editor container - white paper-like card
  Props: Rounded corners (3xl), significant shadow, flex column
  Style: Focal point of the UI, white "paper" appearance

/* ============================================================================
   Toolbar Component
   Multi-tab formatting toolbar with tools organized by function
   ============================================================================ */

.Toolbar_Container_1
  Purpose: Outer wrapper for entire toolbar
  Props: Padding, subtle border and background
  Style: Top border area above main content

.Toolbar_TabNav_1
  Purpose: Pill-shaped tab navigation bar
  Props: Flex layout, rounded container, semi-transparent bg
  Style: Modern tab selector with smooth transitions

.Toolbar_TabButton_1
  Purpose: Inactive/unselected tab button
  Props: Padding, text colors for hover states
  Style: Subtle, faded appearance when not active

.Toolbar_TabButton_Active_1
  Purpose: Active/selected tab button
  Props: White background, blue text, subtle shadow
  Style: High contrast to show as selected

.Toolbar_ToolGroup_Container_1
  Purpose: Main container for all formatting tools
  Props: Flex layout, gap, rounded, animated fade-in
  Style: Smooth animation when switching tabs

.Toolbar_ToolGroup_Section_1
  Purpose: Grouped section of related tools
  Props: Flex layout, horizontal gap
  Style: Groups related buttons together

.Toolbar_ToolGroup_Divider_1
  Purpose: Visual separator between tool groups
  Props: Border-right, padding right
  Style: Subtle vertical line separating groups

.Toolbar_Button_1
  Purpose: Individual tool button (Bold, Italic, Undo, etc.)
  Props: Hover effects, rounded, flex column layout
  Style: Interactive button with icon + label

.Toolbar_Button_Icon_1
  Purpose: Icon inside toolbar button
  Props: Fixed size (18px), flex-shrink-0
  Style: Visual representation of tool action

.Toolbar_Button_Label_1
  Purpose: Text label for toolbar button (appears on hover)
  Props: Small text, opacity animation on hover
  Style: Hidden by default, appears on hover for clarity

.Toolbar_HintText_1
  Purpose: Helper text indicating features coming soon
  Props: Small text, italic, slate color
  Style: Light, non-intrusive info text

.Toolbar_AuditIndicator_1
  Purpose: Container for audit trail indicator
  Props: Flex layout, gap, centered
  Style: Shows users that changes are being tracked

.Toolbar_AuditIndicator_Dot_1
  Purpose: Pulsing dot showing active audit tracking
  Props: Small (2x2), emerald color, pulsing animation
  Style: Visual feedback that tracking is active

/* ============================================================================
   Canvas Component
   Main editable content area where users write and format documents
   ============================================================================ */

.Canvas_Container_1
  Purpose: Main outer container for canvas area
  Props: Flex column, full height with scroll, padding
  Style: Scrollable content area inside main card

.Canvas_BlocksContainer_1
  Purpose: Container for all editable blocks
  Props: Max-width constraint, centered, flex for vertical layout
  Style: Constrains content width to readable column size

.Canvas_ContentBlock_1
  Purpose: Individual contentEditable block (paragraph, heading, etc.)
  Props: Padding, text styling, focus states
  Style: Clean editing surface similar to Apple Notes

.Canvas_LoadingSkeleton_1
  Purpose: Loading placeholder shown during hydration
  Props: Flex, bg, animate-pulse
  Style: Skeletal animation while page loads

.Canvas_DebugInfo_1
  Purpose: Debug information display (session ID, block count)
  Props: Padding top, border-top, small text
  Style: Subtle debug info at bottom of canvas

/* ============================================================================
   Error Screens
   Shared error page layouts for various failure conditions
   ============================================================================ */

.ErrorScreen_Container_1
  Purpose: Full-screen error display container
  Props: Flex centered, min-h-screen, white background
  Style: Centered error message layout

.ErrorScreen_Content_1
  Purpose: Text content wrapper for error message
  Props: Text-center
  Style: Centered text content group

.ErrorScreen_Title_1
  Purpose: Error title heading
  Props: Large bold text, dark gray
  Style: Main error heading

.ErrorScreen_Message_1
  Purpose: Error description message
  Props: Medium size, gray text
  Style: Human-readable error explanation

.ErrorScreen_Details_1
  Purpose: Technical error details (optional)
  Props: Small text, lighter gray
  Style: Technical details for developers

/* ============================================================================
   Root Layout
   Global HTML and body element styling
   ============================================================================ */

.RootLayout_Html_1
  Purpose: HTML element styling
  Props: Full height, antialiased fonts
  Style: Base element styling

.RootLayout_Body_1
  Purpose: Body element styling
  Props: Min-h-full, flex column
  Style: Flex container for page layout

/* ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * In EditorLayout.tsx:
 * ───────────────────────────────────────────────────────────────────────────
 * <div className="EditorLayout_Background_GradientWrapper_1">
 *   <header className="EditorLayout_Header_1">
 *     ...
 *   </header>
 * </div>
 * 
 * In Toolbar.tsx (with state):
 * ───────────────────────────────────────────────────────────────────────────
 * <button 
 *   className={activeTab === 'edit' ? 'Toolbar_TabButton_Active_1' : 'Toolbar_TabButton_1'}
 * >
 * 
 * In Canvas.tsx:
 * ───────────────────────────────────────────────────────────────────────────
 * <div className="Canvas_ContentBlock_1" contentEditable>
 *   {block.content}
 * </div>
 * 
 * ============================================================================
 * ADVANTAGES OF THIS APPROACH
 * ============================================================================
 * 
 * 1. SEMANTIC MEANING
 *    - Class names describe PURPOSE, not just appearance
 *    - Easy to understand what each element does
 *    - "Canvas_ContentBlock_1" > "outline-none py-2 text-lg..."
 * 
 * 2. CENTRALIZED STYLING
 *    - All ~30 classes defined in one CSS file
 *    - Easy to find and modify styles
 *    - No scattered Tailwind utilities
 * 
 * 3. MAINTAINABILITY
 *    - Change visual appearance in one place
 *    - Don't need to hunt through multiple JSX files
 *    - Designers can modify semantic-classes.css without JSX knowledge
 * 
 * 4. CONSISTENCY
 *    - Uniform naming across all components
 *    - New developers quickly understand the pattern
 *    - Reduces naming debates and inconsistencies
 * 
 * 5. REFACTORING SAFETY
 *    - If element purpose changes, rename the class
 *    - All usages updated together
 *    - No dead Tailwind classes left behind
 * 
 * ============================================================================
 * FUTURE ENHANCEMENTS
 * ============================================================================
 * 
 * As features are added, follow the same pattern:
 * 1. Add semantic class definition to semantic-classes.css
 * 2. Use the semantic name in JSX className prop
 * 3. Document the class in this file
 * 
 * Examples for future features:
 * - Modal_Overlay_1 (Modal backdrop)
 * - Dialog_Content_1 (Modal dialog box)
 * - Menu_Item_1 (Dropdown menu items)
 * - Toast_Notification_1 (Toast notifications)
 * 
 * ============================================================================
 */
