import React from "react";

// #2.8 — lightweight formatting for community posts, comments and announcements.
//
// WHY NOT A WYSIWYG: the obvious route is react-simple-wysiwyg (already a
// dependency) which emits HTML, then render it with dangerouslySetInnerHTML.
// That is safe enough for course descriptions, which only admins write, but
// community posts are written by STUDENTS. Rendering their HTML would be a
// stored XSS hole — one `<img onerror=...>` post would execute in every
// classmate's and every admin's browser. Neither project has a sanitizer.
//
// So formatting is parsed into React elements instead. React escapes text
// content, so there is no path from a post to executable markup, and no new
// dependency. Supported: **bold**, *italic*, `code`, bulleted and numbered
// lists, links and @mentions.

const INLINE =
  /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|https?:\/\/[^\s<]+|@[A-Za-z0-9._-]{2,40})/g;

/** Formats one line: bold, italic, code, links, mentions. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    // Even indices are plain text between matches.
    if (i % 2 === 0) return <React.Fragment key={key}>{part}</React.Fragment>;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="px-1 rounded bg-light">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("@")) {
      return (
        <span key={key} className="text-primary fw-semibold">
          {part}
        </span>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        // rel="noopener noreferrer" matters here: these are links a student
        // supplied, so the target must not get a handle on our window.
        <a key={key} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/**
 * Renders formatted text as React elements.
 * Consecutive "- " or "1. " lines are grouped into a single list.
 */
export function renderRichText(input: string): React.ReactNode {
  const lines = String(input ?? "").split("\n");
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];

  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="mb-2 ps-4">
          {bullets.map((b, i) => (
            <li key={i}>{renderInline(b, `ul${out.length}-${i}`)}</li>
          ))}
        </ul>
      );
      bullets = [];
    }
    if (numbers.length) {
      out.push(
        <ol key={`ol-${out.length}`} className="mb-2 ps-4">
          {numbers.map((n, i) => (
            <li key={i}>{renderInline(n, `ol${out.length}-${i}`)}</li>
          ))}
        </ol>
      );
      numbers = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (bullet) {
      if (numbers.length) flush();
      bullets.push(bullet[1]);
      return;
    }
    if (numbered) {
      if (bullets.length) flush();
      numbers.push(numbered[1]);
      return;
    }

    flush();
    if (line.trim() === "") {
      // Preserve a deliberate blank line as spacing, but don't stack them.
      if (out.length) out.push(<br key={`br-${idx}`} />);
      return;
    }
    out.push(
      <div key={`p-${idx}`}>{renderInline(line, `p${idx}`)}</div>
    );
  });

  flush();
  return out;
}

/** Short plain-text preview (notifications, list rows) with markers stripped. */
export function toPlainText(input: string, max = 140): string {
  const s = String(input ?? "")
    .replace(/\*\*|`|^\s*[-*+]\s+|^\s*\d+[.)]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
