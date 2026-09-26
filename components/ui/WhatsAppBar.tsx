"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { ScrollTrigger } from "@/lib/gsap";
import { motionState } from "@/lib/motion/engine";
import { useTick } from "@/lib/motion/hooks";

/**
 * Barra fixa de WhatsApp no celular: aparece depois do topo e some quando o CTA
 * final entra na tela (especificação "Encerramento": a barra fixa some).
 */
export default function WhatsAppBar() {
  const ref = useRef<HTMLDivElement>(null);
  const nearCta = useRef(false);
  const shown = useRef(false);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: "#contato",
      start: "top 55%",
      end: "max",
      onToggle: (self) => {
        nearCta.current = self.isActive;
      },
    });
    return () => st.kill();
  }, []);

  useTick("update", () => {
    const el = ref.current;
    if (!el) return;
    const show = motionState.scrollY > motionState.vh * 0.85 && !nearCta.current;
    if (show === shown.current) return;
    shown.current = show;
    el.style.transform = show ? "translateY(0)" : "translateY(140%)";
  });

  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMensagem)}`;

  return (
    <div
      ref={ref}
      className="md:hidden"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 60,
        transform: "translateY(140%)",
        transition: "transform .6s var(--ease-entrada)",
      }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          padding: "0 8px 0 22px",
          borderRadius: 999,
          background: "rgba(238,241,245,.96)",
          color: "var(--bg)",
          font: "600 14px/1 var(--font-sans)",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,.7)",
        }}
      >
        {site.ctaCurto}
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowIcon />
        </span>
      </a>
    </div>
  );
}

export function ArrowIcon({ size = 12, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}
