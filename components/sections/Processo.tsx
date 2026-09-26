"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import GRMark, { type MarkState } from "@/components/three/GRMark";
import { motionState } from "@/lib/motion/engine";
import { useScrollProgress, useTick } from "@/lib/motion/hooks";
import { clamp01, smoothstep } from "@/lib/motion/math";
import { INTENSITY, MEDIA } from "@/lib/motion/tokens";

/** Marca do Processo: corpo 11% da largura, máx. 170px. */
const procGlyphPx = (vw: number) => 0.71 * Math.min(170, vw * 0.11);

const STEPS = site.processo.etapas.length;
/** Trecho fixo em "passos": título sozinho, uma entrada por cartão, respiro final. */
const HOLD_START = 0.4;
const STEP = 0.85;
const HOLD_END = 0.35;
const UNITS = HOLD_START + STEPS * STEP + HOLD_END;

/**
 * Com movimento: seção fixa (como o Manifesto). Primeiro só o título; a cada
 * trecho de rolagem um cartão sobe de baixo e o anterior recua (escala 0,7,
 * giro de 5°) — a pilha do StickyCard (Skiper 17), lida do relógio único.
 * Movimento reduzido: os mesmos cartões em lista vertical.
 */
export default function Processo() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(sectionRef, "top top", "bottom bottom", MEDIA.processStack);
  const mark = useRef<MarkState>({ a: 0, b: 0, rx: -16, ry: 28, y: 0, scale: 1 });
  const last = useRef(-1);

  useTick("update", (t) => {
    const p = progress.current.p;
    const k = INTENSITY;
    const s = mark.current;
    // Começa inteiriço; fragmenta enquanto o título sai e os cartões entram.
    s.a = smoothstep(0.02, 0.35, p);
    s.b = smoothstep(0.4, 0.85, p);
    s.rx = -16 + motionState.pointer.sy * 6 * k;
    s.ry = 28 + p * 40 + motionState.pointer.sx * 10 * k;
    s.y = Math.sin(t * 0.7) * 5 * k;

    if (p === last.current) return;
    last.current = p;
    const u = (p * UNITS - HOLD_START) / STEP;

    const head = headRef.current;
    if (head) {
      const c = clamp01(u);
      head.style.transform = `scale(${1 - 0.12 * c})`;
      head.style.opacity = String(1 - c);
    }
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const enter = clamp01(u - i);
      const cover = i < STEPS - 1 ? clamp01(u - i - 1) : 0;
      card.style.transform = `translate3d(-50%, calc(-50% + ${(1 - enter) * 105}vh), 0) scale(${1 - 0.3 * cover}) rotate(${5 * cover}deg)`;
      card.style.visibility = enter > 0 ? "visible" : "hidden";
      const dim = dimRefs.current[i];
      if (dim) dim.style.opacity = String(0.6 * cover);
    });
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${clamp01(u / STEPS)})`;
  });

  return (
    <div id="processo">
      <section ref={sectionRef} className="proc-stack" style={{ position: "relative", height: `${100 + UNITS * 100}vh`, background: "var(--bg)" }}>
        {/* sticky cria contexto de empilhamento: z-index 3 põe os cartões à frente do canvas WebGL (z 2) */}
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", zIndex: 3 }}>
          <div aria-hidden="true" className="proc-grid" />
          <div className="proc-eyebrows">
            <span>{site.processo.eyebrow}</span>
            <span>{site.processo.subEyebrow}</span>
          </div>

          <GRMark
            stateRef={mark}
            glyphPx={procGlyphPx}
            fallbackFontSize="min(170px, 11vw)"
            className="proc-mark"
          />

          <div ref={headRef} className="proc-head">
            <h2 style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <span className="proc-title">{site.processo.tituloLinha1}</span>
              <span className="proc-title-italic">{site.processo.tituloItalico}</span>
            </h2>
            <p style={{ margin: 0, maxWidth: 480, font: "400 17px/1.6 var(--font-sans)", color: "var(--silver)", textWrap: "balance" }}>
              {site.processo.paragrafo}
            </p>
          </div>

          {site.processo.etapas.map((s, i) => (
            <StepCard
              key={s.n}
              step={s}
              index={i}
              className="proc-card--stacked"
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
              dimRef={(el) => {
                dimRefs.current[i] = el;
              }}
            />
          ))}

          <div className="proc-progress">
            <div className="proc-progress-labels">
              {site.processo.etapas.map((s) => (
                <span key={s.n}>
                  {s.n} {s.titulo}
                </span>
              ))}
            </div>
            <div style={{ position: "relative", height: 1, background: "rgba(214,222,235,.12)" }}>
              <div
                ref={fillRef}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,var(--blue),var(--ice))", transformOrigin: "left", transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="proc-list" style={{ position: "relative", padding: "clamp(100px,14vh,160px) var(--m) 60px", background: "var(--bg)" }}>
        <span style={{ display: "block", marginBottom: 22, font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mute)" }}>
          {site.processo.eyebrow}
        </span>
        <h2 style={{ margin: "0 0 20px", display: "flex", flexDirection: "column" }}>
          <span style={{ overflow: "hidden" }}>
            <Reveal variant="mask">
              <span className="proc-title" style={{ display: "block" }}>
                {site.processo.tituloLinha1}
              </span>
            </Reveal>
          </span>
          <span style={{ overflow: "hidden" }}>
            <Reveal variant="mask" delay={100}>
              <span className="proc-title-italic" style={{ display: "block" }}>
                {site.processo.tituloItalico}
              </span>
            </Reveal>
          </span>
        </h2>
        <p style={{ margin: "0 0 56px", maxWidth: 440, font: "400 16px/1.6 var(--font-sans)", color: "var(--silver)" }}>{site.processo.paragrafo}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {site.processo.etapas.map((s, i) => (
            <Reveal key={s.n}>
              <StepCard step={s} index={i} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

type Step = (typeof site.processo.etapas)[number];

function StepCard({
  step,
  index,
  className = "",
  cardRef,
  dimRef,
}: {
  step: Step;
  index: number;
  className?: string;
  cardRef?: (el: HTMLElement | null) => void;
  dimRef?: (el: HTMLDivElement | null) => void;
}) {
  const longest = Math.max(...step.titulo.split(" ").map((w) => w.length));
  return (
    <article ref={cardRef} className={`proc-card proc-card--${index + 1} ${className}`}>
      <span aria-hidden="true" className="proc-card-num">
        {step.n}
      </span>
      <div className="proc-card-main">
        <span className="proc-card-label">
          {site.processo.rotuloEtapa} {step.n} / 0{STEPS}
        </span>
        <h3
          className="proc-card-title"
          // Reduz só se a palavra mais longa não couber na coluna (≈0,5em por caractere).
          style={{ fontSize: `min(clamp(38px,4.4vw,76px), calc(100cqi / ${longest * 0.5}))` }}
        >
          {step.titulo}
        </h3>
        <p className="proc-card-desc">{step.descricao}</p>
      </div>
      <div className="proc-card-side">
        <span className="proc-card-kicker">{site.processo.rotuloNestaEtapa}</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {step.itens.map((it) => (
            <span key={it} className="proc-card-item">
              {it}
              <span aria-hidden="true" className="proc-card-plus">
                +
              </span>
            </span>
          ))}
        </div>
        <div className="proc-card-receive">
          <span className="proc-card-kicker proc-card-kicker--accent">{site.processo.rotuloVoceRecebe}</span>
          <span style={{ font: "500 15px/1.4 var(--font-sans)" }}>{step.entrega}</span>
        </div>
      </div>
      {dimRef && <div ref={dimRef} aria-hidden="true" className="proc-card-dim" />}
    </article>
  );
}
