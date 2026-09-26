import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { frameLerp } from "./math";
import { EASE, FOLLOW, MEDIA } from "./tokens";

/**
 * Motor de movimento da página: um único relógio (gsap.ticker, que também move o
 * Lenis), um único listener por responsabilidade (ponteiro, resize, revelação) e
 * três fases por quadro, sempre nesta ordem:
 *
 *   measure → leituras de layout (getBoundingClientRect)
 *   update  → escritas no DOM e cálculo de estados (objeto 3D, tipografia)
 *   render  → desenho (WebGL, cursor)
 *
 * Separar leitura e escrita evita layout forçado a cada quadro.
 */

export type Phase = "measure" | "update" | "render";
export type TickFn = (time: number, dtMs: number) => void;

export const motionState = {
  /** segundos desde o início do relógio */
  time: 0,
  scrollY: 0,
  vw: 1440,
  vh: 900,
  reduced: false,
  finePointer: false,
  pointer: {
    /** px, -1 enquanto não houver mouse */
    x: -1,
    y: -1,
    /** normalizado -1..1, suavizado (FOLLOW.pointer) — o que o objeto 3D lê */
    sx: 0,
    sy: 0,
    active: false,
  },
};

const phases: Record<Phase, Set<TickFn>> = { measure: new Set(), update: new Set(), render: new Set() };
const resizeFns = new Set<() => void>();
const revealFns = new Map<Element, () => void>();

const REVEAL_RATIO = 0.12;

let refCount = 0;
let lenis: Lenis | null = null;
let io: IntersectionObserver | null = null;
let teardown: (() => void) | null = null;

function tick(time: number, deltaTime: number) {
  motionState.time = time;
  motionState.scrollY = window.scrollY;
  const p = motionState.pointer;
  if (p.active) {
    const k = frameLerp(FOLLOW.pointer, deltaTime);
    p.sx += ((p.x / motionState.vw) * 2 - 1 - p.sx) * k;
    p.sy += ((p.y / motionState.vh) * 2 - 1 - p.sy) * k;
  }
  phases.measure.forEach((fn) => fn(time, deltaTime));
  phases.update.forEach((fn) => fn(time, deltaTime));
  phases.render.forEach((fn) => fn(time, deltaTime));
}

function lenisRaf(time: number) {
  lenis?.raf(time * 1000);
}

function createLenis() {
  lenis = new Lenis({
    duration: 1.15,
    easing: EASE.entrada,
    smoothWheel: true,
    autoRaf: false,
    anchors: { duration: 1.4, easing: EASE.transicao },
  });
  lenis.on("scroll", ScrollTrigger.update);
}

function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

function start() {
  const reducedMq = matchMedia(MEDIA.reduced);
  const fineMq = matchMedia(MEDIA.finePointer);
  motionState.reduced = reducedMq.matches;
  motionState.finePointer = fineMq.matches;

  const measureViewport = () => {
    motionState.vw = document.documentElement.clientWidth || window.innerWidth;
    motionState.vh = window.innerHeight;
  };
  measureViewport();

  if (!motionState.reduced) createLenis();
  // Lenis primeiro: o relógio da página lê a rolagem já atualizada no mesmo quadro.
  gsap.ticker.add(lenisRaf);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const onReduced = () => {
    motionState.reduced = reducedMq.matches;
    if (motionState.reduced) destroyLenis();
    else if (!lenis) createLenis();
    ScrollTrigger.refresh();
  };
  const onFine = () => {
    motionState.finePointer = fineMq.matches;
  };
  reducedMq.addEventListener("change", onReduced);
  fineMq.addEventListener("change", onFine);

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = motionState.pointer;
    if (!p.active) {
      // Primeira leitura: parte de onde o mouse está, sem "salto" do centro.
      p.sx = (e.clientX / motionState.vw) * 2 - 1;
      p.sy = (e.clientY / motionState.vh) * 2 - 1;
    }
    p.x = e.clientX;
    p.y = e.clientY;
    p.active = true;
  };
  const onPointerLeave = () => {
    motionState.pointer.active = false;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);

  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      measureViewport();
      resizeFns.forEach((fn) => fn());
    });
  };
  window.addEventListener("resize", onResize);

  // Limiar de 12% do próprio elemento, não margem da janela: uma margem inferior
  // (-8%) impedia para sempre a revelação de quem termina nos 8% de baixo da
  // página quando a rolagem já está no topo (os CTAs do Hero após recarregar).
  io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.intersectionRatio < REVEAL_RATIO) return;
        revealFns.get(entry.target)?.();
        revealFns.delete(entry.target);
        io?.unobserve(entry.target);
      }),
    { threshold: REVEAL_RATIO },
  );
  // Primeira tela: revela já (é a coreografia de entrada).
  revealFns.forEach((fn, el) => {
    const r = el.getBoundingClientRect();
    if (r.top < motionState.vh && r.bottom > 0) {
      fn();
      revealFns.delete(el);
    } else io?.observe(el);
  });

  // Troca de fonte (swap) muda alturas: recalcula os gatilhos quando as fontes chegam.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  teardown = () => {
    gsap.ticker.remove(tick);
    gsap.ticker.remove(lenisRaf);
    destroyLenis();
    reducedMq.removeEventListener("change", onReduced);
    fineMq.removeEventListener("change", onFine);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(resizeRaf);
    io?.disconnect();
    io = null;
  };
}

export const motion = {
  /** Liga o motor (contagem de referências: seguro no StrictMode). */
  init() {
    if (refCount++ === 0) start();
    return () => {
      if (--refCount === 0) {
        teardown?.();
        teardown = null;
      }
    };
  },

  onTick(phase: Phase, fn: TickFn) {
    phases[phase].add(fn);
    return () => {
      phases[phase].delete(fn);
    };
  },

  onResize(fn: () => void) {
    resizeFns.add(fn);
    return () => {
      resizeFns.delete(fn);
    };
  },

  /** Dispara `fn` uma única vez quando o elemento entra na tela. */
  reveal(el: Element, fn: () => void) {
    revealFns.set(el, fn);
    io?.observe(el);
    return () => {
      revealFns.delete(el);
      io?.unobserve(el);
    };
  },

  lockScroll(locked: boolean) {
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    } else {
      document.documentElement.style.overflow = locked ? "hidden" : "";
    }
  },
};
