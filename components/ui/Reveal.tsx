"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, motionState } from "@/lib/motion/engine";
import { DURATION } from "@/lib/motion/tokens";

type Variant = "fade" | "up" | "mask";

const HIDDEN: Record<Variant, CSSProperties> = {
  mask: { transform: "translateY(105%)" },
  fade: { opacity: 0 },
  up: { opacity: 0, transform: "translateY(36px)" },
};

/**
 * Revelação de entrada (uma vez), com os valores da v2: `mask` sobe de 105%
 * dentro de um wrapper com overflow:hidden; `up` sobe 36px; `fade` só opacidade.
 * Todos na curva de entrada (1300ms / 1200ms). Movimento reduzido: só opacidade, 400ms.
 */
export default function Reveal({
  variant = "up",
  delay = 0,
  children,
  style,
  className,
}: {
  variant?: Variant;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = motionState.reduced || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.style.transform = "none";
      el.style.opacity = "0";
    }
    const duration = reduced ? DURATION.reducedFade : variant === "fade" ? DURATION.fade : DURATION.entrada;
    el.style.transition = reduced
      ? `opacity ${duration}ms ease ${delay}ms`
      : `opacity ${duration}ms var(--ease-entrada) ${delay}ms, transform ${duration}ms var(--ease-entrada) ${delay}ms`;
    // `mask` começa inteiro fora do wrapper (overflow:hidden) — observa o wrapper.
    const target = variant === "mask" && el.parentElement ? el.parentElement : el;
    return motion.reveal(target, () => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }, [variant, delay]);

  return (
    <div ref={ref} className={className} style={{ display: variant === "mask" ? "block" : undefined, ...HIDDEN[variant], ...style }}>
      {children}
    </div>
  );
}
