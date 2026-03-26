'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function EditorLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    // Layer 1: Full-height gradient background
    // 3-tone gradient: slate (cool start) → blue (mid) → indigo (warm end)
    // Creates a sophisticated, modern appearance
    <div className="EditorLayout_Background_GradientWrapper_1">
      
      {/* Layer 2: Header Section with Backdrop Blur */}
      {/* 
        The backdrop-blur-md creates a "frosted glass" effect where the gradient
        subtly shows through, creating depth perception. This is the key to the
        modern, layered appearance without being distracting.
        
        The flex layout ensures status (left) and actions (right) are balanced.
      */}
      <header className="EditorLayout_Header_1">
        
        {/* Left side: Title and Status Indicators */}
        <div className="EditorLayout_TitleSection_1">
          {/* Green Status Dot: Pulsing animation indicates "live" connection */}
          <div className="EditorLayout_StatusIndicator_Dot_1" />
          
          {/* Document Title */}
          <h1 className="EditorLayout_DocumentTitle_1">{title}</h1>
          
          {/* Auto-save Badge: Reassures user that work is being saved */}
          <span className="EditorLayout_StatusBadge_AutoSaved_1">
            Auto-saved
          </span>
        </div>

        {/* Right side: Action Buttons */}
        {/* These are placeholder buttons for future integration with settings, etc. */}
        <div className="EditorLayout_ActionButtons_Group_1">
          <button 
            className="EditorLayout_Button_Settings_1"
            aria-label="Settings"
            title="Editor settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Layer 3: Main Document Area */}
      {/*
        The white paper-like card is the focal point. It has:
        - Rounded corners (rounded-3xl) for modern appearance
        - Substantial shadow (shadow-xl with slate-200) for depth
        - Min-height ensures it fills the screen or grows naturally
        - Border for definition without heaviness
        
        This container is where the editor content (Canvas + Toolbar) renders.
      */}
      <main className="EditorLayout_MainContent_1">
        {children}
      </main>
    </div>
  );
}