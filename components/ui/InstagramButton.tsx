"use client";

import { useId, useRef } from "react";
import { motionState } from "@/lib/motion/engine";

interface InstagramButtonProps {
  href: string;
  /** rótulo acessível */
  label: string;
  /** rótulo no cursor; vazio = só o anel cresce (o símbolo fica visível) */
  cursorLabel?: string;
  size?: number;
}

/**
 * Botão circular do Instagram: atração magnética (0,32 da distância) com o
 * símbolo andando além do círculo (paralaxe interna), anel que gira e
 * preenchimento prata na passagem — estados em `.gr-ig` (globals.css). Só mouse.
 */
export default function InstagramButton({ href, label, cursorLabel = "", size = 64 }: InstagramButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const glyphRef = useRef<SVGSVGElement>(null);
  const gradId = `ig-${useId().replace(/:/g, "")}`;

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || motionState.reduced || motionState.vw < 900) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.translate = `${dx * 0.32}px ${dy * 0.32}px`;
    if (glyphRef.current) glyphRef.current.style.translate = `${dx * 0.16}px ${dy * 0.16}px`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.translate = "0 0";
    if (glyphRef.current) glyphRef.current.style.translate = "0 0";
  };

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      data-cursor={cursorLabel}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="gr-ig"
      style={{ width: size, height: size }}
    >
      <span className="gr-ig__ring" aria-hidden />
      <svg ref={glyphRef} className="gr-ig__glyph" viewBox="0 0 24 24" width={size * 0.4} height={size * 0.4} aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "var(--ig-from)" }} />
            <stop offset="1" style={{ stopColor: "var(--ig-to)" }} />
          </linearGradient>
        </defs>
        <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.3" />
        </g>
        <circle className="gr-ig__lens" cx="17.4" cy="6.6" r="1.25" />
      </svg>
    </a>
  );
}
