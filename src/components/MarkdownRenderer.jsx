import React from "react";

function parseInline(text) {
  if (!text) return null;
  // Splits text by markdown tokens: **bold**, `code`, *italic*, [link](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="inline-code">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} target="_blank" rel="noreferrer" className="inline-link">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function parseTable(lines) {
  const rows = lines
    .map(l => l.trim())
    .filter(l => l.startsWith("|") && l.endsWith("|"))
    .map(l => l.slice(1, -1).split("|").map(cell => cell.trim()));

  if (rows.length < 2) return null;

  const header = rows[0];
  // check if second row is separator like :--- or ---
  const isSeparator = rows[1].every(cell => /^:?-+:?$/.test(cell));
  const dataRows = isSeparator ? rows.slice(2) : rows.slice(1);

  return (
    <div className="table-scroll ai-table-wrapper" key="table">
      <table className="ai-markdown-table">
        <thead>
          <tr>
            {header.map((col, idx) => (
              <th key={idx}>{parseInline(col)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>{parseInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let tableBuffer = [];
  let listBuffer = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  function flushTable() {
    if (tableBuffer.length) {
      const tableElem = parseTable(tableBuffer);
      if (tableElem) elements.push(tableElem);
      else {
        tableBuffer.forEach((l, i) => elements.push(<p key={`tbl-fallback-${elements.length}-${i}`}>{parseInline(l)}</p>));
      }
      tableBuffer = [];
    }
  }

  function flushList() {
    if (listBuffer.length) {
      elements.push(
        <ul className="ai-markdown-list" key={`list-${elements.length}`}>
          {listBuffer.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${index}`} className="ai-code-block">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushTable();
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Markdown Table rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      tableBuffer.push(trimmed);
      return;
    } else {
      flushTable();
    }

    // Lists (- or * or numbered 1. )
    if (/^[-*]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s+/, ""));
      return;
    }
    flushList();

    // Empty lines
    if (!trimmed) {
      elements.push(<div className="message-line-space" key={`space-${index}`} />);
      return;
    }

    // Horizontal rule
    if (/^---+$|^===+$/.test(trimmed)) {
      elements.push(<hr key={`hr-${index}`} className="ai-divider" />);
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote key={`quote-${index}`} className="ai-blockquote">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(<h4 key={`h3-${index}`} className="ai-h3">{parseInline(trimmed.slice(4))}</h4>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(<h3 key={`h2-${index}`} className="ai-h2">{parseInline(trimmed.slice(3))}</h3>);
      return;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(<h2 key={`h1-${index}`} className="ai-h1">{parseInline(trimmed.slice(2))}</h2>);
      return;
    }

    // Regular paragraph
    elements.push(<p key={`p-${index}`} className="ai-p">{parseInline(trimmed)}</p>);
  });

  flushTable();
  flushList();

  return <div className="message-text ai-formatted-content">{elements}</div>;
}
