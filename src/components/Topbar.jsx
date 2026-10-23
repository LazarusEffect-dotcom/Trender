import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, CircleHelp, UserRound, Settings, MessageSquareText, Sun, Moon, Laptop, Check, RefreshCw } from "lucide-react";

export default function Topbar({ active, onSearch, onHelp, onNavigate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.trenderTheme || "light");
  const profileRef = useRef(null);
  const shortcut = typeof navigator !== "undefined" &&
    (navigator.userAgentData?.platform?.toLowerCase().includes("mac") || navigator.platform?.toLowerCase().includes("mac"))
    ? "⌘ K" : "Ctrl K";

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeTheme(newTheme) {
    setTheme(newTheme);
    document.documentElement.dataset.trenderTheme = newTheme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : newTheme;
    try {
      const stored = JSON.parse(localStorage.getItem("trender.settings.v1") || "{}");
      localStorage.setItem("trender.settings.v1", JSON.stringify({ ...stored, theme: newTheme }));
    } catch {}
  }

  function clearSavedView() {
    try {
      localStorage.removeItem("trender.watchlist.v1");
      sessionStorage.clear();
      window.location.reload();
    } catch {}
  }

  return <header className="topbar">
    <div className="breadcrumbs"><span>Trender</span><b>/</b><strong>{active}</strong></div>
    <div className="topbar-actions">
      <button className="global-search" onClick={onSearch} aria-label="Search markets and research">
        <Search size={16}/><span>Search markets and research</span><kbd>{shortcut}</kbd>
      </button>
      <button className="small-action topbar-research" onClick={onHelp} title="Open research assistant">
        <MessageSquareText size={15}/><span>Research assistant</span>
      </button>
      <div className="profile-dropdown-wrapper" ref={profileRef}>
        <button className="workspace-profile-btn" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-haspopup="true" aria-label="Open research desk settings">
          <span className="avatar"><UserRound size={15}/></span><span className="profile-name">Research desk</span><ChevronDown size={14} className={profileOpen ? "rotate-arrow" : ""}/>
        </button>
        {profileOpen && <div className="profile-popover" role="menu">
          <div className="profile-popover-header"><div className="popover-avatar"><UserRound size={17}/></div><div><strong>Research desk</strong><small>Preferences are saved in this browser</small></div></div>
          <div className="profile-menu-section">
            <span className="menu-section-label">APPEARANCE</span>
            <div className="theme-toggle-row">
              <button className={`theme-chip ${theme === "light" ? "active" : ""}`} onClick={() => changeTheme("light")}><Sun size={13}/> Light</button>
              <button className={`theme-chip ${theme === "dark" ? "active" : ""}`} onClick={() => changeTheme("dark")}><Moon size={13}/> Dark</button>
              <button className={`theme-chip ${theme === "system" ? "active" : ""}`} onClick={() => changeTheme("system")}><Laptop size={13}/> System</button>
            </div>
          </div>
          <div className="profile-menu-section">
            <span className="menu-section-label">SHORTCUTS</span>
            <button className="profile-menu-item" onClick={() => { onNavigate("Research assistant"); setProfileOpen(false); }}><MessageSquareText size={14}/><span>Research assistant</span></button>
            <button className="profile-menu-item" onClick={() => { onNavigate("Settings"); setProfileOpen(false); }}><Settings size={14}/><span>Preferences and data sources</span></button>
            <button className="profile-menu-item danger-menu-item" onClick={clearSavedView} title="Clear this browser’s saved watchlist and refresh"><RefreshCw size={14}/><span>Clear saved watchlist</span></button>
          </div>
        </div>}
      </div>
    </div>
  </header>;
}
