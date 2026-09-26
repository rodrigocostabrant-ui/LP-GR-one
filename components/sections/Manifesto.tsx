"use client";

import { useRef, type CSSProperties } from "react";
import { site } from "@/content/site";
import { motionState } from "@/lib/motion/engine";
import { useScrollProgress, useTick } from "@/lib/motion/hooks";
import { smoothstep } from "@/lib/motion/math";

const LETTERS = [...site.manifesto.palavraFragmentada];

/** Vetores de dispersão fixos [x vw, y vh, rotação°, escala] — `V` do protótipo. */
const VECTORS: [number, number, number, number][] = [
  [-38, -30, -40, 0.2],
  [-16, 32, 25, -0.1],
  [4, -38, -15, 0.3],
  [14, 36, 35, -0.2],
  [30, -26, -28, 0.15],
  [40, 20, 50, 0.4],
];

const SILVER_TEXT: CSSProperties = {
  background: "linear-gradient(180deg,#FFFFFF 15%,#AEB6C4 60%,#59626F 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** A interface que se desenha no fim do manifesto (56–100%): `x` cresce na horizontal. */
const WIREFRAME: { x?: boolean; style: CSSProperties }[] = [
  { style: { inset: 0, border: "1px solid rgba(214,222,235,.28)", borderRadius: 12 } },
  { x: true, style: { left: 0, right: 0, top: "12%", height: 1, background: "rgba(214,222,235,.22)", transformOrigin: "left" } },
  { x: true, style: { left: "4%", top: "5%", width: "8%", height: "2.2%", background: "linear-gradient(90deg,#fff,#8E97A6)", borderRadius: 2, transformOrigin: "left" } },
  { x: true, style: { right: "4%", top: "4.2%", width: "11%", height: "3.6%", border: "1px solid var(--blue)", borderRadius: 99, transformOrigin: "right" } },
  { x: true, style: { left: "5%", top: "26%", width: "40%", height: "9%", background: "linear-gradient(90deg,rgba(238,241,245,.9),rgba(238,241,245,.35))", borderRadius: 2, transformOrigin: "left" } },
  { x: true, style: { left: "5%", top: "38%", width: "28%", height: "9%", background: "linear-gradient(90deg,rgba(185,193,206,.7),rgba(185,193,206,.2))", borderRadius: 2, transformOrigin: "left" } },
  { x: true, style: { left: "5%", top: "54%", width: "30%", height: "1.4%", background: "rgba(214,222,235,.3)", transformOrigin: "left" } },
  { x: true, style: { left: "5%", top: "59%", width: "24%", height: "1.4%", background: "rgba(214,222,235,.3)", transformOrigin: "left" } },
  { x: true, style: { left: "5%", top: "70%", width: "15%", height: "8%", background: "var(--blue)", borderRadius: 99, transformOrigin: "left" } },
  {
    style: {
      left: "54%",
      top: "22%",
      width: "41%",
      height: "66%",
      borderRadius: 6,
      background: "linear-gradient(145deg,rgba(61,109,255,.35),rgba(10,28,74,.4) 50%,rgba(175,196,255,.12))",
      border: "1px solid rgba(175,196,255,.25)",
    },
  },
];

/**
 * Seção fixa por 340vh, tudo lido de um único progresso p (0–1):
 *   0–42%  palavras se afastam (±38vw) e somem entre 28–48%
 *  20–56%  letras de COMUM se fragmentam pelos vetores fixos
 *  46–60%  a pergunta surge
 *  56–100% uma interface se desenha (cascata de 2,8%)
 */
export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordA = useRef<HTMLSpanElement>(null);
  const wordB = useRef<HTMLSpanElement>(null);
  const question = useRef<HTMLDivElement>(null);
  const letters = useRef<HTMLSpanElement[]>([]);
  const wire = useRef<HTMLDivElement[]>([]);
  const progress = useScrollProgress(sectionRef, "top top", "bottom bottom");
  const last = useRef(-1);

  useTick("update", () => {
    if (motionState.reduced) return;
    const p = progress.current.p;
    if (p === last.current) return;
    last.current = p;

    const sep = smoothstep(0.04, 0.42, p);
    const fade = String(1 - smoothstep(0.28, 0.48, p));
    if (wordA.current) {
      wordA.current.style.transform = `translate3d(${-sep * 38}vw,0,0)`;
      wordA.current.style.opacity = fade;
    }
    if (wordB.current) {
      wordB.current.style.transform = `translate3d(${sep * 38}vw,0,0)`;
      wordB.current.style.opacity = fade;
    }

    const fr = smoothstep(0.2, 0.56, p);
    const settle = (1 - smoothstep(0, 0.15, p)) * 0.06;
    letters.current.forEach((el, i) => {
      const [x, y, r, s] = VECTORS[i];
      el.style.transform = `translate3d(${fr * x}vw,${fr * y}vh,0) rotate(${fr * r}deg) scale(${1 + fr * s + settle})`;
      el.style.opacity = String(1 - fr * (i % 2 ? 0.96 : 0.86));
    });

    const q = smoothstep(0.46, 0.6, p);
    if (question.current) {
      question.current.style.opacity = String(q);
      question.current.style.transform = `translate3d(0,${(1 - q) * 30}px,0)`;
    }

    wire.current.forEach((el, i) => {
      const a = smoothstep(0.56 + i * 0.028, 0.7 + i * 0.028, p);
      el.style.opacity = String(a);
      el.style.transform = WIREFRAME[i].x ? `scaleX(${a})` : `scale(${0.94 + 0.06 * a})`;
    });
  });

  return (
    <section ref={sectionRef} className="mf-section" style={{ background: "var(--bg)" }}>
      <div className="mf-sticky">
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 55%, rgba(61,109,255,.12), transparent 70%)" }} />
        <span
          style={{
            position: "absolute",
            top: "clamp(88px,13vh,128px)",
            left: "var(--m)",
            font: "400 11px/1 var(--font-mono)",
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--mute)",
          }}
        >
          {site.manifesto.eyebrow}
        </span>

        <h2 style={{ position: "relative", width: "100%", margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh", textAlign: "center", fontWeight: 400 }}>
          <span style={{ display: "flex", gap: ".3em", justifyContent: "center", flexWrap: "nowrap", fontSize: "clamp(28px,6.4vw,120px)", whiteSpace: "nowrap" }}>
            <span ref={wordA} style={{ display: "block", font: "200 1em/1 var(--font-sans)", fontVariationSettings: "'wdth' 118", letterSpacing: "-.03em", color: "var(--silver)", willChange: "transform" }}>
              {site.manifesto.linhaA}
            </span>
            <span ref={wordB} style={{ display: "block", font: "800 1em/1 var(--font-sans)", fontVariationSettings: "'wdth' 118", letterSpacing: "-.03em", color: "var(--ink)", willChange: "transform" }}>
              {site.manifesto.linhaB}
            </span>
          </span>
          <span
            aria-label={site.manifesto.palavraFragmentada}
            style={{
              display: "flex",
              justifyContent: "center",
              // Teto pela largura útil (a palavra mede ~4,42em): no celular o mínimo de
              // 92px do design vazava pelas bordas.
              font: "900 min(clamp(92px,19.5vw,380px), calc((100vw - 2 * var(--m)) / 4.5))/.84 var(--font-sans)",
              fontVariationSettings: "'wdth' 100",
              letterSpacing: "-.05em",
            }}
          >
            {LETTERS.map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                ref={(el) => {
                  if (el) letters.current[i] = el;
                }}
                style={{ display: "block", willChange: "transform", ...(ch === "." ? { color: "var(--blue)" } : SILVER_TEXT) }}
              >
                {ch}
              </span>
            ))}
          </span>
        </h2>

        <div ref={question} className="mf-question">
          <span style={{ font: "italic 400 clamp(34px,5.4vw,96px)/1 var(--font-serif)", color: "var(--ink)" }}>{site.manifesto.pergunta}</span>
        </div>

        <div
          aria-hidden="true"
          className="mf-wireframe"
          style={{ position: "absolute", left: "50%", top: "58%", width: "min(1100px,88vw)", height: "min(52vh,560px)", transform: "translate(-50%,-50%)" }}
        >
          {WIREFRAME.map((w, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) wire.current[i] = el;
              }}
              style={{ position: "absolute", ...w.style }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
