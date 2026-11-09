"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_EMAIL_CHARS, MAX_MESSAGE_CHARS, MIN_MESSAGE_CHARS, MIN_WORDING_CHARS } from "@/lib/contact/config";
import { NOTICES, SEND_NOTICES, errorCodeOf } from "@/lib/contact/notices";
import { LINKS } from "@/lib/site";

const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * "Want to talk?": the visitor writes a message in their own words and sends it.
 * With Resend set up, Send delivers it to Maksym's inbox (their address as
 * reply-to); otherwise "Send by email" opens their mail app. They can also copy
 * it and open X or LinkedIn. The form opens from a "Write a message" button.
 * Help with the wording is optional, and Undo brings their original back.
 */
export function MessageForm() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [canSend, setCanSend] = useState(false);
  const [original, setOriginal] = useState<string | null>(null);
  const [busy, setBusy] = useState<"wording" | "sending" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // The section starts as a calm invitation; the form opens on request.
  const [open, setOpen] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const message = text.trim();
  const canPolish = message.length >= MIN_WORDING_CHARS && !busy;
  // The email is optional; if they start typing one, it has to look real.
  const emailOk = email.trim() === "" || looksLikeEmail(email);
  const readyToSend = message.length >= MIN_MESSAGE_CHARS && emailOk && !busy;

  // Offer Send only when the server can actually deliver email.
  useEffect(() => {
    let live = true;
    fetch("/api/message")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { available?: unknown } | null) => live && setCanSend(d?.available === true))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  function edit(value: string) {
    setText(value.slice(0, MAX_MESSAGE_CHARS));
    setCopied(null);
    setNotice(null);
  }

  async function polish() {
    if (!canPolish) return;
    setNotice(null);
    setBusy("wording");
    try {
      const res = await fetch("/api/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about: message }),
      });
      if (!res.ok) {
        setNotice(NOTICES[await errorCodeOf(res, NOTICES)]);
        return;
      }
      const { note } = (await res.json()) as { note?: unknown };
      if (typeof note !== "string" || !note) throw new Error("empty");
      setOriginal(text);
      setText(note); // the server already cuts it to the box's length
    } catch {
      setNotice(NOTICES.error);
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    if (!readyToSend) return;
    setNotice(null);
    setBusy("sending");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), message, website: trap }),
      });
      if (!res.ok) {
        setNotice(SEND_NOTICES[await errorCodeOf(res, SEND_NOTICES)]);
        return;
      }
      setSentTo(email.trim());
      setText("");
      setOriginal(null);
    } catch {
      setNotice(SEND_NOTICES.error);
    } finally {
      setBusy(null);
    }
  }

  function openForm() {
    setOpen(true);
    setSentTo(null);
    requestAnimationFrame(() => textRef.current?.focus());
  }

  function closeForm() {
    setOpen(false);
    setNotice(null);
    setCopied(null);
  }

  function undo() {
    if (original === null) return;
    setText(original);
    setOriginal(null);
  }

  function copyAndOpen(where: string, url: string) {
    // Start the copy inside the click, then open the profile in a new tab.
    void navigator.clipboard?.writeText(message).catch(() => {});
    setCopied(where);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="chat" data-testid="intro">
      {/* The invitation; once the form opens it takes this place (the heading stays for screen readers). */}
      <div className={open ? "chat-intro sr-only" : "chat-intro"}>
        <p className="chat-kicker">Say hello</p>
        <h2 id="chat-title">
          Want to talk?
          <br />
          Write to me.
        </h2>
        <p className="chat-sub">
          Write it your way and send it however you like. If you&apos;d like help with the wording, there&apos;s a
          button for that.
        </p>
      </div>

      {!open ? (
        <button type="button" className="intro-cta" onClick={openForm}>
          Write a message
        </button>
      ) : sentTo !== null ? (
        <div className="intro-form intro-sent" role="status">
          <p className="intro-sent-title">Sent. Thank you.</p>
          <p className="chat-sub">{sentTo ? `I'll reply to ${sentTo}.` : "Thanks for the note."}</p>
          <div className="intro-links">
            <button type="button" onClick={openForm}>
              Write another
            </button>
            <button type="button" onClick={closeForm}>
              Close
            </button>
          </div>
        </div>
      ) : (
        <form
          className="intro-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="intro-head">
            <label htmlFor="intro-text" className="intro-label">
              Your message
            </label>
            <span className="intro-links">
              <button type="button" onClick={closeForm}>
                Close
              </button>
            </span>
          </div>
          <textarea
            ref={textRef}
            id="intro-text"
            className="intro-text"
            rows={5}
            maxLength={MAX_MESSAGE_CHARS}
            value={text}
            onChange={(e) => edit(e.target.value)}
            placeholder="Hi Maksym, …"
            aria-busy={busy === "wording"}
            data-testid="intro-text"
          />
          {/* A spam trap: hidden from people, often filled in by bots. */}
          <input
            className="intro-trap"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />

          {/* Everything is visible once the form is open; actions wait for a message. */}
          <div className="intro-row">
            <span className="intro-count">
              {text.length}/{MAX_MESSAGE_CHARS}
            </span>
            <span className="intro-links">
              {original !== null && !busy && (
                <button type="button" onClick={undo}>
                  Undo
                </button>
              )}
              <button type="button" onClick={() => void polish()} disabled={!canPolish}>
                {busy === "wording" ? "Wording it…" : "Help me word it"}
              </button>
            </span>
          </div>

          {canSend && (
            <div className="intro-email">
              <label htmlFor="intro-email" className="intro-label">
                Your email (optional, if you&apos;d like a reply)
              </label>
              <input
                id="intro-email"
                className="intro-text intro-input"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={MAX_EMAIL_CHARS}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          )}

          <div className="intro-actions">
            {canSend ? (
              <button type="submit" className="intro-primary" disabled={!readyToSend}>
                {busy === "sending" ? "Sending…" : "Send"}
              </button>
            ) : message.length === 0 ? (
              <button type="button" className="intro-primary" disabled>
                Send by email
              </button>
            ) : (
              <a
                className="intro-primary"
                href={`${LINKS.email}?subject=${encodeURIComponent("Hi from maksym.page")}&body=${encodeURIComponent(message)}`}
              >
                Send by email
              </a>
            )}
            <button type="button" onClick={() => copyAndOpen("X", LINKS.x)} disabled={message.length === 0}>
              Copy for X <span aria-hidden="true">↗</span>
            </button>
            <button
              type="button"
              onClick={() => copyAndOpen("LinkedIn", LINKS.linkedin)}
              disabled={message.length === 0}
            >
              Copy for LinkedIn <span aria-hidden="true">↗</span>
            </button>
          </div>

          <p className="intro-status" role="status">
            {notice ?? (copied ? `Copied. Paste it into a message on ${copied}.` : "")}
          </p>
        </form>
      )}
    </div>
  );
}
