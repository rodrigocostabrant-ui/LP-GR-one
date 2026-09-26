"use client";

import { Fragment, useRef, type CSSProperties } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import { motionState } from "@/lib/motion/engine";
import { useScrollProgress, useTick } from "@/lib/motion/hooks";

const { manifestoTipografico: mt } = site;
const ROW1 = mt.faixa1.split(" · ");
const ROW2 = mt.faixa2.split(" — ");

const rowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: ".5em",
  font: "800 clamp(56px,9vw,168px)/1.02 var(--font-sans)",
  fontVariationSettings: "'wdth' 118",
  letterSpacing: "-.045em",
  willChange: "transform",
};
const sepStyle: CSSProperties = { font: "italic 400 1em var(--font-serif)", color: "var(--blue)" };

/** Duas faixas repetidas (o suficiente para nunca mostrar a ponta) com separador em serifa azul. */
function Row({ items, sep, outline }: { items: string[]; sep: string; outline?: boolean }) {
  const seq = [...items, ...items];
  return (
    <>
      {seq.map((item, i) => (
        <Fragment key={i}>
          {item}
          {i < seq.length - 1 && <em style={outline ? { ...sepStyle, WebkitTextStroke: 0 } : sepStyle}>{sep}</em>}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Cartão claro com duas faixas enormes deslizando em sentidos opostos:
 * x = (topo da seção − altura da tela) × 0,4 (especificação "05 Movimento").
 */
export default function ManifestoTipografico() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1 = useRef<HTMLDivElement>(null);
  const row2 = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(sectionRef, "top bottom", "bottom top");
  const last = useRef("");

  useTick("update", () => {
    if (motionState.reduced) return;
    const { p, distance } = progress.current;
    const x = -p * distance * 0.4;
    const key = `${x.toFixed(1)}|${motionState.vw}`;
    if (key === last.current) return;
    last.current = key;
    if (row1.current) row1.current.style.transform = `translate3d(${x}px,0,0)`;
    if (row2.current) row2.current.style.transform = `translate3d(${-x - motionState.vw * 0.9}px,0,0)`;
  });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        margin: "0 clamp(8px,1.2vw,16px)",
        borderRadius: "clamp(20px,2.4vw,32px)",
        color: "var(--paper-ink)",
        overflow: "hidden",
        padding: "clamp(80px,12vh,150px) 0 clamp(100px,14vh,180px)",
        background: "linear-gradient(180deg,#EEF0F3,#F6F7F9)",
      }}
    >
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "1vh" }}>
        <div style={{ whiteSpace: "nowrap" }}>
          <div ref={row1} style={{ ...rowStyle, color: "var(--paper-ink)" }}>
            <Row items={ROW1} sep="·" />
          </div>
        </div>
        <div style={{ whiteSpace: "nowrap" }}>
          <div ref={row2} style={{ ...rowStyle, color: "transparent", WebkitTextStroke: "1px rgba(11,18,32,.35)", transform: "translate3d(-90vw,0,0)" }}>
            <Row items={ROW2} sep="—" outline />
          </div>
        </div>
      </div>
      <p className="sr-only">
        {mt.faixa1}. {mt.faixa2}.
      </p>

      <div style={{ maxWidth: 1560, margin: "clamp(90px,14vh,180px) auto 0", padding: "0 var(--m)", display: "flex", flexDirection: "column", gap: "clamp(64px,10vh,120px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1180 }}>
          <Reveal variant="fade">
            <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--paper-mute)" }}>{mt.eyebrow}</span>
          </Reveal>
          <Reveal>
            <p style={{ margin: 0, font: "300 clamp(34px,4.8vw,84px)/1.04 var(--font-sans)", letterSpacing: "-.03em", color: "var(--paper-text)", textWrap: "balance" }}>
              {mt.frase.replace("converte.", "")}
              <em style={{ font: "italic 400 1.08em var(--font-serif)", color: "var(--paper-ink)", letterSpacing: "-.01em" }}>converte.</em>
            </p>
          </Reveal>
          <Reveal delay={120} style={{ maxWidth: 520 }}>
            <p style={{ margin: 0, font: "400 17px/1.6 var(--font-sans)", color: "var(--paper-mute)", textWrap: "pretty" }}>{mt.paragrafo}</p>
          </Reveal>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,340px), 1fr))", gap: "clamp(40px,6vw,96px)", paddingLeft: "clamp(0px,16vw,280px)" }}>
          {mt.diferenciais.map((d, i) => (
            <Reveal key={d.numero} delay={i * 120}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", color: "var(--paper-accent)" }}>{d.numero}</span>
                <h3 style={{ margin: 0, font: "700 clamp(28px,2.6vw,44px)/1.05 var(--font-sans)", fontVariationSettings: "'wdth' 90", letterSpacing: "-.03em", color: "var(--paper-ink)" }}>
                  {d.titulo}
                </h3>
                <p style={{ margin: 0, maxWidth: 420, font: "400 16px/1.6 var(--font-sans)", color: "var(--paper-text)" }}>{d.descricao}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
