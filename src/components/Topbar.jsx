import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  CircleHelp,
  Zap,
  Sparkles,
  User,
  Settings,
  Bot,
  Sun,
  Moon,
  Laptop,
  Check,
  RefreshCw
} from "lucide-react";

export default function Topbar({
  active,
  onSearch,
  onHelp,
  onOpenGenzLingo,
  genzMode = false,
  onToggleGenzMode,
  onNavigate
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.trenderTheme || "light");
  const profileRef = useRef(null);

  const shortcut =
    typeof navigator !== "undefined" &&
    (navigator.userAgentData?.platform?.toLowerCase().includes("mac") ||
      navigator.platform?.toLowerCase().includes("mac"))
      ? "⌘ K"
      : "Ctrl K";

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeTheme(newTheme) {
    setTheme(newTheme);
    document.documentElement.dataset.trenderTheme = newTheme;
    try {
      const stored = JSON.parse(localStorage.getItem("trender.settings.v1") || "{}");
      localStorage.setItem("trender.settings.v1", JSON.stringify({ ...stored, theme: newTheme }));
    } catch {}
  }

  function handleClearCache() {
    try {
      localStorage.removeItem("trender.watchlist.v1");
      sessionStorage.clear();
      window.location.reload();
    } catch {}
  }

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Workspace</span>
        <b>/</b>
        <strong>{active}</strong>
      </div>

      <div className="topbar-actions">
        {/* GenZ Mode Instant Switch */}
        <button
          className={`genz-toggle-btn ${genzMode ? "active" : ""}`}
          onClick={() => onToggleGenzMode && onToggleGenzMode()}
          title={genzMode ? "GenZ Mode Active: Showing crisp modern slang explanations" : "Switch on GenZ Mode for snappy slang & analogies"}
          aria-label="Toggle GenZ Market Lingo"
        >
          <Zap size={14} className={genzMode ? "pulse-zap" : ""}/>
          <span>{genzMode ? "GenZ Mode: ON 🔥" : "GenZ Mode"}</span>
        </button>

        {/* GenZ Lingo Dictionary Trigger */}
        <button
          className="small-action genz-lingo-btn"
          onClick={() => onOpenGenzLingo && onOpenGenzLingo()}
          title="Open GenZ Market & Trading Dictionary"
        >
          <Sparkles size={14}/>
          <span>Slang & Lingo</span>
        </button>

        {/* Global Search Button */}
        <button className="global-search" onClick={onSearch} aria-label="Search the workspace">
          <Search size={16}/>
          <span>Search markets, trends, slang...</span>
          <kbd>{shortcut}</kbd>
        </button>

        {/* Topbar Help */}
        <button
          className="icon-button topbar-help"
          title="Ask Trender Intelligence AI"
          onClick={onHelp}
          aria-label="Help and AI Assistant"
        >
          <CircleHelp size={18}/>
        </button>

        {/* Interactive Profile & Workspace Dropdown */}
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button
            className="workspace-profile-btn"
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(prev => !prev);
            }}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Open User Profile and Workspace Settings"
          >
            <span className="avatar">A</span>
            <span className="profile-name">Analyst</span>
            <ChevronDown size={14} className={profileOpen ? "rotate-arrow" : ""}/>
          </button>

          {profileOpen && (
            <div className="profile-popover" role="menu" onClick={(e) => e.stopPropagation()}>
              <div className="profile-popover-header">
                <div className="popover-avatar">A</div>
                <div>
                  <strong>Market Intelligence Analyst</strong>
                  <small>Pro Workspace · Live Feeds</small>
                </div>
              </div>

              <div className="profile-menu-section">
                <span className="menu-section-label">WORKSPACE MODE</span>
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    onToggleGenzMode && onToggleGenzMode();
                    setProfileOpen(false);
                  }}
                >
                  <Zap size={14}/>
                  <span>{genzMode ? "Switch to Standard Analyst View" : "Activate GenZ Slang Mode"}</span>
                  {genzMode && <Check size={14} className="menu-check"/>}
                </button>

                <button
                  className="profile-menu-item"
                  onClick={() => {
                    onOpenGenzLingo && onOpenGenzLingo();
                    setProfileOpen(false);
                  }}
                >
                  <Sparkles size={14}/>
                  <span>Browse GenZ Jargon Buster</span>
                </button>
              </div>

              <div className="profile-menu-section">
                <span className="menu-section-label">THEME</span>
                <div className="theme-toggle-row">
                  <button
                    className={`theme-chip ${theme === "light" ? "active" : ""}`}
                    onClick={() => changeTheme("light")}
                  >
                    <Sun size={13}/> Light
                  </button>
                  <button
                    className={`theme-chip ${theme === "dark" ? "active" : ""}`}
                    onClick={() => changeTheme("dark")}
                  >
                    <Moon size={13}/> Dark
                  </button>
                  <button
                    className={`theme-chip ${theme === "system" ? "active" : ""}`}
                    onClick={() => changeTheme("system")}
                  >
                    <Laptop size={13}/> System
                  </button>
                </div>
              </div>

              <div className="profile-menu-section">
                <span className="menu-section-label">NAVIGATION</span>
                {onNavigate && (
                  <>
                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        onNavigate("AI Assistant");
                        setProfileOpen(false);
                      }}
                    >
                      <Bot size={14}/>
                      <span>Trender AI Assistant</span>
                    </button>
                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        onNavigate("Settings");
                        setProfileOpen(false);
                      }}
                    >
                      <Settings size={14}/>
                      <span>Preferences & API Keys</span>
                    </button>
                  </>
                )}
                <button
                  className="profile-menu-item danger-menu-item"
                  onClick={handleClearCache}
                  title="Clear locally saved items and reset view"
                >
                  <RefreshCw size={14}/>
                  <span>Reset Saved Workspace Cache</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
