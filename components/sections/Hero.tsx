"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import GRMark, { type MarkState } from "@/components/three/GRMark";
import { motionState } from "@/lib/motion/engine";
import { useScrollProgress, useTick } from "@/lib/motion/hooks";
import { clamp01, easeOutCubic } from "@/lib/motion/math";
import { EASE, INTENSITY } from "@/lib/motion/tokens";

/** Corpo do "GR" no topo (30% da largura, máx. 460; tablet 29% para caber ao lado do texto; celular 56%). */
export const heroGlyphPx = (vw: number) => 0.71 * (vw < 760 ? vw * 0.56 : vw < 1100 ? vw * 0.29 : Math.min(460, vw * 0.3));
const titleWidthBase = (vw: number) => (vw < 760 ? 76 : vw < 1100 ? 92 : 106);

/** Entrada do objeto: começa logo depois da primeira linha do título. */
const INTRO_DELAY = 0.2;
const INTRO_DURATION = 1.8;

export default function Hero() {
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMensagem)}`;
  const sectionRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const progress = useScrollProgress(sectionRef, "top top", "bottom top");
  const mark = useRef<MarkState>({ a: 0.9, b: 0, rx: 14, ry: -70, y: 40, scale: 0.9 });
  const intro = useRef({ t0: -1 });
  const lastWord = useRef("");
  const lastP = useRef(-1);

  useTick("update", (t) => {
    const reduced = motionState.reduced;
    const p = reduced ? 0 : progress.current.p;
    if (intro.current.t0 < 0) intro.current.t0 = t;
    const e = reduced ? 1 : EASE.entrada(clamp01((t - intro.current.t0 - INTRO_DELAY) / INTRO_DURATION));
    const pointer = motionState.pointer;
    const live = !reduced && motionState.vw >= 760;
    const mx = live ? pointer.sx : 0;
    const my = live ? pointer.sy : 0;
    const k = reduced ? 0 : INTENSITY;
    const s = mark.current;
    // Estados 01 (inteiro) → 02 (soltando ao sair do topo), valores do protótipo v2.
    s.a = Math.min(1, easeOutCubic(p * 1.3) * 0.95 + (1 - e) * 0.9);
    s.b = 0;
    s.rx = (-my * 9 + Math.sin(t * 0.5) * 3) * k + (reduced ? -6 : (1 - e) * 14);
    s.ry = (mx * 22 + Math.sin(t * 0.32) * 10) * k - p * 50 + (reduced ? -18 : (1 - e) * -70);
    s.y = Math.sin(t * 0.8) * 7 * k - p * 90 + (1 - e) * 40;
    s.scale = 0.9 + 0.1 * e;

    const word = wordRef.current;
    if (word) {
      // Largura variável em passos de 0,5: refazer o texto de 206px a cada quadro
      // derrubava para 30fps em CPU modesta. O deslize (transform) segue contínuo.
      const wdth = String(Math.round((titleWidthBase(motionState.vw) - p * 28) * 2) / 2);
      if (wdth !== lastWord.current) {
        lastWord.current = wdth;
        word.style.fontVariationSettings = `'wdth' ${wdth}`;
      }
      if (p !== lastP.current) {
        lastP.current = p;
        word.style.transform = `translate3d(${-p * 7}vw,0,0)`;
      }
    }
  });

  return (
    <section
      id="inicio"
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        padding: "130px var(--m) clamp(28px,5vh,52px)",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 55% 60% at 74% 40%, rgba(61,109,255,.22), transparent 70%), radial-gradient(ellipse 45% 35% at 8% 105%, rgba(175,196,255,.08), transparent 70%), var(--bg)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(90deg, rgba(196,206,222,.055) 1px, transparent 1px)",
          backgroundSize: "calc(100% / 6) 100%",
          maskImage: "linear-gradient(180deg, transparent, #000 25%, #000 70%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000 25%, #000 70%, transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-30%",
          right: "16%",
          width: "26vw",
          height: "130%",
          background: "linear-gradient(180deg, rgba(175,196,255,.12), transparent 65%)",
          transform: "rotate(20deg)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "clamp(88px,13vh,128px)",
          left: "var(--m)",
          right: "var(--m)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          font: "400 11px/1.4 var(--font-mono)",
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "var(--mute)",
          zIndex: 2,
        }}
      >
        <Reveal variant="fade">
          <span>{site.hero.eyebrow}</span>
        </Reveal>
        <Reveal variant="fade" delay={150}>
          <span>{site.hero.selo}</span>
        </Reveal>
      </div>

      <div
        aria-hidden="true"
        className="hero-mark-halo"
        style={{
          position: "absolute",
          transform: "translate(-50%,-50%)",
          width: "calc(var(--hero-glyph) * 2.8)",
          height: "calc(var(--hero-glyph) * 1.6)",
          background: "radial-gradient(closest-side, rgba(61,109,255,.28), transparent)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <GRMark
        stateRef={mark}
        glyphPx={heroGlyphPx}
        fallbackFontSize="calc(var(--hero-glyph) / 0.71)"
        className="hero-mark"
        style={{ position: "absolute", transform: "translate(-50%,-50%)" }}
      />

      <div className="hero-copy" style={{ position: "relative", zIndex: 3 }}>
      <h1 style={{ margin: 0, display: "flex", flexDirection: "column", fontWeight: 400 }}>
        <span style={{ display: "block", overflow: "hidden" }}>
          <Reveal variant="mask">
            <span className="hero-l1" style={{ display: "block", fontWeight: 300, lineHeight: 1.15, fontFamily: "var(--font-sans)", letterSpacing: "-.01em", color: "var(--silver)" }}>
              {site.hero.linha1}
            </span>
          </Reveal>
        </span>
        <span style={{ display: "block", overflow: "hidden", padding: ".02em 0 .06em", contain: "layout paint" }}>
          <Reveal variant="mask" delay={110}>
            <span
              ref={wordRef}
              className="hero-word"
              style={{
                display: "block",
                fontWeight: 800,
                lineHeight: 0.9,
                fontFamily: "var(--font-sans)",
                letterSpacing: "-.045em",
                whiteSpace: "nowrap",
                background: "linear-gradient(180deg,#FFFFFF 12%,#CDD4DE 52%,#6F7888 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                willChange: "transform",
              }}
            >
              {site.hero.palavraDestaque}
            </span>
          </Reveal>
        </span>
        <span style={{ display: "block", overflow: "hidden" }}>
          <Reveal variant="mask" delay={220}>
            <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: ".25em" }}>
              <em className="hero-l3a" style={{ fontStyle: "italic", fontWeight: 400, lineHeight: 1, fontFamily: "var(--font-serif)", color: "var(--ink)", letterSpacing: "-.01em" }}>
                {site.hero.linha3Italico}
              </em>
              <span className="hero-l3b" style={{ fontWeight: 300, lineHeight: 1, fontFamily: "var(--font-sans)", letterSpacing: "-.03em", color: "var(--silver)" }}>
                {site.hero.linha3Resto}
              </span>
            </span>
          </Reveal>
        </span>
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 28,
          marginTop: "clamp(28px,5vh,48px)",
        }}
      >
        <Reveal delay={350} style={{ maxWidth: 440 }}>
          <p style={{ margin: 0, font: "400 16px/1.6 var(--font-sans)", color: "var(--silver)", textWrap: "pretty" }}>
            {site.hero.paragrafo}
          </p>
        </Reveal>
        <Reveal delay={450} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
          <MagneticButton href={wa}>{site.hero.ctaPrimario}</MagneticButton>
          <a
            href="#metodo"
            className="hero-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              font: "500 13px/1 var(--font-mono)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--silver)",
              padding: "10px 0",
              borderBottom: "1px solid rgba(214,222,235,.25)",
              transition: "color .3s, border-color .3s",
            }}
          >
            {site.hero.ctaSecundario}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M5 1V9M5 9L1.5 5.5M5 9L8.5 5.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
        </Reveal>
      </div>
      </div>
      <div className="hero-scroll hidden min-[900px]:block" style={{ position: "absolute", right: "var(--m)", bottom: "clamp(28px,5vh,52px)", zIndex: 3 }}>
        <Reveal variant="fade" delay={700}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, font: "400 10px/1 var(--font-mono)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--mute)" }}>
            <span style={{ position: "relative", width: 1, height: 52, background: "rgba(214,222,235,.15)", overflow: "hidden" }}>
              <span className="gr-scroll-dot" style={{ position: "absolute", left: 0, top: 0, width: 1, height: 18, background: "var(--ice)" }} />
            </span>
            {site.hero.scrollHint}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
