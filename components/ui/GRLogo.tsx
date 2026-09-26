import { useId } from "react";
import { LOCKUP, MONOGRAM } from "./gr-logo-paths";

const aspect = (viewBox: string) => {
  const [, , w, h] = viewBox.split(" ").map(Number);
  return w / h;
};

/** Monograma + "GR ONE" em prata (degradê de cima para baixo), altura em px. */
export function GRLockup({ height }: { height: number }) {
  const id = useId();
  return (
    <svg viewBox={LOCKUP.viewBox} width={height * aspect(LOCKUP.viewBox)} height={height} aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.2" style={{ stopColor: "#FFFFFF" }} />
          <stop offset="1" style={{ stopColor: "#8E97A6" }} />
        </linearGradient>
      </defs>
      <path d={LOCKUP.monogram} fill={`url(#${id})`} fillRule="evenodd" />
      <path d={LOCKUP.name} fill="var(--silver)" fillRule="evenodd" />
    </svg>
  );
}

/** Máscara CSS do monograma: permite pintar o "GR" com qualquer fundo (ex.: o brilho animado da versão estática). */
export const MONOGRAM_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MONOGRAM.viewBox}"><path fill-rule="evenodd" d="${MONOGRAM.d}"/></svg>`,
)}")`;

export const MONOGRAM_ASPECT = aspect(MONOGRAM.viewBox);
