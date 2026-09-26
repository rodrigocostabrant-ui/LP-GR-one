"use client";

import { useEffect, useRef } from "react";
import { stageStore } from "./stageStore";

/**
 * Economia de dados, pouca memória ou WebGL ausente recebem a versão estática
 * (especificação "07 Responsivo": WebGL só se o dispositivo for capaz).
 */
function supportsWebGL() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (matchMedia("(prefers-reduced-data: reduce)").matches) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 3) return false;
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Canvas fixo único onde todas as marcas "GR" são desenhadas. */
export default function StageCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!supportsWebGL()) {
      stageStore.setFallback();
      return;
    }
    let cancelled = false;
    let stage: import("./stage").GRStage | null = null;
    let StageClass: typeof import("./stage").GRStage | null = null;

    const mount = () => {
      if (!StageClass || cancelled) return;
      try {
        stage = new StageClass(canvas);
      } catch {
        stageStore.setFallback();
        return;
      }
      // Contexto perdido (reset de GPU, aba em segundo plano no celular): descarta o
      // palco inteiro — senão as inscrições no relógio e os recursos ficavam vivos.
      stage.onContextLost = () => {
        stageStore.setFallback();
        stage?.dispose();
        stage = null;
      };
      stageStore.setStage(stage);
    };
    // Contexto devolvido pelo navegador: volta ao WebGL em vez de ficar no modo estático.
    const onRestored = () => {
      if (!stage) mount();
    };
    canvas.addEventListener("webglcontextrestored", onRestored);

    import("./stage")
      .then(({ GRStage }) => {
        StageClass = GRStage;
        mount();
      })
      .catch(() => {
        if (!cancelled) stageStore.setFallback();
      });
    return () => {
      cancelled = true;
      canvas.removeEventListener("webglcontextrestored", onRestored);
      stageStore.clear();
      stage?.dispose();
      stage = null;
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="gr-stage" />;
}
