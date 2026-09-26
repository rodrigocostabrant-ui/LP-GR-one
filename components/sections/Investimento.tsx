"use client";

import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

/** Substitui a antiga tabela de condições: investimento sob consulta + como funciona o atendimento. */
export default function Investimento() {
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMensagem)}`;
  const { investimento } = site;

  return (
    <section
      style={{
        position: "relative",
        margin: "0 clamp(8px,1.2vw,16px)",
        borderRadius: "clamp(20px,2.4vw,32px)",
        color: "#0B1220",
        overflow: "hidden",
        padding: "clamp(100px,14vh,180px) var(--m)",
        background:
          "radial-gradient(ellipse 50% 50% at 10% 100%, rgba(61,109,255,.10), transparent 70%), linear-gradient(180deg,#F4F5F7,#E9ECF0)",
      }}
    >
      <div style={{ maxWidth: 1560, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "clamp(48px,7vw,120px)", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 28 }}>
          <Reveal variant="fade">
            <span style={{ font: "400 11px/1 var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "#6B7487" }}>
              {investimento.eyebrow}
            </span>
          </Reveal>
          <h2 style={{ margin: 0, display: "flex", flexDirection: "column" }}>
            <span style={{ overflow: "hidden" }}>
              <Reveal variant="mask">
                <span style={{ display: "block", font: "700 clamp(38px,5vw,88px)/.95 var(--font-sans)", fontVariationSettings: "'wdth' 92", letterSpacing: "-.04em", color: "#0B1220" }}>
                  {investimento.tituloLinha1}
                </span>
              </Reveal>
            </span>
            <span style={{ overflow: "hidden", paddingBottom: ".08em" }}>
              <Reveal variant="mask" delay={100}>
                <span
                  style={{
                    display: "block",
                    font: "italic 400 clamp(64px,9vw,168px)/.95 var(--font-serif)",
                    background: "linear-gradient(180deg,#0B1220 30%,#56607A)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {investimento.tituloItalico}
                </span>
              </Reveal>
            </span>
          </h2>
          <Reveal style={{ maxWidth: 520 }}>
            <p style={{ margin: 0, font: "400 clamp(18px,1.5vw,22px)/1.5 var(--font-sans)", color: "#0B1220" }}>{investimento.paragrafo}</p>
          </Reveal>
          <Reveal delay={100} style={{ maxWidth: 460 }}>
            <p style={{ margin: 0, font: "400 15px/1.6 var(--font-sans)", color: "#4A5468" }}>{investimento.paragrafo2}</p>
          </Reveal>
          <Reveal delay={200} style={{ marginTop: 8 }}>
            <MagneticButton href={wa} variant="dark">
              {investimento.cta}
            </MagneticButton>
          </Reveal>
        </div>

        <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", paddingTop: "clamp(0px,6vh,80px)" }}>
          <span style={{ font: "400 10px/1 var(--font-mono)", letterSpacing: ".18em", textTransform: "uppercase", color: "#6B7487", paddingBottom: 18 }}>
            {investimento.comoFunciona.eyebrow}
          </span>
          {investimento.comoFunciona.passos.map((passo, i) => (
            <Reveal key={passo.n} delay={i * 80}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px minmax(0,1fr)",
                  gap: 14,
                  padding: "24px 0",
                  borderTop: "1px solid rgba(11,18,32,.12)",
                  borderBottom: i === investimento.comoFunciona.passos.length - 1 ? "1px solid rgba(11,18,32,.12)" : undefined,
                }}
              >
                <span style={{ font: "400 11px/1.6 var(--font-mono)", color: "#2F5BEA" }}>{passo.n}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ font: "600 20px/1.2 var(--font-sans)", letterSpacing: "-.01em" }}>{passo.titulo}</span>
                  <span style={{ font: "400 15px/1.55 var(--font-sans)", color: "#4A5468" }}>{passo.descricao}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
