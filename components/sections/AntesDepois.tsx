"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";

const { antesDepois: ad } = site;
const ANTES_IMG = "/antes-depois/antes-escritorio.jpg";
const DEPOIS_IMG = "/antes-depois/depois-edificio.jpg";
const DUOTONE = { filter: "grayscale(1) contrast(1.15) brightness(.8)" } as const;

/**
 * Comparador antes/depois: arraste em qualquer ponto (1:1 com o ponteiro, com
 * captura), setas ±5% e Início/Fim. Saltos (clique longe da alça, teclado)
 * deslizam em 450ms na curva de transição. Computador 16:9; celular 9:16 com as
 * páginas redesenhadas. "Vale Advocacia" é fictícia e sinalizada.
 */
export default function AntesDepois() {
  const [pct, setPct] = useState(50);
  const [gliding, setGliding] = useState(false);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const fromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return 50;
    const r = el.getBoundingClientRect();
    return Math.round(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * 1000) / 10;
  }, []);

  const glideTo = (next: number) => {
    setGliding(true);
    setPct(next);
  };

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    glideTo(fromClientX(e.clientX));
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setGliding(false);
    setPct(fromClientX(e.clientX));
  };
  const onUp = () => {
    dragging.current = false;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowLeft: -5, ArrowRight: 5 }[e.key];
    if (step) {
      e.preventDefault();
      glideTo(Math.min(100, Math.max(0, pct + step)));
    }
    if (e.key === "Home") glideTo(0);
    if (e.key === "End") glideTo(100);
  };

  const glide = gliding ? "var(--ease-transicao)" : undefined;
  const move = (props: string) => (glide ? props.split(",").map((p) => `${p.trim()} .45s ${glide}`).join(",") : "none");

  return (
    <section style={{ position: "relative", padding: "clamp(100px,14vh,180px) var(--m)", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1560, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 28, marginBottom: "clamp(36px,6vh,64px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Reveal variant="fade">
              <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mute)" }}>{ad.eyebrow}</span>
            </Reveal>
            <h2 style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <span style={{ overflow: "hidden" }}>
                <Reveal variant="mask">
                  <span style={{ display: "block", font: "700 clamp(40px,6vw,108px)/.95 var(--font-sans)", fontVariationSettings: "'wdth' 92", letterSpacing: "-.04em" }}>
                    {ad.tituloLinha1}
                  </span>
                </Reveal>
              </span>
              <span style={{ overflow: "hidden" }}>
                <Reveal variant="mask" delay={100}>
                  <span style={{ display: "block", paddingBottom: ".1em", font: "italic 400 clamp(44px,6.6vw,118px)/1 var(--font-serif)", color: "var(--silver)" }}>
                    {ad.tituloItalico}
                  </span>
                </Reveal>
              </span>
            </h2>
          </div>
          <Reveal style={{ maxWidth: 340 }}>
            <p style={{ margin: 0, font: "400 15px/1.6 var(--font-sans)", color: "var(--mute)", textWrap: "pretty" }}>{ad.paragrafo}</p>
          </Reveal>
        </div>

        <Reveal>
          <div
            ref={frameRef}
            className="ba-frame"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onTransitionEnd={() => setGliding(false)}
            data-cursor="Arrastar"
            style={{
              position: "relative",
              margin: "0 auto",
              overflow: "hidden",
              containerType: "inline-size",
              border: "1px solid rgba(214,222,235,.14)",
              touchAction: "pan-y",
              userSelect: "none",
              boxShadow: "0 60px 120px -40px rgba(0,0,0,.9)",
            }}
          >
            <div style={{ position: "absolute", inset: 0 }}>
              <AntesDesktop />
              <AntesMobile />
            </div>
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${pct}%)`, transition: move("clip-path") }}>
              <DepoisDesktop />
              <DepoisMobile />
            </div>

            <span style={{ position: "absolute", top: 16, left: 16, padding: "7px 12px", borderRadius: 999, background: "rgba(4,6,10,.75)", color: "var(--ink)", font: "500 10px/1 var(--font-mono)", letterSpacing: ".16em", pointerEvents: "none" }}>
              {ad.antes.badge}
            </span>
            <span style={{ position: "absolute", top: 16, right: 16, padding: "7px 12px", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", font: "500 10px/1 var(--font-mono)", letterSpacing: ".16em", pointerEvents: "none" }}>
              {ad.depois.badge}
            </span>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 1,
                background: "var(--ink)",
                boxShadow: "0 0 24px rgba(175,196,255,.8)",
                pointerEvents: "none",
                transform: `translateX(calc(${pct} * 1cqw))`,
                transition: move("transform"),
              }}
            />
            <div style={{ position: "absolute", top: "50%", left: 0, transform: `translateX(calc(${pct} * 1cqw))`, transition: move("transform") }}>
              <button
                role="slider"
                aria-label={ad.sliderLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pct)}
                onKeyDown={onKeyDown}
                className="ba-handle"
                style={{
                  width: 56,
                  height: 56,
                  margin: "-28px 0 0 -28px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,.7)",
                  backdropFilter: "blur(10px)",
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden="true">
                  <path d="M6 1L1 6L6 11M16 1L21 6L16 11" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AntesDesktop() {
  return (
    <div className="ba-desk" style={{ position: "absolute", inset: 0, background: "#FFFFFF", color: "#333", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.6cqw 3cqw", borderBottom: "1px solid #e3e3e3" }}>
        <span style={{ font: "700 1.7cqw/1 Arial, sans-serif", color: "#1F4E9C" }}>{ad.antes.marca}</span>
        <span style={{ display: "flex", gap: "1.8cqw", font: "400 1cqw Arial, sans-serif", color: "#555" }}>
          {ad.antes.nav.map((item, i) => (
            <span key={item} style={i === 0 ? { color: "#1F4E9C" } : undefined}>
              {item}
            </span>
          ))}
        </span>
        <span style={{ font: "700 1cqw Arial, sans-serif", color: "#1F4E9C" }}>{ad.antes.telefone}</span>
      </div>
      <div style={{ position: "relative", height: "44%", overflow: "hidden" }}>
        <Image src={ANTES_IMG} alt={ad.antes.imagemAlt} fill sizes="(min-width: 1600px) 1560px, 100vw" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.2cqw", color: "#fff", textAlign: "center" }}>
          <span style={{ font: "700 3.2cqw/1.1 Arial, sans-serif" }}>{ad.antes.bannerTitulo}</span>
          <span style={{ font: "400 1.3cqw Arial, sans-serif" }}>{ad.antes.bannerSubtitulo}</span>
          <span style={{ padding: "1cqw 2.4cqw", background: "#1F4E9C", font: "700 1cqw Arial, sans-serif", borderRadius: 3 }}>{ad.antes.bannerCta}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "2cqw", padding: "3cqw" }}>
        {ad.antes.cards.map((card) => (
          <div key={card.titulo} style={{ display: "flex", flexDirection: "column", gap: ".8cqw", alignItems: "center", textAlign: "center", padding: "1.6cqw", border: "1px solid #e6e6e6" }}>
            <span style={{ width: "3cqw", height: "3cqw", borderRadius: "50%", background: "#DCE6F5" }} />
            <span style={{ font: "700 1.4cqw Arial, sans-serif", color: "#1F4E9C" }}>{card.titulo}</span>
            <span style={{ font: "400 .95cqw/1.5 Arial, sans-serif", color: "#777" }}>{card.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AntesMobile() {
  return (
    <div className="ba-mob" style={{ position: "absolute", inset: 0, background: "#fff", color: "#333", fontFamily: "Arial, sans-serif", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4cqw 5cqw", borderBottom: "1px solid #e3e3e3" }}>
        <span style={{ font: "700 4.6cqw Arial, sans-serif", color: "#1F4E9C" }}>{ad.antes.marca}</span>
        <span aria-hidden="true" style={{ font: "700 6cqw Arial", color: "#1F4E9C" }}>
          ≡
        </span>
      </div>
      <div style={{ position: "relative", height: "38%" }}>
        <Image src={ANTES_IMG} alt="" fill sizes="360px" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3cqw", color: "#fff", textAlign: "center", padding: "0 5cqw" }}>
          <span style={{ font: "700 6.4cqw/1.15 Arial" }}>{ad.antes.bannerTitulo}</span>
          <span style={{ padding: "2.4cqw 5cqw", background: "#1F4E9C", font: "700 3cqw Arial", borderRadius: 3 }}>{ad.antes.bannerCta}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3cqw", padding: "5cqw" }}>
        {ad.antes.cardsMobile.map((card) => (
          <div key={card.titulo} style={{ padding: "4cqw", border: "1px solid #e6e6e6", textAlign: "center" }}>
            <span style={{ display: "block", font: "700 4.4cqw Arial", color: "#1F4E9C" }}>{card.titulo}</span>
            <span style={{ font: "400 3.2cqw/1.5 Arial", color: "#777" }}>{card.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepoisDesktop() {
  return (
    <div className="ba-desk" style={{ position: "absolute", inset: 0, background: "#070A10", color: "var(--ink)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2cqw 3.2cqw" }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: ".8cqw" }}>
          <span style={{ font: "700 1.6cqw/1 var(--font-sans)", fontVariationSettings: "'wdth' 110", letterSpacing: ".2em" }}>{ad.depois.marca}</span>
          <span style={{ font: "400 .75cqw var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mute)" }}>{ad.depois.subtitulo}</span>
        </span>
        <span style={{ display: "flex", gap: "2.4cqw", font: "400 .95cqw var(--font-sans)", color: "var(--silver)" }}>
          {ad.depois.nav.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
        <span style={{ padding: ".9cqw 1.6cqw", borderRadius: 999, border: "1px solid rgba(238,241,245,.35)", font: "500 .9cqw var(--font-sans)" }}>{ad.depois.ctaTopo}</span>
      </div>
      <div style={{ position: "absolute", left: "3.2cqw", top: "9cqw", width: "44cqw", display: "flex", flexDirection: "column", gap: "1.8cqw" }}>
        <span style={{ font: "400 .8cqw var(--font-mono)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ice)" }}>{ad.depois.eyebrow}</span>
        <span style={{ font: "400 6.2cqw/.95 var(--font-serif)", letterSpacing: "-.01em" }}>
          {ad.depois.titulo} <em style={{ color: "var(--silver)" }}>{ad.depois.tituloItalico}</em>
        </span>
        <span style={{ maxWidth: "32cqw", font: "400 1.15cqw/1.6 var(--font-sans)", color: "var(--silver)" }}>{ad.depois.paragrafo}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "1.8cqw" }}>
          <span style={{ padding: "1.2cqw 2.2cqw", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", font: "500 1.05cqw var(--font-sans)" }}>{ad.depois.cta} →</span>
          <span style={{ font: "500 1cqw var(--font-sans)", borderBottom: "1px solid rgba(238,241,245,.4)", paddingBottom: ".3cqw" }}>{ad.depois.ctaSecundario}</span>
        </span>
      </div>
      <div style={{ position: "absolute", right: "3.2cqw", top: "7cqw", bottom: "9cqw", width: "40cqw", overflow: "hidden", borderRadius: ".6cqw" }}>
        <Image src={DEPOIS_IMG} alt={ad.depois.imagemAlt} fill sizes="(min-width: 1600px) 640px, 40vw" style={{ objectFit: "cover", ...DUOTONE }} />
        <div style={{ position: "absolute", inset: 0, background: "#2448A8", mixBlendMode: "color", opacity: 0.45 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "3.2cqw",
          right: "3.2cqw",
          bottom: "2.6cqw",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: "2cqw",
          paddingTop: "1.4cqw",
          borderTop: "1px solid rgba(238,241,245,.12)",
        }}
      >
        {ad.depois.areas.map((area, i) => (
          <span key={area} style={{ display: "flex", gap: "1cqw", font: "500 1.05cqw var(--font-sans)" }}>
            <span style={{ font: "400 .8cqw var(--font-mono)", color: "var(--mute)" }}>0{i + 1}</span>
            {area}
          </span>
        ))}
      </div>
    </div>
  );
}

function DepoisMobile() {
  return (
    <div className="ba-mob" style={{ position: "absolute", inset: 0, background: "#070A10", color: "var(--ink)", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5cqw 6cqw" }}>
        <span style={{ font: "700 4.4cqw/1 var(--font-sans)", letterSpacing: ".2em" }}>{ad.depois.marca}</span>
        <span style={{ font: "400 2.6cqw var(--font-mono)", letterSpacing: ".16em", color: "var(--mute)" }}>{ad.depois.menuMobile}</span>
      </div>
      <div style={{ position: "relative", height: "40%", margin: "0 6cqw", overflow: "hidden", borderRadius: "2cqw" }}>
        <Image src={DEPOIS_IMG} alt="" fill sizes="360px" style={{ objectFit: "cover", ...DUOTONE }} />
        <div style={{ position: "absolute", inset: 0, background: "#2448A8", mixBlendMode: "color", opacity: 0.45 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "6cqw" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3cqw" }}>
          <span style={{ font: "400 2.4cqw var(--font-mono)", letterSpacing: ".2em", color: "var(--ice)" }}>{ad.depois.eyebrowMobile}</span>
          <span style={{ font: "400 11cqw/.95 var(--font-serif)" }}>
            {ad.depois.titulo} <em style={{ color: "var(--silver)" }}>{ad.depois.tituloItalico}</em>
          </span>
        </div>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "12cqw", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", font: "500 3.8cqw var(--font-sans)" }}>
          {ad.depois.cta}
        </span>
      </div>
    </div>
  );
}
