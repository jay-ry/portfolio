"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { findCommand, matchCommands, type CommandDef } from "@/lib/chat/commands";
import { CHAT_LIMITS } from "@/lib/chat/types";
import { useChatSession } from "./ChatProvider";
import { CommandMenu } from "./CommandMenu";

export type ChatInputHandle = {
  focus: () => void;
};

const LISTBOX_ID = "chat-command-menu";

export const ChatInput = forwardRef<ChatInputHandle>(function ChatInput(_, ref) {
  const { sendMessage, isStreaming, cancelStream } = useChatSession();
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      // preventScroll: the panel is position:fixed, so there is nothing to
      // scroll to — and a scrolling refocus would fight Lenis for the page's
      // scroll position.
      focus: () => textareaRef.current?.focus({ preventScroll: true }),
    }),
    [],
  );

  // The autocomplete belongs to the command TOKEN only. The moment the value
  // contains whitespace the user has chosen a command and is typing arguments,
  // so the menu must get out of the way — otherwise completing "/skills" to
  // "/skills " re-opens the menu, Enter completes again instead of submitting,
  // and the command can never be run at all.
  const isCommandInput = /^\/\S*$/.test(value);
  const matches = useMemo<CommandDef[]>(
    () => (isCommandInput ? matchCommands(value) : []),
    [isCommandInput, value],
  );
  const menuOpen = isCommandInput && matches.length > 0 && !dismissed;
  const safeActiveIndex = Math.min(activeIndex, Math.max(matches.length - 1, 0));

  const overLimit = value.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH;
  const nearLimit = value.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH * 0.8;
  const canSubmit = value.trim().length > 0 && !overLimit && !isStreaming;

  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const completeCommand = (cmd: CommandDef) => {
    setValue(`/${cmd.name} `);
    setActiveIndex(0);
    setDismissed(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const submit = () => {
    if (!canSubmit) return;
    sendMessage(value);
    setValue("");
    setActiveIndex(0);
    setDismissed(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div style={{ position: "relative", borderTop: "1px solid var(--border)", padding: "0.85rem 1rem", flexShrink: 0 }}>
      {menuOpen && (
        <CommandMenu
          id={LISTBOX_ID}
          matches={matches}
          activeIndex={safeActiveIndex}
          onHover={setActiveIndex}
          onSelect={completeCommand}
        />
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.6rem" }}>
        <span aria-hidden="true" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", paddingBottom: "8px" }}>
          &gt;
        </span>
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          // readOnly, never disabled. Disabling a focused element blurs it,
          // and the browser drops focus all the way to <body> — which killed
          // Escape (the handler lives on the panel div, so no keydown ever
          // reached it), defeated the mobile focus trap (Tab walked out into
          // the page behind the "modal"), and never gave focus back when the
          // stream ended. readOnly keeps the caret in the box for the whole
          // stream; `canSubmit` already carries the !isStreaming guard, so
          // Enter still can't send mid-stream.
          readOnly={isStreaming}
          aria-busy={isStreaming}
          placeholder="Ask about Jay's work..."
          aria-label="Message"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? LISTBOX_ID : undefined}
          aria-activedescendant={menuOpen ? `${LISTBOX_ID}-option-${safeActiveIndex}` : undefined}
          aria-autocomplete="list"
          onChange={(e) => {
            setValue(e.target.value);
            setActiveIndex(0);
            setDismissed(false);
            resize(e.target);
          }}
          onKeyDown={(e) => {
            if (menuOpen) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => (i + 1) % matches.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
                return;
              }
              if (e.key === "Tab") {
                e.preventDefault();
                completeCommand(matches[safeActiveIndex]);
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                // Already a whole command? Run it. Making someone press Enter
                // twice on "/skills" just because the menu happens to be open
                // is the kind of thing that reads as "the button is broken".
                // Tab is still the completion key either way.
                if (findCommand(value.slice(1).trim())) submit();
                else completeCommand(matches[safeActiveIndex]);
                return;
              }
              if (e.key === "Escape") {
                // Dismiss the autocomplete only. Propagation is stopped so
                // the event never reaches the overlay's Escape handler —
                // letting it through would close the whole chat, which isn't
                // what a user dismissing a popup expects. With the menu shut,
                // a second Escape falls through and closes the chat.
                e.stopPropagation();
                setDismissed(true);
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          style={{
            flex: 1,
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            lineHeight: 1.5,
            maxHeight: "120px",
            cursor: "text",
          }}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={cancelStream}
            aria-label="Stop response"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--accent2)",
              background: "transparent",
              border: "1px solid var(--accent2)",
              padding: "6px 12px",
              cursor: "pointer",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            }}
          >
            [STOP]
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Send message"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--accent)",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "6px 12px",
              cursor: canSubmit ? "pointer" : "default",
              opacity: canSubmit ? 1 : 0.4,
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            }}
          >
            SEND
          </button>
        )}
      </div>
      {nearLimit && (
        <div
          style={{
            marginTop: "0.35rem",
            textAlign: "right",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: overLimit ? "var(--accent2)" : "var(--text-muted)",
          }}
        >
          {value.length}/{CHAT_LIMITS.MAX_MESSAGE_LENGTH}
        </div>
      )}
    </div>
  );
});
