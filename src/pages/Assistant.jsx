import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  Download,
  Key,
  RefreshCw,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import MarkdownRenderer from "../components/MarkdownRenderer.jsx";
import { consumerInsights, numeratorSource } from "../data/consumerInsights.js";
import { fetchPublicMarket } from "../lib/publicMarket.js";

const AI_KEYS_STORAGE = "trender.ai.keys.v1";
const AI_PREF_STORAGE = "trender.ai.pref.v1";

const suggestions = [
  { label: "Executive Market Briefing", query: "Give me an executive market pulse summary covering the S&P 500, Nasdaq, crypto, and USD/EUR reference rates." },
  { label: "Compare Tech Sector (XLK)", query: "Compare the Technology sector (XLK) and other sector ETF performance with provider quote timing." },
  { label: "Global Inflation & GDP", query: "Which countries show the highest GDP growth and inflation divergence based on World Bank data?" },
  { label: "2025 Consumer Spending", query: "What does Numerator report about generational consumer spending and channel shifts for 2025?" },
  { label: "Crypto vs Equity Volatility", query: "Compare Bitcoin, Ethereum, and Solana 24h movements with traditional equity benchmark performance." },
];

export default function Assistant({ initialQuery = "", contextData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [copied, setCopied] = useState("");
  const [provider, setProvider] = useState(() => {
    try { return localStorage.getItem(AI_PREF_STORAGE) || "auto"; } catch { return "auto"; }
  });
  const [keysModalOpen, setKeysModalOpen] = useState(false);
  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AI_KEYS_STORAGE) || "{}"); } catch { return {}; }
  });
  const [keySaveSuccess, setKeySaveSuccess] = useState(false);
  const [activeModelName, setActiveModelName] = useState("");

  const messageList = useRef(null);

  useEffect(() => {
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    fetchPublicMarket().then(setMarketData).catch(() => setMarketData(null));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(AI_PREF_STORAGE, provider); } catch {}
  }, [provider]);

  function saveKeys(newKeys) {
    setKeys(newKeys);
    try {
      localStorage.setItem(AI_KEYS_STORAGE, JSON.stringify(newKeys));
      setKeySaveSuccess(true);
      setTimeout(() => setKeySaveSuccess(false), 2000);
    } catch {}
  }

  async function send(text = input) {
    const question = text.trim();
    if (!question || loading) return;

    const history = messages.filter(m => m.role !== "system").slice(-8).map(({ role, content }) => ({ role, content }));
    const userMessage = { role: "user", content: question, id: `${Date.now()}-user` };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const headers = { "Content-Type": "application/json" };
    if (keys.gemini) headers["x-gemini-key"] = keys.gemini.trim();
    if (keys.openrouter) headers["x-openrouter-key"] = keys.openrouter.trim();
    if (keys.openai) headers["x-openai-key"] = keys.openai.trim();

    const contextPayload = {
      market: marketData ? {
        fetchedAt: marketData.fetchedAt,
        indices: marketData.indices,
        sectors: marketData.sectors,
        economies: marketData.economies,
        currencies: marketData.currencies,
        crypto: marketData.crypto,
      } : null,
      publishedConsumerFindings: consumerInsights,
      consumerSource: numeratorSource,
      companyData: contextData || null,
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: question,
          history,
          provider,
          context: contextPayload,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Trender AI could not complete this analysis.");
      if (typeof result.text !== "string" || !result.text.trim()) {
        throw new Error("Trender AI returned an empty response. Please try again.");
      }

      const modelLabel = result.model || "Trender Intelligence";
      setActiveModelName(modelLabel);

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: result.text,
          source: modelLabel,
          id: `${Date.now()}-ai`,
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "system",
          content: error.message || "Unable to reach Trender AI. Please try again.",
          id: `${Date.now()}-error`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse(message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(message.id);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  }

  function exportChat() {
    if (!messages.length) return;
    const content = [
      `# Trender Intelligence Research Session`,
      `Date: ${new Date().toLocaleString()}`,
      `Active Model: ${activeModelName || "Trender Multi-Provider Engine"}`,
      `\n---\n`,
      ...messages.map(m => `### ${m.role === "assistant" ? "Trender Intelligence" : m.role === "user" ? "User" : "System"}\n\n${m.content}\n`),
    ].join("\n");

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trender-research-chat-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function regenerate() {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) send(lastUserMsg.content);
  }

  const hasConfiguredKeys = Boolean(keys.gemini || keys.openrouter || keys.openai);

  return (
    <div className="assistant-page">
      <div className="assistant-header">
        <div className="assistant-symbol">
          <Sparkles size={23} />
        </div>
        <div className="assistant-heading-copy">
          <div className="eyebrow">INTELLIGENT MARKET RESEARCH ENGINE</div>
          <h1>Trender Intelligence</h1>
          <p>Multi-provider AI reasoning grounded in live public market data, macroeconomic indicators, and consumer reports.</p>
        </div>

        <div className="assistant-controls-cluster">
          <div className="provider-select-wrapper">
            <SlidersHorizontal size={14} className="control-icon" />
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="provider-dropdown"
              title="Select AI Reasoning Engine"
            >
              <option value="auto">Auto (Smart Engine)</option>
              <option value="gemini">Google Gemini</option>
              <option value="openrouter">OpenRouter Free</option>
              <option value="openai">OpenAI</option>
              <option value="analyst">Grounded Analyst (Offline)</option>
            </select>
          </div>

          <button
            className={`small-action keys-button ${hasConfiguredKeys ? "has-keys" : ""}`}
            onClick={() => setKeysModalOpen(true)}
            title="Configure Custom AI Keys"
          >
            <Key size={14} />
            <span>{hasConfiguredKeys ? "Keys Active" : "Set API Key"}</span>
          </button>

          {messages.length > 0 && (
            <>
              <button className="small-action" onClick={exportChat} title="Export Research as Markdown">
                <Download size={14} /> Export
              </button>
              <button
                className="small-action assistant-reset"
                onClick={() => {
                  setMessages([]);
                  setActiveModelName("");
                }}
                title="Start a new chat session"
              >
                <RotateCcw size={14} /> New Chat
              </button>
            </>
          )}
        </div>
      </div>

      <div className="chat-workspace">
        {messages.length === 0 ? (
          <div className="assistant-welcome">
            <div className="sparkle-circle">
              <Zap size={24} />
            </div>
            <span className="assistant-welcome-kicker">GROUNDED MARKET REASONING</span>
            <h2>What market signal would you like to investigate?</h2>
            <p>
              Ask about current benchmark moves, industry sector rotations, macroeconomic divergences, or 2025 consumer demand findings.
            </p>
            <div className="suggestion-grid">
              {suggestions.map((item, index) => (
                <button key={item.label} onClick={() => send(item.query)}>
                  <span className="suggestion-index">0{index + 1}</span>
                  <div className="suggestion-text">
                    <strong>{item.label}</strong>
                    <small>{item.query.slice(0, 75)}…</small>
                  </div>
                  <span className="suggestion-arrow">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-list" ref={messageList} aria-live="polite">
            {messages.map(message =>
              message.role === "system" ? (
                <div className="assistant-error" role="alert" key={message.id}>
                  <AlertCircle size={17} />
                  <div>
                    <strong>AI Notice</strong>
                    <p>{message.content}</p>
                  </div>
                </div>
              ) : (
                <article className={`chat-message ${message.role}`} key={message.id}>
                  <div className={`message-avatar ${message.role === "assistant" ? "ai-avatar" : "user-avatar"}`}>
                    {message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}
                  </div>
                  <div className="message-body">
                    <div className="message-meta">
                      <span className="message-role">
                        {message.role === "assistant" ? "Trender Intelligence" : "You"}
                      </span>
                      {message.source && <span className="message-source">{message.source}</span>}
                    </div>
                    <MarkdownRenderer content={message.content} />
                    {message.role === "assistant" && (
                      <div className="message-actions-bar">
                        <button className="text-action" onClick={() => copyResponse(message)}>
                          {copied === message.id ? <Check size={14} /> : <Copy size={14} />}{" "}
                          {copied === message.id ? "Copied" : "Copy"}
                        </button>
                        <button className="text-action" onClick={regenerate}>
                          <RefreshCw size={13} /> Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            )}
            {loading && (
              <div className="loading-response">
                <span className="thinking-dots">
                  <i />
                  <i />
                  <i />
                </span>
                Synthesizing market snapshot and generating grounded intelligence…
              </div>
            )}
          </div>
        )}

        <form
          className="chat-composer"
          onSubmit={event => {
            event.preventDefault();
            send();
          }}
        >
          <textarea
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Ask about indices, sector ETFs, macroeconomic inflation, or upload company data to compare…"
            aria-label="Message Trender Intelligence"
            rows={2}
            maxLength={8000}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <div className="composer-footer">
            <span className="engine-status-tag">
              <Sparkles size={13} />
              {activeModelName
                ? `Engine: ${activeModelName}`
                : hasConfiguredKeys
                ? "Custom Key Configured · Multi-Model Active"
                : "Smart Grounded Engine · Zero-Config Ready"}
            </span>
            <span className="composer-count">{input.length}/8000</span>
            <button className="primary-button" type="submit" disabled={!input.trim() || loading}>
              <Send size={15} /> Send
            </button>
          </div>
        </form>
      </div>

      <p className="data-disclaimer">
        AI responses are grounded in current public market snapshots, ECB reference rates, and World Bank annual data. Verify high-stakes decisions against direct primary sources.
      </p>

      {/* Custom API Keys Modal */}
      {keysModalOpen && (
        <div className="command-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setKeysModalOpen(false); }}>
          <section className="command-dialog keys-dialog" role="dialog" aria-modal="true" aria-label="AI Provider Settings">
            <div className="keys-dialog-header">
              <div className="keys-dialog-title">
                <Key size={18} />
                <strong>Configure AI Reasoning Keys</strong>
              </div>
              <button className="icon-button" onClick={() => setKeysModalOpen(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <p className="keys-dialog-desc">
              Your API keys are stored securely on your browser device only and sent directly via secure request headers. They are never saved to any database.
            </p>

            <div className="settings-form keys-form">
              <label>
                Google Gemini API Key (Recommended)
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keys.gemini || ""}
                  onChange={e => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
                />
                <small>Powers Gemini 2.0 Flash / 1.5 Flash. Get free key at ai.google.dev.</small>
              </label>

              <label>
                OpenRouter API Key
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={keys.openrouter || ""}
                  onChange={e => setKeys(prev => ({ ...prev, openrouter: e.target.value }))}
                />
                <small>Access free open-source models (Gemma, Llama, Mistral) at openrouter.ai.</small>
              </label>

              <label>
                OpenAI API Key (Optional)
                <input
                  type="password"
                  placeholder="sk-..."
                  value={keys.openai || ""}
                  onChange={e => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                />
                <small>Powers GPT-4o-mini from platform.openai.com.</small>
              </label>
            </div>

            <div className="keys-dialog-footer">
              {keySaveSuccess && <span className="key-save-badge"><Check size={14} /> Saved locally</span>}
              <button
                className="small-action"
                onClick={() => {
                  saveKeys({});
                  setKeysModalOpen(false);
                }}
              >
                Clear Keys
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  saveKeys(keys);
                  setKeysModalOpen(false);
                }}
              >
                Save & Apply Keys
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
