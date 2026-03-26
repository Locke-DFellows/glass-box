# Semantic ClassName Quick Reference

## Convention Format
```
ComponentName_ElementFunction_Variant
```

## Component Breakdown

### EditorLayout (Main Page Structure)
```
EditorLayout_Background_GradientWrapper_1  - Full-height gradient bg
EditorLayout_Header_1                      - Top header with title
EditorLayout_TitleSection_1                - Title + status section
EditorLayout_StatusIndicator_Dot_1         - Pulsing green indicator
EditorLayout_DocumentTitle_1               - Document title text
EditorLayout_StatusBadge_AutoSaved_1       - Auto-save indicator badge
EditorLayout_ActionButtons_Group_1         - Button group (right side)
EditorLayout_Button_Settings_1             - Settings button
EditorLayout_MainContent_1                 - White card main content
```

### Toolbar (Formatting Tools)
```
Toolbar_Container_1                        - Outer wrapper
Toolbar_TabNav_1                           - Tab navigation bar
Toolbar_TabButton_1                        - Inactive tab button
Toolbar_TabButton_Active_1                 - Active tab button
Toolbar_ToolGroup_Container_1              - All tools wrapper
Toolbar_ToolGroup_Section_1                - Section of related tools
Toolbar_ToolGroup_Divider_1                - Visual separator (border)
Toolbar_Button_1                           - Individual tool button
Toolbar_Button_Label_1                     - Button label text
Toolbar_HintText_1                         - Helper/info text
Toolbar_AuditIndicator_1                   - Audit tracking indicator
Toolbar_AuditIndicator_Dot_1               - Pulsing audit dot
```

### Canvas (Editor Content)
```
Canvas_Container_1                         - Main canvas wrapper
Canvas_BlocksContainer_1                   - Blocks container
Canvas_ContentBlock_1                      - Editable content block
Canvas_LoadingSkeleton_1                   - Loading placeholder
Canvas_DebugInfo_1                         - Debug info display
```

### Error Screens
```
ErrorScreen_Container_1                    - Full-screen error
ErrorScreen_Content_1                      - Error message wrapper
ErrorScreen_Title_1                        - Error title
ErrorScreen_Message_1                      - Error description
ErrorScreen_Details_1                      - Technical details
```

### Root Layout
```
RootLayout_Html_1                          - HTML element styling
RootLayout_Body_1                          - Body element styling
```

## How to Add a New Semantic Class

1. **Define in CSS**
   ```css
   /* src/styles/semantic-classes.css */
   .NewComponent_ElementFunction_1 {
     @apply tailwind utilities here;
   }
   ```

2. **Use in JSX**
   ```jsx
   <div className="NewComponent_ElementFunction_1">
     Content here
   </div>
   ```

3. **Document in SEMANTIC_CLASSES.md**
   ```markdown
   .NewComponent_ElementFunction_1
     Purpose: What this element does
     Props: What styles it has
     Style: How it appears visually
   ```

## Naming Tips

- **Purpose-Driven**: Name describes WHAT it is, not how it looks
- **Avoid**: Size names (Large, Small) - use function names instead
- **One Home**: Each element has exactly one semantic class
- **Consistency**: Follow the ComponentName_Function_Number pattern
- **Variants**: Use descriptors like "_Active", "_Disabled", "_Hover"

## Example: Adding a Modal

```css
/* In semantic-classes.css */
.Modal_Overlay_1 {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center;
}

.Modal_Content_1 {
  @apply bg-white rounded-2xl shadow-2xl max-w-md p-6;
}

.Modal_Button_1 {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg;
}
```

```jsx
/* In component */
<div className="Modal_Overlay_1">
  <div className="Modal_Content_1">
    <button className="Modal_Button_1">Close</button>
  </div>
</div>
```

## Files to Update When Adding Classes

1. `src/styles/semantic-classes.css` - Class definition with @apply
2. `Your component.tsx` - Use the new className
3. `SEMANTIC_CLASSES.md` - Document the new class
4. `This file` - Update quick reference if widely used
