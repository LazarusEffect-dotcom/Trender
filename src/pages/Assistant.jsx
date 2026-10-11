import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, Check, Copy, RotateCcw, Send, Sparkles, UserRound } from "lucide-react";
import { categoryData, regionData } from "../data/demoData.js";

const suggestions = [
  "Which sample categories are growing fastest?",
  "What signals should I monitor this quarter?",
  "How do I compare company performance with a market index?",
  "Summarize the regional momentum in this workspace.",
];

function previewAnswer(question) {
  const leadingCategory = [...categoryData].sort((a, b) => b.growth - a.growth)[0];
  const leadingRegion = [...regionData].sort((a, b) => b.momentum - a.momentum)[0];
  const decliningCategory = [...categoryData].sort((a, b) => a.growth - b.growth)[0];
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("region") || lowerQuestion.includes("geograph") || lowerQuestion.includes("country")) {
    return `## Regional readout\n\n- **Sample leader:** ${leadingRegion.region} has the highest momentum index in this workspace (${leadingRegion.momentum}%).\n- **Next strongest:** ${[...regionData].sort((a, b) => b.momentum - a.momentum)[1].region} follows at ${[...regionData].sort((a, b) => b.momentum - a.momentum)[1].momentum}%.\n- **How to use this:** compare the same period, market definition, and source coverage before prioritizing a region.\n\nThese are illustrative demo values, not current market measurements.`;
  }

  if (lowerQuestion.includes("category") || lowerQuestion.includes("consumer") || lowerQuestion.includes("fastest")) {
    return `## Category signals\n\n- **Fastest growth in the sample:** ${leadingCategory.name} at ${leadingCategory.growth}% annual growth. Its demand index is ${leadingCategory.demand}.\n- **Worth watching:** ${categoryData.find(item => item.status === "Emerging")?.name} is marked emerging, with ${categoryData.find(item => item.status === "Emerging")?.growth}% growth.\n- **Downside signal:** ${decliningCategory.name} is at ${decliningCategory.growth}%, so check whether this reflects broad demand or a narrower mix effect.\n\nThe category figures are illustrative sample data, not live market estimates.`;
  }

  if (lowerQuestion.includes("company") || lowerQuestion.includes("compare") || lowerQuestion.includes("sales")) {
    return `## A useful comparison\n\n1. Align the company and market data by geography, category, unit, and reporting period.\n2. Compare growth rates over the same window; an index level alone does not show revenue or market share.\n3. Investigate gaps through pricing, channel coverage, customer mix, seasonality, and supply.\n4. Keep source dates beside the result so an outdated benchmark does not look current.\n\nThis workspace's comparison numbers are illustrative. Upload a dataset in **Company Data** to preview your own file locally.`;
  }

  return `## Signals to monitor\n\n- **Category momentum:** ${leadingCategory.name} leads the illustrative sample at ${leadingCategory.growth}% annual growth.\n- **Regional momentum:** ${leadingRegion.region} has the strongest sample index at ${leadingRegion.momentum}%.\n- **Potential watch-out:** ${decliningCategory.name} is the weakest sample category at ${decliningCategory.growth}%.\n\nFor “${question}”, first confirm the source, date, geography, and metric definition behind any signal. These workspace values are examples, not live market data.`;
}

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
  const [copied, setCopied] = useState("");
  const messageList = useRef(null);
  const isHosted = !["localhost", "127.0.0.1"].includes(window.location.hostname);

  useEffect(() => {
    if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messages, loading]);

  async function send(text = input) {
    const question = text.trim();
    if (!question || loading) return;

    const history = messages.filter(message => message.role !== "system").slice(-10).map(({ role, content }) => ({ role, content }));
    const userMessage = { role: "user", content: question, id: `${Date.now()}-user` };
    setMessages(previous => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    if (!isHosted) {
      setMessages(previous => [...previous, { role: "assistant", content: previewAnswer(question), source: "Preview AI · sample data", id: `${Date.now()}-preview` }]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Trender AI could not complete that request.");
      if (typeof result.text !== "string" || !result.text.trim()) throw new Error("Trender AI returned an empty response. Please try again.");
      setConnection("ready");
      setMessages(previous => [...previous, { role: "assistant", content: result.text, source: "Trender AI", id: `${Date.now()}-ai` }]);
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

  const statusLabel = connection === "ready" ? "AI CONNECTED" : connection === "error" ? "AI UNAVAILABLE" : isHosted ? "CONNECTION PENDING" : "PREVIEW AI";
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
        {messages.map(message => message.role === "system" ? <div className="assistant-error" role="alert" key={message.id}><AlertCircle size={17}/><div><strong>AI request could not be completed</strong><p>{message.content}{message.content.toLowerCase().includes("configure") || message.content.toLowerCase().includes("gemini") ? " Add GEMINI_API_KEY to the Vercel project environment, then redeploy." : ""}</p></div></div> :
          <article className={`chat-message ${message.role}`} key={message.id}>
            <div className={`message-avatar ${message.role === "assistant" ? "ai-avatar" : "user-avatar"}`}>{message.role === "assistant" ? <Bot size={17}/> : <UserRound size={17}/>}</div>
            <div className="message-body"><div className="message-meta"><span className="message-role">{message.role === "assistant" ? "Trender Intelligence" : "You"}</span>{message.source && <span className="message-source">{message.source}</span>}</div><MessageText content={message.content}/>{message.role === "assistant" && <button className="text-action" onClick={() => copyResponse(message)}>{copied === message.id ? <Check size={14}/> : <Copy size={14}/>} {copied === message.id ? "Copied" : "Copy response"}</button>}</div>
          </article>)}
        {loading && <div className="loading-response"><span className="thinking-dots"><i/><i/><i/></span>Reading the question and preparing an answer…</div>}
      </div>}

      <form className="chat-composer" onSubmit={event => { event.preventDefault(); send(); }}>
        <textarea value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about a market, category, region, or company…" aria-label="Message Trender Intelligence" rows={2} maxLength={6000} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }}/>
        <div className="composer-footer"><span><Sparkles size={13}/>{isHosted ? "Powered by your secure server-side AI connection" : "Preview answers use illustrative workspace data"}</span><span className="composer-count">{input.length}/6000</span><button className="primary-button" type="submit" disabled={!input.trim() || loading}><Send size={15}/> Send</button></div>
      </form>
    </div>
    <p className="data-disclaimer">AI responses are starting points for research. Verify decisions against current, traceable source data.</p>
  </div>;
}
