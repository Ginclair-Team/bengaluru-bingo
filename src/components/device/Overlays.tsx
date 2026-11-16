"use client";

import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { CONTROLS } from "./controls";

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** Keep Tab inside a dialog. */
function trapTab(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== "Tab") return;
  const nodes = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

export type MenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

/** A list of rows that are real buttons. The selected row is inverted. */
export function MenuList({
  items,
  selected,
  onSelect,
  onActivate,
  listRef,
  label,
}: {
  items: MenuItem[];
  selected: number;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
  listRef: RefObject<HTMLUListElement>;
  label: string;
}) {
  return (
    <ul className="menu" ref={listRef} aria-label={label}>
      {items.map((item, i) => (
        <li key={item.id} data-row>
          <button
            type="button"
            className="menu-row"
            data-selected={selected === i}
            data-autofocus={selected === i}
            aria-disabled={item.disabled || undefined}
            onFocus={() => onSelect(i)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") onSelect(i);
            }}
            onClick={() => onActivate(i)}
          >
            <span className="caret" aria-hidden="true">
              {">"}
            </span>
            {item.icon}
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** SELECT: pause menu over a dithered stage. */
export function PauseMenu(props: {
  items: MenuItem[];
  selected: number;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
  listRef: RefObject<HTMLUListElement>;
}) {
  return (
    <>
      <div className="dim-stage" aria-hidden="true" />
      <div className="overlay">
        <div className="dlg dlg--menu" role="dialog" aria-modal="true" aria-label="Menu" onKeyDown={trapTab}>
          <MenuList {...props} label="Menu" />
        </div>
      </div>
    </>
  );
}

export function ConfirmClear({
  count,
  selected,
  onSelect,
  onKeep,
  onClear,
}: {
  count: number;
  selected: 0 | 1;
  onSelect: (i: 0 | 1) => void;
  onKeep: () => void;
  onClear: () => void;
}) {
  return (
    <>
      <div className="dim-stage" aria-hidden="true" />
      <div className="overlay">
        <div
          className="dlg dlg--confirm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onKeyDown={trapTab}
        >
          <p id="confirm-title" className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))", lineHeight: 1.3 }}>
            Lift all {count} stamp{count === 1 ? "" : "s"}?
          </p>
          <div style={{ display: "flex", gap: "calc(8 * var(--u))" }}>
            <button
              type="button"
              className="lcd-btn lcd-btn--primary"
              data-selected={selected === 0}
              data-autofocus={selected === 0}
              onFocus={() => onSelect(0)}
              onClick={onKeep}
            >
              Keep them
            </button>
            <button
              type="button"
              className="lcd-btn"
              data-selected={selected === 1}
              data-autofocus={selected === 1}
              onFocus={() => onSelect(1)}
              onClick={onClear}
            >
              Yes, clear
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function LinkInfo({
  status,
  onCopy,
}: {
  status: string;
  onCopy: () => void;
}) {
  return (
    <>
      <div className="dim-stage" aria-hidden="true" />
      <div className="overlay">
        <div
          className="dlg dlg--panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-title"
          onKeyDown={trapTab}
        >
          <h2 id="link-title" className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))" }}>
            Link cable
          </h2>
          <p className="t-body-lcd" style={{ margin: 0 }}>
            Send your link to a friend. When they stamp their own card, the two join into one Bingo
            Journey: what you&apos;ve both done, and what to try together.
          </p>
          <div style={{ display: "flex" }}>
            <button type="button" className="lcd-btn lcd-btn--primary" data-autofocus="true" onClick={onCopy}>
              Copy my link
            </button>
          </div>
          <p role="status" className="t-body-lcd" style={{ margin: 0, minHeight: "1.2em" }}>
            {status}
          </p>
        </div>
      </div>
    </>
  );
}

export function Help({ onClose }: { onClose: () => void }) {
  // Esc and B are handled by the Game; this button is the tap / click route.
  return (
    <>
      <div className="dim-stage" aria-hidden="true" />
      <div className="overlay">
        <div
          className="dlg dlg--panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
          onKeyDown={trapTab}
          style={{ width: "calc(276 * var(--u))" }}
        >
          <h2 id="help-title" className="t-ui-l" style={{ margin: 0, fontSize: "max(12px, calc(14 * var(--u)))" }}>
            How to play
          </h2>
          <p className="t-body-lcd" style={{ margin: 0 }}>
            Stamp every Bengaluru thing you have actually done. Press START to see how native you are.
          </p>
          <div className="help-table">
            {CONTROLS.map((row) => (
              <HelpRow key={row.action} keys={row.keys} action={row.action} />
            ))}
          </div>
          <div style={{ display: "flex" }}>
            <button type="button" className="lcd-btn lcd-btn--primary" data-autofocus="true" onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function HelpRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <>
      <span className="help-keys">
        {keys.map((k) => (
          <span key={k} className="keycap">
            {k}
          </span>
        ))}
      </span>
      <span className="t-body-lcd">{action}</span>
    </>
  );
}
