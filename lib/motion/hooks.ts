"use client";

import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { motion, type Phase, type TickFn } from "./engine";

/** Inscreve `fn` numa fase do relógio único da página enquanto o componente existir. */
export function useTick(phase: Phase, fn: TickFn) {
  const handler = useEffectEvent(fn);
  useEffect(() => motion.onTick(phase, (t, dt) => handler(t, dt)), [phase]);
}

export interface ScrollProgress {
  /** 0–1 ao longo do trecho [start, end] */
  p: number;
  /** distância em px entre start e end */
  distance: number;
  /** posição de rolagem em que o trecho começa */
  start: number;
}

/**
 * Um ScrollTrigger por seção que só grava o progresso — quem escreve no DOM é a
 * fase `update` do relógio (leitura e escrita nunca se intercalam).
 */
export function useScrollProgress(
  trigger: RefObject<HTMLElement | null>,
  start: string,
  end: string,
  media?: string,
): RefObject<ScrollProgress> {
  const progress = useRef<ScrollProgress>({ p: 0, distance: 1, start: 0 });

  useEffect(() => {
    const el = trigger.current;
    if (!el) return;
    let st: ScrollTrigger | null = null;
    const write = (self: ScrollTrigger) => {
      progress.current.p = self.progress;
      progress.current.distance = Math.max(1, self.end - self.start);
      progress.current.start = self.start;
    };
    const create = () => {
      st?.kill();
      st = null;
      if (media && !matchMedia(media).matches) return;
      st = ScrollTrigger.create({ trigger: el, start, end, onUpdate: write, onRefresh: write });
      write(st);
    };
    create();
    const mq = media ? matchMedia(media) : null;
    mq?.addEventListener("change", create);
    return () => {
      mq?.removeEventListener("change", create);
      st?.kill();
    };
  }, [trigger, start, end, media]);

  return progress;
}
