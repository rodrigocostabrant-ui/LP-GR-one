"use client";

import { useEffect, useRef } from "react";
import { frameLerp } from "@/lib/motion/math";
import { motionState } from "@/lib/motion/engine";
import { useTick } from "@/lib/motion/hooks";
import { FOLLOW } from "@/lib/motion/tokens";

const REST = { size: 38, bg: "transparent", border: "rgba(238,241,245,.45)" };

/**
 * Cursor customizado: ponto que segue o mouse sem atraso (modo diferença) e anel
 * com amortecimento de 0,2 que cresce sobre links e ganha rótulo com
 * `data-cursor`. Só com (pointer: fine); desenhado na fase `render` do relógio.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const ring = useRef({
    x: -100,
    y: -100,
    visible: false,
    target: null as Element | null,
    /** alvo lido (pointerover ou varredura na rolagem), aplicado na fase `render` */
    pending: undefined as Element | null | undefined,
    scrollY: 0,
    lastScan: 0,
  });

  const applyTarget = (target: Element | null) => {
    const r = ring.current;
    const el = target?.closest("[data-cursor],a,button,[role='slider']") ?? null;
    if (el === r.target) return;
    r.target = el;
    const inner = innerRef.current;
    const lbl = labelRef.current;
    if (!inner || !lbl) return;
    const label = el?.getAttribute("data-cursor") ?? "";
    const size = label ? 86 : el ? 58 : REST.size;
    inner.style.width = `${size}px`;
    inner.style.height = `${size}px`;
    inner.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
    inner.style.background = label ? "var(--ink)" : REST.bg;
    inner.style.borderColor = label ? "var(--ink)" : el ? "rgba(175,196,255,.8)" : REST.border;
    lbl.textContent = label;
    lbl.style.opacity = label ? "1" : "0";
  };

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("gr-cursor");
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse") ring.current.pending = e.target as Element;
    };
    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.body.classList.remove("gr-cursor");
    };
  }, []);

  // Só leitura aqui (fase `measure`): página rolando sob o mouse parado muda o
  // alvo sem `pointerover`. A escrita no DOM fica para a fase `render`.
  useTick("measure", (time) => {
    const r = ring.current;
    const p = motionState.pointer;
    if (p.active && motionState.scrollY !== r.scrollY && time - r.lastScan > 0.1) {
      r.scrollY = motionState.scrollY;
      r.lastScan = time;
      r.pending = document.elementFromPoint(p.x, p.y);
    }
  });

  useTick("render", (_, dt) => {
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;
    const r = ring.current;
    if (r.pending !== undefined) {
      applyTarget(r.pending);
      r.pending = undefined;
    }
    const p = motionState.pointer;
    const visible = p.active && motionState.finePointer;
    if (visible !== r.visible) {
      r.visible = visible;
      dot.style.opacity = ringEl.style.opacity = visible ? "1" : "0";
      if (visible) {
        r.x = p.x;
        r.y = p.y;
      }
    }
    if (!visible) return;
    const k = frameLerp(FOLLOW.cursorRing, dt);
    r.x += (p.x - r.x) * k;
    r.y += (p.y - r.y) * k;
    dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    ringEl.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
  });

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          margin: "-3px 0 0 -3px",
          borderRadius: "50%",
          background: "var(--ink)",
          zIndex: 120,
          pointerEvents: "none",
          mixBlendMode: "difference",
          opacity: 0,
          transition: "opacity .3s",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{ position: "fixed", left: 0, top: 0, zIndex: 119, pointerEvents: "none", opacity: 0, transition: "opacity .3s", mixBlendMode: "difference" }}
      >
        <div
          ref={innerRef}
          style={{
            width: REST.size,
            height: REST.size,
            margin: `${-REST.size / 2}px 0 0 ${-REST.size / 2}px`,
            borderRadius: "50%",
            border: `1px solid ${REST.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "width .45s var(--ease-entrada), height .45s var(--ease-entrada), margin .45s var(--ease-entrada), background .35s, border-color .35s",
          }}
        >
          <span
            ref={labelRef}
            style={{
              font: "500 9px/1 var(--font-mono)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--bg)",
              opacity: 0,
              transition: "opacity .25s",
            }}
          />
        </div>
      </div>
    </>
  );
}
