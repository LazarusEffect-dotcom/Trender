import React, { useState, useMemo } from "react";
import { Check, Copy, ExternalLink, Flame, MessageSquare, Search, Sparkles, X, Zap } from "lucide-react";
import { GENZ_CATEGORIES, GENZ_TERMS } from "../data/genzDictionary.js";

export default function GenzLingoModal({ isOpen, onClose, onAskAi }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Terms");
  const [copiedTerm, setCopiedTerm] = useState("");

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GENZ_TERMS.filter(item => {
      const matchesCat = activeCategory === "All Terms" || item.category === activeCategory;
      const matchesQuery = !q ||
        item.term.toLowerCase().includes(q) ||
        item.genzShort.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  async function copyDefinition(item) {
    try {
      const text = `${item.emoji} ${item.term}: "${item.genzShort}" — ${item.definition} (Example: ${item.example})`;
      await navigator.clipboard.writeText(text);
      setCopiedTerm(item.term);
      setTimeout(() => setCopiedTerm(""), 1600);
    } catch {}
  }

  return (
    <div className="command-backdrop genz-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="command-dialog genz-modal-dialog" role="dialog" aria-modal="true" aria-label="GenZ Market & Trading Dictionary">
        <header className="genz-modal-header">
          <div className="genz-header-title">
            <div className="genz-badge-icon"><Zap size={18}/></div>
            <div>
              <h2>GenZ Market Lingo & Jargon Buster</h2>
              <p>Short, crisp, high-signal explanations for stocks, trading, macro and graphs. Zero boring boomer talk.</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={18}/></button>
        </header>

        <div className="genz-search-bar">
          <Search size={16}/>
          <input
            type="text"
            placeholder="Search slang, charts, macro or trading terms (e.g. Bullish, S&P 500, FOMO)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search && <button className="icon-button" onClick={() => setSearch("")}><X size={14}/></button>}
        </div>

        <div className="genz-category-pills">
          {GENZ_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`genz-cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="genz-terms-grid">
          {filteredTerms.map(item => (
            <article className="genz-term-card" key={item.term}>
              <div className="genz-term-top">
                <span className="genz-emoji">{item.emoji}</span>
                <div className="genz-term-names">
                  <h3>{item.term}</h3>
                  <span className="genz-term-category">{item.category}</span>
                </div>
                <button
                  className="icon-button genz-copy-btn"
                  onClick={() => copyDefinition(item)}
                  title="Copy GenZ definition"
                >
                  {copiedTerm === item.term ? <Check size={14} className="copied-icon"/> : <Copy size={14}/>}
                </button>
              </div>

              <div className="genz-punchline">
                <strong>"{item.genzShort}"</strong>
              </div>

              <p className="genz-real-def">{item.definition}</p>

              <div className="genz-example-box">
                <span className="example-label">Real world vibe:</span>
                <p>{item.example}</p>
              </div>

              {item.antonym && (
                <div className="genz-opposite-tag">
                  Opposite: <span>{item.antonym}</span>
                </div>
              )}

              {onAskAi && (
                <button
                  className="genz-ask-ai-btn"
                  onClick={() => {
                    onClose();
                    onAskAi(`Break down the concept of "${item.term}" in modern market terms. Give me current real-world examples and why it matters right now.`);
                  }}
                >
                  <Sparkles size={12}/> Ask AI to expand
                </button>
              )}
            </article>
          ))}

          {filteredTerms.length === 0 && (
            <div className="genz-empty-state">
              <span className="empty-emoji">🤔</span>
              <strong>No matching slang found</strong>
              <p>Try searching for words like 'Stonks', 'Inflation', 'Nasdaq', or 'Area Chart'.</p>
            </div>
          )}
        </div>

        <footer className="genz-modal-footer">
          <span>💡 Tip: Click "⚡ GenZ Mode" in the topbar anytime to view live dashboard metrics in crisp GenZ language!</span>
          <button className="primary-button" onClick={onClose}>Done</button>
        </footer>
      </section>
    </div>
  );
}
