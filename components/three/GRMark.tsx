"use client";

import { useEffect, useEffectEvent, useRef, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { motionState } from "@/lib/motion/engine";
import { useTick } from "@/lib/motion/hooks";
import type { MarkState } from "./stage";
import { stageStore } from "./stageStore";

export type { MarkState };

export const restingMark = (): MarkState => ({ a: 0, b: 0, rx: -4, ry: 0, y: 0, scale: 1 });

/**
 * Janela de uma marca "GR": a caixa no DOM define onde o palco WebGL desenha o
 * objeto (recorte por scissor). Sem WebGL, mostra a versão estática em CSS.
 * A sombra de chão (elipse difusa, 22% do corpo abaixo) é DOM, abaixo do canvas.
 */
export default function GRMark({
  stateRef,
  glyphPx,
  fallbackFontSize,
  className,
  style,
}: {
  stateRef: RefObject<MarkState>;
  /** altura da caixa-alta do "GR" em px, a partir da largura da janela */
  glyphPx: (vw: number) => number;
  /** corpo da fonte da versão estática, em CSS (ex.: "min(460px, 30vw)") */
  fallbackFontSize: string;
  className?: string;
  style?: CSSProperties;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const status = useSyncExternalStore(stageStore.subscribe, stageStore.getStatus, stageStore.getServerStatus);
  const readState = useEffectEvent(() => stateRef.current);
  const readGlyph = useEffectEvent(() => glyphPx(motionState.vw));

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    return stageStore.attach({ el, getState: () => readState(), glyphPx: () => readGlyph() });
  }, []);

  const lastGlyph = useRef(0);
  useTick("update", () => {
    const shadow = shadowRef.current;
    if (!shadow || status !== "webgl") return;
    const g = glyphPx(motionState.vw);
    if (g !== lastGlyph.current) {
      lastGlyph.current = g;
      shadow.style.width = `${g * 1.28}px`;
      shadow.style.height = `${g * 0.1}px`;
      shadow.style.marginLeft = `${-g * 0.64}px`;
      shadow.style.top = `calc(50% + ${g * 0.81}px)`;
    }
    const { a, b } = stateRef.current;
    const spread = Math.min(1, a + b * 0.5);
    shadow.style.transform = `scaleX(${1 - spread * 0.3})`;
    shadow.style.opacity = String(0.85 * (1 - spread * 0.55));
  });

  return (
    <div ref={boxRef} aria-hidden="true" className={className} style={{ pointerEvents: "none", ...style }}>
      <div
        ref={shadowRef}
        style={{
          position: "absolute",
          left: "50%",
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,0,0,.85), transparent)",
          filter: "blur(8px)",
          opacity: 0,
        }}
      />
      {status === "fallback" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="gr-mark-fallback" style={{ fontSize: fallbackFontSize }}>
            GR
          </span>
        </div>
      )}
    </div>
  );
}
