"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import InstagramButton from "@/components/ui/InstagramButton";
import GRMark, { type MarkState } from "@/components/three/GRMark";
import { motionState } from "@/lib/motion/engine";
import { useScrollProgress, useTick } from "@/lib/motion/hooks";
import { smoothstep } from "@/lib/motion/math";
import { INTENSITY } from "@/lib/motion/tokens";

/** Encerramento: corpo 20% da largura (máx. 300px); celular 42%. */
const finGlyphPx = (vw: number) => 0.71 * (vw < 760 ? vw * 0.42 : Math.min(300, vw * 0.2));

export default function Contato() {
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMensagem)}`;
  const { contato } = site;
  const sectionRef = useRef<HTMLElement>(null);
  // Entrada na tela: de "topo no fim da janela" até o topo passar 5% acima dela.
  const progress = useScrollProgress(sectionRef, "top bottom", "top -5%");
  const mark = useRef<MarkState>({ a: 1, b: 0, rx: 0, ry: 80, y: 0, scale: 1 });

  // Estado 06: as fatias se reencaixam conforme o CTA entra; o objeto termina frontal.
  useTick("update", (t) => {
    const s = mark.current;
    if (motionState.reduced) {
      Object.assign(s, { a: 0, b: 0, rx: -4, ry: 0, y: 0 });
      return;
    }
    const p = progress.current.p;
    const k = INTENSITY;
    const { sx, sy } = motionState.pointer;
    s.a = 1 - smoothstep(0.12, 0.8, p);
    s.b = 0;
    s.rx = (-sy * 8 + Math.sin(t * 0.5) * 2) * k;
    s.ry = sx * 18 * k + Math.sin(t * 0.3) * 8 + s.a * 80;
    s.y = Math.sin(t * 0.8) * 6 * k;
  });

  return (
    <section
      id="contato"
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "110vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(28px,5vh,52px)",
        padding: "clamp(100px,14vh,160px) var(--m)",
        textAlign: "center",
        overflow: "hidden",
        background: "radial-gradient(ellipse 50% 45% at 50% 34%, rgba(61,109,255,.24), transparent 70%), var(--bg)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "clamp(40px,8vh,90px)",
          left: "var(--m)",
          font: "400 11px/1 var(--font-mono)",
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "var(--mute)",
        }}
      >
        {contato.eyebrow}
      </span>

      {/* Ocupa no fluxo a altura do monograma (0,82 do corpo); a janela 3D é maior e centrada. */}
      <div className="fin-mark-slot" style={{ position: "relative", width: "100%" }}>
        <GRMark
          stateRef={mark}
          glyphPx={finGlyphPx}
          fallbackFontSize="var(--fin-body)"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "min(100vw, calc(var(--fin-body) * 0.71 * 3.4))",
            height: "calc(var(--fin-body) * 0.71 * 2.2)",
            transform: "translate(-50%,-50%)",
          }}
        />
      </div>

      <h2 style={{ position: "relative", zIndex: 3, margin: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ overflow: "hidden" }}>
          <Reveal variant="mask">
            <span style={{ display: "block", font: "700 clamp(38px,6vw,112px)/.95 var(--font-sans)", fontVariationSettings: "'wdth' 92", letterSpacing: "-.04em" }}>
              {contato.tituloLinha1}
            </span>
          </Reveal>
        </span>
        <span style={{ overflow: "hidden" }}>
          <Reveal variant="mask" delay={100}>
            <span style={{ display: "block", paddingBottom: ".1em", font: "italic 400 clamp(42px,6.6vw,124px)/1.02 var(--font-serif)", color: "var(--silver)" }}>
              {contato.tituloItalico}
            </span>
          </Reveal>
        </span>
      </h2>

      <Reveal
        delay={200}
        style={{ position: "relative", zIndex: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 14 }}
      >
        <MagneticButton href={wa} style={{ height: 64, gap: 18, padding: "0 10px 0 30px", fontSize: 16, borderColor: "rgba(214,222,235,.4)" }}>
          {contato.cta}
        </MagneticButton>
        <InstagramButton href={site.instagram} label={`Instagram da GR One (${site.instagramHandle})`} />
      </Reveal>

      <Reveal variant="fade" delay={300} style={{ position: "relative", zIndex: 3 }}>
        <span style={{ font: "400 12px/1.5 var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--mute)" }}>{contato.rodape}</span>
      </Reveal>
    </section>
  );
}
