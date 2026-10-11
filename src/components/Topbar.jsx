import React from "react";
import { Search, ChevronDown, CircleHelp } from "lucide-react";

export default function Topbar({ active, onSearch, onHelp }) {
  const shortcut = navigator.userAgentData?.platform?.toLowerCase().includes("mac") || navigator.platform?.toLowerCase().includes("mac") ? "⌘ K" : "Ctrl K";
  return <header className="topbar">
    <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{active}</strong></div>
    <div className="topbar-actions">
      <button className="global-search" onClick={onSearch} aria-label="Search the workspace"><Search size={16}/><span>Search markets, trends...</span><kbd>{shortcut}</kbd></button>
      <button className="icon-button topbar-help" title="Ask Trender Intelligence" onClick={onHelp}><CircleHelp size={18}/></button>
      <span className="workspace-profile"><span className="avatar">A</span><span className="profile-name">Analyst</span><ChevronDown size={14}/></span>
    </div>
  </header>;
}
