"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import { ScrollTrigger } from "@/lib/gsap";
import { motionState } from "@/lib/motion/engine";
import { useTick } from "@/lib/motion/hooks";

const AUTO_ADVANCE_S = 4;

/**
 * "Anatomia de uma página que converte": lista de 6 partes à direita, sincronizada
 * com uma maquete de navegador à esquerda que destaca o bloco correspondente.
 * Avança sozinha a cada 4s só com a seção na tela e sem o cursor sobre a
 * maquete; qualquer interação reinicia a contagem. Movimento reduzido: sem troca automática.
 */
export default function Metodo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const timer = useRef({ hovering: false, onScreen: false, since: -1 });
  const total = site.metodo.partes.length;

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        timer.current.onScreen = self.isActive;
        timer.current.since = -1;
      },
    });
    return () => st.kill();
  }, []);

  useTick("update", (t) => {
    const s = timer.current;
    if (motionState.reduced || !s.onScreen || s.hovering) return;
    if (s.since < 0) s.since = t;
    if (t - s.since >= AUTO_ADVANCE_S) {
      s.since = t;
      setActive((v) => (v + 1) % total);
    }
  });

  const goTo = (i: number) => {
    timer.current.hovering = true;
    setActive(i);
  };
  const release = () => {
    timer.current.hovering = false;
    timer.current.since = -1;
  };

  const rowStyle = (i: number) => {
    const on = i === active;
    return {
      border: on ? "1px solid var(--blue)" : "1px solid rgba(11,18,32,.07)",
      background: on ? "rgba(61,109,255,.06)" : "transparent",
      opacity: on ? 1 : 0.6,
      transition: "border-color .45s, background .45s, opacity .45s",
    } as const;
  };
  const badgeStyle = (i: number) => {
    const on = i === active;
    return {
      background: on ? "var(--blue)" : "#C3CAD5",
      transform: on ? "scale(1)" : "scale(.78)",
      transition: "transform .5s var(--ease-entrada), background .4s",
    } as const;
  };
  const barColor = (i: number) => (i === active ? "rgba(61,109,255,.6)" : "rgba(11,18,32,.12)");

  return (
    <section
      id="metodo"
      ref={sectionRef}
      style={{
        position: "relative",
        margin: "0 clamp(8px,1.2vw,16px)",
        borderRadius: "clamp(20px,2.4vw,32px)",
        color: "#0B1220",
        overflow: "hidden",
        padding: "clamp(90px,13vh,170px) var(--m)",
        background:
          "radial-gradient(ellipse 55% 45% at 90% 0%, rgba(61,109,255,.12), transparent 70%), linear-gradient(180deg,#F4F5F7,#E8EBEF)",
      }}
    >
      <div style={{ maxWidth: 1560, margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(48px,8vh,96px)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Reveal variant="fade">
              <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "#6B7487" }}>
                {site.metodo.eyebrow}
              </span>
            </Reveal>
            <h2 style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <span style={{ overflow: "hidden" }}>
                <Reveal variant="mask">
                  <span style={{ display: "block", font: "700 clamp(40px,6vw,108px)/.95 var(--font-sans)", fontVariationSettings: "'wdth' 92", letterSpacing: "-.04em", color: "#0B1220" }}>
                    {site.metodo.tituloLinha1}
                  </span>
                </Reveal>
              </span>
              <span style={{ overflow: "hidden" }}>
                <Reveal variant="mask" delay={100}>
                  <span style={{ display: "block", font: "italic 400 clamp(44px,6.6vw,118px)/1 var(--font-serif)", color: "#4A5468" }}>
                    {site.metodo.tituloItalico}
                  </span>
                </Reveal>
              </span>
            </h2>
          </div>
          <Reveal style={{ maxWidth: 340 }}>
            <p style={{ margin: 0, font: "400 15px/1.6 var(--font-sans)", color: "#4A5468" }}>{site.metodo.paragrafo}</p>
          </Reveal>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(40px,6vw,110px)", alignItems: "center" }}>
          <div onMouseEnter={() => { timer.current.hovering = true; }} onMouseLeave={release} style={{ flex: "1 1 340px", maxWidth: 560 }}>
            <div
              style={{
                borderRadius: 18,
                background: "#FFFFFF",
                boxShadow: "0 50px 90px -40px rgba(11,18,32,.35), 0 0 0 1px rgba(11,18,32,.06)",
                padding: "16px 18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 6, padding: "2px 2px 4px" }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#D5DAE2" }} />
                ))}
              </div>

              {/* 01 — Promessa */}
              <div style={{ position: "relative", borderRadius: 10, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 9, ...rowStyle(0) }}>
                <span style={{ display: "block", width: "72%", height: 14, borderRadius: 3, background: barColor(0) }} />
                <span style={{ display: "block", width: "48%", height: 14, borderRadius: 3, background: barColor(0) }} />
                <span style={{ display: "block", width: "58%", height: 5, borderRadius: 3, background: barColor(0), marginTop: 6 }} />
                <span style={{ display: "block", width: 96, height: 24, borderRadius: 999, marginTop: 8, background: "#0B1220" }} />
                <NumberBadge n={1} style={badgeStyle(0)} />
              </div>

              {/* 02 — Identificação */}
              <div style={{ position: "relative", borderRadius: 10, padding: "16px 18px", ...rowStyle(1) }}>
                <span style={{ font: "italic 400 17px/1.3 var(--font-serif)", color: "#0B1220" }}>{site.metodo.citacao}</span>
                <NumberBadge n={2} style={badgeStyle(1)} />
              </div>

              {/* 03 — Método */}
              <div style={{ position: "relative", borderRadius: 10, padding: "16px 18px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, ...rowStyle(2) }}>
                {[0, 1, 2].map((c) => (
                  <span key={c} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1px solid ${barColor(2)}` }} />
                    <span style={{ display: "block", width: "90%", height: 5, borderRadius: 3, background: barColor(2) }} />
                    <span style={{ display: "block", width: "60%", height: 5, borderRadius: 3, background: barColor(2) }} />
                  </span>
                ))}
                <NumberBadge n={3} style={badgeStyle(2)} />
              </div>

              {/* 04 — Objeções */}
              <div style={{ position: "relative", borderRadius: 10, padding: "8px 18px", display: "flex", flexDirection: "column", ...rowStyle(3) }}>
                {[0.55, 0.42, 0.62].map((w, i) => (
                  <span
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderTop: i > 0 ? "1px solid rgba(11,18,32,.08)" : undefined,
                    }}
                  >
                    <span style={{ display: "block", width: `${w * 100}%`, height: 5, borderRadius: 3, background: barColor(3) }} />
                    <span style={{ font: "400 13px/1 var(--font-mono)", color: "#6B7487" }}>+</span>
                  </span>
                ))}
                <NumberBadge n={4} style={badgeStyle(3)} />
              </div>

              {/* 05 — Diferenciais */}
              <div style={{ position: "relative", borderRadius: 10, padding: "16px 18px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16, ...rowStyle(4) }}>
                {[
                  ["70%", "95%", "80%"],
                  ["60%", "95%", "70%"],
                ].map((col, i) => (
                  <span key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ display: "block", width: col[0], height: 9, borderRadius: 3, background: barColor(4) }} />
                    <span style={{ display: "block", width: col[1], height: 5, borderRadius: 3, background: barColor(4) }} />
                    <span style={{ display: "block", width: col[2], height: 5, borderRadius: 3, background: barColor(4) }} />
                  </span>
                ))}
                <NumberBadge n={5} style={badgeStyle(4)} />
              </div>

              {/* 06 — Chamada */}
              <div style={{ position: "relative", borderRadius: 10, padding: 18, background: "#0B1220", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: rowStyle(5).border, opacity: rowStyle(5).opacity, transition: rowStyle(5).transition }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                  <span style={{ display: "block", width: "70%", height: 10, borderRadius: 3, background: "rgba(238,241,245,.8)" }} />
                  <span style={{ display: "block", width: "45%", height: 5, borderRadius: 3, background: "rgba(238,241,245,.35)" }} />
                </span>
                <span style={{ display: "block", width: 90, height: 26, borderRadius: 999, background: "var(--blue)" }} />
                <NumberBadge n={6} style={badgeStyle(5)} />
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column" }}>
            {site.metodo.partes.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={p.numero}
                  onMouseEnter={() => goTo(i)}
                  onFocus={() => goTo(i)}
                  onClick={() => goTo(i)}
                  onMouseLeave={release}
                  onBlur={release}
                  data-cursor="Ver"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px minmax(0,1fr)",
                    gap: 12,
                    alignItems: "baseline",
                    textAlign: "left",
                    padding: "20px 0",
                    border: 0,
                    borderTop: "1px solid rgba(11,18,32,.1)",
                    background: "none",
                    color: "#0B1220",
                    opacity: on ? 1 : 0.45,
                    transition: "opacity .4s",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".1em", color: on ? "#2F5BEA" : "#6B7487" }}>{p.numero}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ font: "600 clamp(19px,1.7vw,26px)/1.15 var(--font-sans)", letterSpacing: "-.015em" }}>{p.titulo}</span>
                    <span
                      style={{
                        font: "400 15px/1.55 var(--font-sans)",
                        color: "#4A5468",
                        maxHeight: on ? 120 : 0,
                        overflow: "hidden",
                        transition: "max-height .55s var(--ease-entrada)",
                      }}
                    >
                      {p.descricao}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberBadge({ n, style }: { n: number; style: React.CSSProperties }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -10,
        right: -10,
        width: 26,
        height: 26,
        borderRadius: "50%",
        color: "#fff",
        font: "500 10px/1 var(--font-mono)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      0{n}
    </span>
  );
}
