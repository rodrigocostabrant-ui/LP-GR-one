"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motionState } from "@/lib/motion/engine";
import { ArrowIcon } from "./WhatsAppBar";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  cursorLabel?: string;
  /** primary: vidro azul · ghost: só contorno (cabeçalho) · dark: sobre fundo claro */
  variant?: "primary" | "ghost" | "dark";
  className?: string;
  style?: CSSProperties;
}

/**
 * Botão com atração magnética (até 18% × 28% da distância do cursor) e
 * preenchimento que avança da esquerda em 650ms na passagem — estados em
 * `.gr-btn` (globals.css), passagem só com mouse.
 */
export default function MagneticButton({
  href,
  children,
  cursorLabel = "Conversar",
  variant = "primary",
  className,
  style,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || motionState.reduced || motionState.vw < 900) return;
    const r = el.getBoundingClientRect();
    el.style.translate = `${(e.clientX - (r.left + r.width / 2)) * 0.18}px ${(e.clientY - (r.top + r.height / 2)) * 0.28}px`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.translate = "0 0";
  };

  const modifier = variant === "primary" ? "" : ` gr-btn--${variant}`;

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener"
      data-cursor={cursorLabel}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`gr-btn${modifier} ${className ?? ""}`}
      style={style}
    >
      {children}
      <span className="gr-btn__icon" style={variant === "ghost" ? { width: 28, height: 28 } : undefined}>
        <ArrowIcon color={variant === "dark" ? "var(--paper-ink)" : "#fff"} />
      </span>
    </a>
  );
}
