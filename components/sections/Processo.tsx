"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import GRMark, { type MarkState } from "@/components/three/GRMark";
import { motion, motionState } from "@/lib/motion/engine";
import { useScrollProgress, useTick } from "@/lib/motion/hooks";
import { smoothstep } from "@/lib/motion/math";
import { INTENSITY, MEDIA } from "@/lib/motion/tokens";

/** Marca do Processo: corpo 11% da largura, máx. 170px. */
const procGlyphPx = (vw: number) => 0.71 * Math.min(170, vw * 0.11);

/**
 * Computador (≥1100px, com movimento): trilho horizontal fixo por 560vh — o
 * mesmo progresso move o trilho, a barra e o objeto (disperso → vista explodida).
 * Tablet, celular e movimento reduzido: lista vertical. A troca é a mesma media
 * query no CSS (.proc-track/.proc-list) e aqui (MEDIA.processTrack).
 */
export default function Processo() {
  const trackSectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(trackSectionRef, "top top", "bottom bottom", MEDIA.processTrack);
  const mark = useRef<MarkState>({ a: 1, b: 0, rx: -16, ry: 28, y: 0, scale: 1 });
  const shift = useRef(0);
  const last = useRef(-1);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (track) shift.current = Math.max(0, track.scrollWidth - motionState.vw);
      last.current = -1;
    };
    measure();
    document.fonts?.ready.then(measure);
    return motion.onResize(measure);
  }, []);

  useTick("update", (t) => {
    const p = progress.current.p;
    const k = INTENSITY;
    const s = mark.current;
    s.a = 1 - smoothstep(0.02, 0.6, p);
    s.b = smoothstep(0.3, 0.85, p);
    s.rx = -16 + motionState.pointer.sy * 6 * k;
    s.ry = 28 + p * 40 + motionState.pointer.sx * 10 * k;
    s.y = Math.sin(t * 0.7) * 5 * k;

    if (p === last.current) return;
    last.current = p;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${-p * shift.current}px,0,0)`;
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
  });

  return (
    <div id="processo">
      <section ref={trackSectionRef} className="proc-track" style={{ position: "relative", height: "560vh", background: "var(--bg)" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(0deg, rgba(196,206,222,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(196,206,222,.045) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
              maskImage: "radial-gradient(ellipse 70% 60% at 60% 50%, #000, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 60% 50%, #000, transparent)",
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
              font: "400 11px/1 var(--font-mono)",
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--mute)",
              zIndex: 2,
            }}
          >
            <span>{site.processo.eyebrow}</span>
            <span>{site.processo.subEyebrow}</span>
          </div>

          <GRMark
            stateRef={mark}
            glyphPx={procGlyphPx}
            fallbackFontSize="min(170px, 11vw)"
            style={{
              position: "absolute",
              right: "var(--m)",
              top: "15vh",
              width: "calc(0.71 * min(170px, 11vw) * 3.2)",
              height: "calc(0.71 * min(170px, 11vw) * 2.6)",
              transform: "translate(22%, -22%)",
            }}
          />

          <div ref={trackRef} style={{ position: "relative", display: "flex", alignItems: "center", willChange: "transform", paddingLeft: "var(--m)" }}>
            <div style={{ flex: "none", width: "min(46vw,760px)", paddingRight: "6vw", display: "flex", flexDirection: "column", gap: 28 }}>
              <h2 style={{ margin: 0, display: "flex", flexDirection: "column" }}>
                <span style={{ font: "700 clamp(48px,6vw,112px)/.95 var(--font-sans)", fontVariationSettings: "'wdth' 88", letterSpacing: "-.04em" }}>
                  {site.processo.tituloLinha1}
                </span>
                <span style={{ font: "italic 400 clamp(54px,6.8vw,124px)/1 var(--font-serif)", color: "var(--silver)" }}>{site.processo.tituloItalico}</span>
              </h2>
              <p style={{ margin: 0, maxWidth: 420, font: "400 17px/1.6 var(--font-sans)", color: "var(--silver)", textWrap: "pretty" }}>{site.processo.paragrafo}</p>
              <span style={{ display: "flex", alignItems: "center", gap: 12, font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mute)" }}>
                {site.processo.continuarRolando}
                <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
                  <path d="M0 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.1" />
                </svg>
              </span>
            </div>

            {site.processo.etapas.map((s) => (
              <article
                key={s.n}
                style={{
                  flex: "none",
                  position: "relative",
                  width: "min(64vw,1040px)",
                  height: "min(64vh,640px)",
                  padding: "0 5vw",
                  borderLeft: "1px solid rgba(214,222,235,.1)",
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
                  gap: "4vw",
                  alignItems: "end",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "-2vh",
                    left: "4.4vw",
                    font: "200 clamp(150px,17vw,300px)/.8 var(--font-sans)",
                    fontVariationSettings: "'wdth' 78",
                    letterSpacing: "-.05em",
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(214,222,235,.3)",
                  }}
                >
                  {s.n}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: "8vh", containerType: "inline-size" }}>
                  <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", color: "var(--ice)" }}>{site.processo.rotuloEtapa} {s.n} / 0{site.processo.etapas.length}</span>
                  <h3
                    style={{
                      margin: 0,
                      // Tamanho do design, reduzido só se a palavra mais longa não
                      // couber na coluna (≈0,5em por caractere).
                      font: `700 min(clamp(40px,4.4vw,80px), calc(100cqi / ${Math.max(...s.titulo.split(" ").map((w) => w.length)) * 0.5}))/.95 var(--font-sans)`,
                      fontVariationSettings: "'wdth' 90",
                      letterSpacing: "-.035em",
                    }}
                  >
                    {s.titulo}
                  </h3>
                  <p style={{ margin: 0, maxWidth: 380, font: "400 16px/1.6 var(--font-sans)", color: "var(--silver)", textWrap: "pretty" }}>{s.descricao}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: "8vh" }}>
                  <span style={{ font: "400 10px/1 var(--font-mono)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--mute)" }}>{site.processo.rotuloNestaEtapa}</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {s.itens.map((it) => (
                      <span
                        key={it}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 0",
                          borderTop: "1px solid rgba(214,222,235,.1)",
                          font: "400 14px/1.3 var(--font-sans)",
                          color: "#D6DCE5",
                        }}
                      >
                        {it}
                        <span style={{ color: "var(--blue)" }}>+</span>
                      </span>
                    ))}
                  </div>
                  <Receives text={s.entrega} />
                </div>
              </article>
            ))}
            <div style={{ flex: "none", width: "18vw" }} />
          </div>

          <div style={{ position: "absolute", left: "var(--m)", right: "var(--m)", bottom: "clamp(28px,5vh,48px)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: "400 10px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mute)" }}>
              {site.processo.etapas.map((s) => (
                <span key={s.n}>
                  {s.n} {s.titulo}
                </span>
              ))}
            </div>
            <div style={{ position: "relative", height: 1, background: "rgba(214,222,235,.12)" }}>
              <div
                ref={fillRef}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#3D6DFF,#AFC4FF)", transformOrigin: "left", transform: "scaleX(0)" }}
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
              <span style={{ display: "block", font: "700 clamp(40px,11vw,80px)/.95 var(--font-sans)", fontVariationSettings: "'wdth' 86", letterSpacing: "-.04em" }}>
                {site.processo.tituloLinha1}
              </span>
            </Reveal>
          </span>
          <span style={{ overflow: "hidden" }}>
            <Reveal variant="mask" delay={100}>
              <span style={{ display: "block", font: "italic 400 clamp(46px,12.5vw,90px)/1 var(--font-serif)", color: "var(--silver)" }}>
                {site.processo.tituloItalico}
              </span>
            </Reveal>
          </span>
        </h2>
        <p style={{ margin: "0 0 56px", maxWidth: 440, font: "400 16px/1.6 var(--font-sans)", color: "var(--silver)" }}>{site.processo.paragrafo}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
          {site.processo.etapas.map((s) => (
            <Reveal key={s.n}>
              <article style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14, paddingTop: 24, borderTop: "1px solid rgba(214,222,235,.12)" }}>
                <span
                  aria-hidden="true"
                  style={{ font: "200 110px/.8 var(--font-sans)", fontVariationSettings: "'wdth' 78", letterSpacing: "-.05em", color: "transparent", WebkitTextStroke: "1px rgba(214,222,235,.32)" }}
                >
                  {s.n}
                </span>
                <h3 style={{ margin: "6px 0 0", font: "700 36px/1 var(--font-sans)", fontVariationSettings: "'wdth' 90", letterSpacing: "-.03em" }}>{s.titulo}</h3>
                <p style={{ margin: 0, font: "400 15px/1.6 var(--font-sans)", color: "var(--silver)" }}>{s.descricao}</p>
                <Receives text={s.entrega} compact />
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

function Receives({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 6 : 8,
        marginTop: compact ? 0 : 10,
        padding: compact ? "14px 16px" : "16px 18px",
        borderRadius: 10,
        background: "linear-gradient(135deg, rgba(61,109,255,.14), rgba(255,255,255,.02))",
        border: "1px solid rgba(175,196,255,.16)",
      }}
    >
      <span style={{ font: "400 10px/1 var(--font-mono)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ice)" }}>{site.processo.rotuloVoceRecebe}</span>
      <span style={{ font: "500 15px/1.4 var(--font-sans)" }}>{text}</span>
    </div>
  );
}
