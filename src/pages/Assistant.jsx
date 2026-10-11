import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, Check, Copy, RotateCcw, Send, Sparkles, UserRound } from "lucide-react";
import { consumerInsights, numeratorSource } from "../data/consumerInsights.js";
import { fetchPublicMarket } from "../lib/publicMarket.js";

const suggestions = [
  "Compare the latest S&P 500 and Nasdaq moves with their quote times.",
  "What does Numerator report about generational spending in 2025?",
  "Compare recent sector ETF performance with the source and date.",
  "Which countries have the latest GDP and inflation observations?",
];

function MessageText({ content }) {
  return <div className="message-text">{content.split("\n").map((line, index) => {
    if (!line.trim()) return <div className="message-line-space" key={index}/>;
    const text = line.replaceAll("**", "").replace(/^[-#\d. ]+/, "");
    if (line.startsWith("## ")) return <h3 key={index}>{line.slice(3)}</h3>;
    if (line.startsWith("- ") || /^\d+\. /.test(line)) return <p className="message-bullet" key={index}><span>•</span>{text}</p>;
    return <p key={index}>{text}</p>;
  })}</div>;
}

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState("preview");
  const [marketData, setMarketData] = useState(null);
  const [copied, setCopied] = useState("");
  const messageList = useRef(null);
  const isHosted = !["localhost", "127.0.0.1"].includes(window.location.hostname);

  useEffect(() => {
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => { fetchPublicMarket().then(setMarketData).catch(() => setMarketData(null)); }, []);

  async function send(text = input) {
    const question = text.trim();
    if (!question || loading) return;

    const history = messages.filter(message => message.role !== "system").slice(-10).map(({ role, content }) => ({ role, content }));
    const userMessage = { role: "user", content: question, id: `${Date.now()}-user` };
    setMessages(previous => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history, context: { market: marketData ? { fetchedAt: marketData.fetchedAt, indices: marketData.indices, sectors: marketData.sectors, economies: marketData.economies, currencies: marketData.currencies, crypto: marketData.crypto } : null, publishedConsumerFindings: consumerInsights, consumerSource: numeratorSource } }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Trender AI could not complete that request.");
      if (typeof result.text !== "string" || !result.text.trim()) throw new Error("Trender AI returned an empty response. Please try again.");
      setConnection("ready");
      setMessages(previous => [...previous, { role: "assistant", content: result.text, source: result.model ? "OpenRouter · " + result.model : "OpenRouter", id: `${Date.now()}-ai` }]);
    } catch (error) {
      setConnection("error");
      setMessages(previous => [...previous, { role: "system", content: error.message || "Unable to reach Trender AI. Please try again." , id: `${Date.now()}-error` }]);
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse(message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(message.id);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("");
    }
  }

  const statusLabel = connection === "ready" ? "AI CONNECTED" : connection === "error" ? "AI UNAVAILABLE" : isHosted ? "CONNECTION PENDING" : "SERVER REQUIRED";
  return <div className="assistant-page">
    <div className="assistant-header">
      <div className="assistant-symbol"><Sparkles size={23}/></div>
      <div className="assistant-heading-copy"><div className="eyebrow">YOUR MARKET RESEARCH PARTNER</div><h1>Trender Intelligence</h1><p>Explore market signals and turn questions into a clearer next step.</p></div>
      <span className={`assistant-status ${connection}`}><span/>{statusLabel}</span>
      {messages.length > 0 && <button className="small-action assistant-reset" onClick={() => { setMessages([]); setConnection("preview"); }}><RotateCcw size={14}/> New chat</button>}
    </div>

    <div className="chat-workspace">
      {messages.length === 0 ? <div className="assistant-welcome">
        <div className="sparkle-circle"><Sparkles size={24}/></div>
        <span className="assistant-welcome-kicker">TRENDER AI</span>
        <h2>What would you like to understand?</h2>
        <p>Ask about market shifts, compare categories, or explore the data in your workspace.</p>
        <div className="suggestion-grid">{suggestions.map((suggestion, index) => <button key={suggestion} onClick={() => send(suggestion)}><span className="suggestion-index">0{index + 1}</span>{suggestion}<span className="suggestion-arrow">↗</span></button>)}</div>
      </div> : <div className="message-list" ref={messageList} aria-live="polite">
        {messages.map(message => message.role === "system" ? <div className="assistant-error" role="alert" key={message.id}><AlertCircle size={17}/><div><strong>AI request could not be completed</strong><p>{message.content}{message.content.toLowerCase().includes("not configured") ? " Add OPENROUTER_API_KEY and OPENROUTER_MODELS to the Vercel project environment, then redeploy." : ""}</p></div></div> :
          <article className={`chat-message ${message.role}`} key={message.id}>
            <div className={`message-avatar ${message.role === "assistant" ? "ai-avatar" : "user-avatar"}`}>{message.role === "assistant" ? <Bot size={17}/> : <UserRound size={17}/>}</div>
            <div className="message-body"><div className="message-meta"><span className="message-role">{message.role === "assistant" ? "Trender Intelligence" : "You"}</span>{message.source && <span className="message-source">{message.source}</span>}</div><MessageText content={message.content}/>{message.role === "assistant" && <button className="text-action" onClick={() => copyResponse(message)}>{copied === message.id ? <Check size={14}/> : <Copy size={14}/>} {copied === message.id ? "Copied" : "Copy response"}</button>}</div>
          </article>)}
        {loading && <div className="loading-response"><span className="thinking-dots"><i/><i/><i/></span>Reading the question and preparing an answer…</div>}
      </div>}

      <form className="chat-composer" onSubmit={event => { event.preventDefault(); send(); }}>
        <textarea value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about a market, category, region, or company…" aria-label="Message Trender Intelligence" rows={2} maxLength={6000} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }}/>
      <div className="composer-footer"><span><Sparkles size={13}/>{isHosted ? "Server-side OpenRouter · free model routing" : "Connect this workspace to Vercel to use its server-side AI route"}</span><span className="composer-count">{input.length}/6000</span><button className="primary-button" type="submit" disabled={!input.trim() || loading}><Send size={15}/> Send</button></div>
      </form>
    </div>
    <p className="data-disclaimer">AI responses are starting points for research. Verify decisions against current, traceable source data.</p>
  </div>;
}
