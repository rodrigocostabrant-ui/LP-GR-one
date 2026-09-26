"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { ScrollTrigger } from "@/lib/gsap";
import { motion, motionState } from "@/lib/motion/engine";
import { useTick } from "@/lib/motion/hooks";
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowIcon } from "@/components/ui/WhatsAppBar";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const solid = useRef(false);

  // Item ativo = última seção cujo topo já passou de 45% da tela (regra da v2).
  useEffect(() => {
    const passed = site.nav.map(() => false);
    const triggers = site.nav.map((item, i) =>
      ScrollTrigger.create({
        trigger: `#${item.id}`,
        start: "top 45%",
        end: "max",
        onToggle: (self) => {
          passed[i] = self.isActive;
          setActive(Math.max(0, passed.lastIndexOf(true)));
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    motion.lockScroll(menuOpen);
    return () => motion.lockScroll(false);
  }, [menuOpen]);

  useTick("update", () => {
    const el = headerRef.current;
    if (!el) return;
    const next = motionState.scrollY > 30 || menuOpen;
    if (next === solid.current) return;
    solid.current = next;
    el.style.background = next ? "rgba(4,6,10,.7)" : "transparent";
    el.style.backdropFilter = next ? "blur(16px)" : "none";
    el.style.borderBottomColor = next ? "rgba(214,222,235,.08)" : "transparent";
  });

  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMensagem)}`;

  return (
    <>
    <header
      ref={headerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 70,
        borderBottom: "1px solid transparent",
        transition: "background .5s, border-color .5s",
      }}
    >
      <div
        style={{
          maxWidth: 1680,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "18px var(--m)",
        }}
      >
        <a href="#inicio" aria-label="GR One — voltar ao início" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span
            style={{
              font: "800 23px/1 var(--font-sans)",
              fontVariationSettings: "'wdth' 112",
              letterSpacing: "-.05em",
              background: "linear-gradient(180deg,#FFFFFF 20%,#8E97A6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            GR
          </span>
          <span style={{ width: 1, height: 14, background: "rgba(214,222,235,.3)" }} />
          <span style={{ font: "500 11px/1 var(--font-mono)", letterSpacing: ".3em", color: "var(--silver)" }}>ONE</span>
        </a>

        <nav
          aria-label="Principal"
          className="hidden min-[900px]:flex"
          style={{
            gap: 4,
            padding: 5,
            border: "1px solid rgba(214,222,235,.12)",
            borderRadius: 999,
            background: "rgba(13,19,32,.4)",
            backdropFilter: "blur(14px)",
          }}
        >
          {site.nav.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === i ? "location" : undefined}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                font: "500 13px/1 var(--font-sans)",
                color: active === i ? "var(--bg)" : "var(--silver)",
                background: active === i ? "var(--ink)" : "transparent",
                transition: "color .4s, background .4s",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <MagneticButton
          href={wa}
          variant="ghost"
          className="hidden min-[900px]:inline-flex"
          style={{ height: 42, gap: 12, padding: "0 8px 0 20px", fontSize: 13, borderColor: "rgba(214,222,235,.28)" }}
        >
          {site.ctaCurto}
        </MagneticButton>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          className="flex min-[900px]:hidden"
          style={{
            alignItems: "center",
            gap: 10,
            height: 44,
            padding: "0 18px",
            borderRadius: 999,
            border: "1px solid rgba(214,222,235,.28)",
            background: "rgba(13,19,32,.5)",
            color: "var(--ink)",
            font: "500 12px/1 var(--font-mono)",
            letterSpacing: ".16em",
            textTransform: "uppercase",
          }}
        >
          {menuOpen ? "Fechar" : "Menu"}
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ width: 16, height: 1, background: "var(--ink)" }} />
            <span style={{ width: 10, height: 1, background: "var(--ink)" }} />
          </span>
        </button>
      </div>
    </header>

      {/* Fora do <header>: o backdrop-filter dele faria o `fixed` ficar do tamanho da barra. */}
      {menuOpen && (
        <div
          className="flex min-[900px]:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 65,
            background: "radial-gradient(ellipse 80% 50% at 80% 10%, rgba(61,109,255,.25), transparent 70%), var(--bg)",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "110px var(--m) 32px",
          }}
        >
          <nav aria-label="Menu" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {site.nav.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  // Destrava já no clique: o Lenis trata a âncora neste mesmo evento.
                  motion.lockScroll(false);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  font: "700 44px/1.1 var(--font-sans)",
                  fontVariationSettings: "'wdth' 90",
                  letterSpacing: "-.03em",
                }}
              >
                <span style={{ font: "400 11px var(--font-mono)", color: "var(--mute)" }}>0{i + 1}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <a
              href={wa}
              target="_blank"
              rel="noopener"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 56,
                padding: "0 10px 0 24px",
                borderRadius: 999,
                background: "var(--ink)",
                color: "var(--bg)",
                font: "600 15px/1 var(--font-sans)",
              }}
            >
              {site.contato.cta}
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowIcon />
              </span>
            </a>
            <span style={{ font: "400 11px/1.5 var(--font-mono)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mute)" }}>
              {site.menuAssinatura}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
