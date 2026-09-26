import type { GRStage, MarkHandle } from "./stage";

export type StageStatus = "pending" | "webgl" | "fallback";

type Entry = ReturnType<GRStage["add"]>;

let status: StageStatus = "pending";
let stage: GRStage | null = null;
const handles = new Map<MarkHandle, Entry | null>();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

/**
 * Liga as marcas (caixas no DOM) ao palco WebGL, que carrega sob demanda: uma
 * marca pode montar antes do palco existir e é anexada quando ele chega.
 */
export const stageStore = {
  getStatus: () => status,
  getServerStatus: (): StageStatus => "pending",
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  setStage(next: GRStage) {
    stage = next;
    handles.forEach((_, handle) => handles.set(handle, next.add(handle)));
    status = "webgl";
    emit();
  },

  setFallback() {
    handles.forEach((entry, handle) => {
      if (entry) stage?.remove(entry);
      handles.set(handle, null);
    });
    stage = null;
    status = "fallback";
    emit();
  },

  clear() {
    handles.forEach((entry, handle) => {
      if (entry) stage?.remove(entry);
      handles.set(handle, null);
    });
    stage = null;
    status = "pending";
    emit();
  },

  attach(handle: MarkHandle) {
    handles.set(handle, stage ? stage.add(handle) : null);
    return () => {
      const entry = handles.get(handle);
      if (entry) stage?.remove(entry);
      handles.delete(handle);
    };
  },
};
