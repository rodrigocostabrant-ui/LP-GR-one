import { cubicBezier } from "./math";

/**
 * Linguagem de movimento da GR One — a única fonte de valores de motion em JS.
 * Espelha os tokens CSS de `globals.css` (--ease-entrada, --ease-transicao) e a
 * seção "05 Movimento" da especificação: três curvas, nada além delas.
 */
export const EASE = {
  /** Revelações e chegadas: desacelera longamente, sensação de peso. */
  entrada: cubicBezier(0.16, 1, 0.3, 1),
  /** Máscaras, preenchimentos e trocas de estado: simétrica e decidida. */
  transicao: cubicBezier(0.77, 0, 0.18, 1),
};

export const DURATION = {
  entrada: 1300,
  fade: 1200,
  reducedFade: 400,
};

/** Acompanhamento: interpolação por quadro a 60fps (0,06–0,2). */
export const FOLLOW = {
  /** Mouse suavizado que alimenta objeto 3D e paralaxe. */
  pointer: 0.06,
  /** Anel do cursor. */
  cursorRing: 0.2,
};

/** Multiplicador global de cursor e flutuação ("Sutil" 0.5 · "Padrão" 1 · "Expressiva" 1.6 no protótipo). */
export const INTENSITY = 1;

export const MEDIA = {
  reduced: "(prefers-reduced-motion: reduce)",
  finePointer: "(pointer: fine)",
  /** Trilho horizontal do Processo (especificação: computador ≥ 1100px). */
  processTrack: "(min-width: 1100px) and (prefers-reduced-motion: no-preference)",
  /** Layout de celular da especificação (< 760px). */
  mobile: "(max-width: 759px)",
  /** Cápsula de navegação e ímã (protótipo: ≥ 900px). */
  desktopNav: "(min-width: 900px)",
};
