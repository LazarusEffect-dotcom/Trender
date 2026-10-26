import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ChevronDown,
  UserRound,
  Settings,
  MessageSquareText,
  Sun,
  Moon,
  Laptop,
  Check,
  RefreshCw,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext.jsx";

export default function Topbar({ active, onSearch, onHelp, onNavigate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [theme, setTheme] = useState(() => document.documentElement.dataset.trenderTheme || "light");

  const profileRef = useRef(null);
  const currencyRef = useRef(null);

  const {
    currency,
    currencySymbol,
    flag,
    countryName,
    countryCode,
    isAutoGeo,
    rates,
    currentRate,
    setCurrency,
    resetToGeo,
    supportedCurrencies,
    loading: geoLoading,
  } = useCurrency();

  const shortcut = typeof navigator !== "undefined" &&
    (navigator.userAgentData?.platform?.toLowerCase().includes("mac") || navigator.platform?.toLowerCase().includes("mac"))
    ? "⌘ K" : "Ctrl K";

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeTheme(newTheme) {
    setTheme(newTheme);
    document.documentElement.dataset.trenderTheme = newTheme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : newTheme;
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

  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.trim().toLowerCase();
    if (!q) return supportedCurrencies;
    return supportedCurrencies.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  }, [currencySearch, supportedCurrencies]);

  return <header className="topbar">
    <div className="breadcrumbs"><span>Trender</span><b>/</b><strong>{active}</strong></div>

    <div className="topbar-actions">
      {/* Geolocator & Currency Switcher */}
      <div className="geo-currency-wrapper" ref={currencyRef}>
        <button
          className={`geo-currency-btn ${currencyOpen ? "active" : ""}`}
          onClick={() => setCurrencyOpen(v => !v)}
          title={`Detected from ${countryName} (${countryCode}). Click to change currency.`}
          aria-expanded={currencyOpen}
          aria-label="Currency and Geolocation selector"
        >
          <span className="geo-pin-icon"><MapPin size={13} /></span>
          <span className="geo-flag">{flag}</span>
          <span className="geo-code">{currency}</span>
          <span className="geo-symbol">{currencySymbol}</span>
          <ChevronDown size={13} className={currencyOpen ? "rotate-arrow" : ""} />
        </button>

        {currencyOpen && (
          <div className="geo-currency-popover" role="dialog" aria-label="Select currency and region">
            <div className="geo-popover-header">
              <div className="geo-detected-row">
                <div className="geo-detected-badge">
                  <span className="geo-pulse-dot" />
                  <MapPin size={13} />
                  <strong>{countryName}</strong>
                  <span className="geo-flag-badge">{flag}</span>
                </div>
                <span className={`geo-mode-tag ${isAutoGeo ? "auto" : "manual"}`}>
                  {isAutoGeo ? "📍 Auto Geolocated" : "✏️ Custom"}
                </span>
              </div>
              <p className="geo-exchange-note">
                1 USD = <strong>{currentRate.toFixed(currency === "JPY" || currency === "KRW" ? 2 : 4)} {currency}</strong> ({currencySymbol}) · Live rates
              </p>
            </div>

            <div className="geo-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search currency, code or country..."
                value={currencySearch}
                onChange={e => setCurrencySearch(e.target.value)}
                autoFocus
              />
              {currencySearch && (
                <button className="icon-button" onClick={() => setCurrencySearch("")}>
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="geo-currency-list">
              {filteredCurrencies.map(c => {
                const isSelected = c.code === currency;
                const rate = rates[c.code] || 1;
                return (
                  <button
                    key={c.code}
                    className={`geo-currency-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setCurrency(c.code);
                      setCurrencyOpen(false);
                    }}
                  >
                    <span className="geo-item-flag">{c.flag}</span>
                    <div className="geo-item-text">
                      <div className="geo-item-top">
                        <strong>{c.code}</strong>
                        <span className="geo-item-symbol">({c.symbol})</span>
                      </div>
                      <small>{c.name}</small>
                    </div>
                    <span className="geo-item-rate">1$ = {rate.toFixed(c.code === "JPY" || c.code === "KRW" ? 1 : 2)}</span>
                    {isSelected && <Check size={14} className="geo-item-check" />}
                  </button>
                );
              })}
            </div>

            <div className="geo-popover-footer">
              <button
                className="geo-reset-btn"
                onClick={() => {
                  resetToGeo();
                  setCurrencyOpen(false);
                }}
                title="Reset to your detected country & currency"
              >
                <RotateCcw size={13} className={geoLoading ? "spin-icon" : ""} />
                <span>Reset to Auto Geolocator ({countryCode})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="global-search" onClick={onSearch} aria-label="Search markets and research">
        <Search size={16}/><span>Search markets and research</span><kbd>{shortcut}</kbd>
      </button>

      <button className="small-action topbar-research" onClick={onHelp} title="Open research assistant">
        <MessageSquareText size={15}/><span>Research assistant</span>
      </button>

      <div className="profile-dropdown-wrapper" ref={profileRef}>
        <button
          className="workspace-profile-btn"
          onClick={() => setProfileOpen(value => !value)}
          aria-expanded={profileOpen}
          aria-haspopup="true"
          aria-label="Open research desk settings"
        >
          <span className="avatar"><UserRound size={15}/></span>
          <span className="profile-name">Research desk</span>
          <ChevronDown size={14} className={profileOpen ? "rotate-arrow" : ""}/>
        </button>

        {profileOpen && <div className="profile-popover" role="menu">
          <div className="profile-popover-header">
            <div className="popover-avatar"><UserRound size={17}/></div>
            <div>
              <strong>Research desk</strong>
              <small>Preferences are saved in this browser</small>
            </div>
          </div>

          <div className="profile-menu-section">
            <span className="menu-section-label">APPEARANCE</span>
            <div className="theme-toggle-row">
              <button className={`theme-chip ${theme === "light" ? "active" : ""}`} onClick={() => changeTheme("light")}><Sun size={13}/> Light</button>
              <button className={`theme-chip ${theme === "dark" ? "active" : ""}`} onClick={() => changeTheme("dark")}><Moon size={13}/> Dark</button>
              <button className={`theme-chip ${theme === "system" ? "active" : ""}`} onClick={() => changeTheme("system")}><Laptop size={13}/> System</button>
            </div>
          </div>

          <div className="profile-menu-section">
            <span className="menu-section-label">REGION & CURRENCY</span>
            <div className="profile-geo-preview">
              <span>{flag} {countryName}</span>
              <strong>{currency} ({currencySymbol})</strong>
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
