"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "@/lib/motion/engine";

/** Liga o motor de movimento (relógio único, Lenis, ponteiro, revelações). */
export default function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => motion.init(), []);
  return <>{children}</>;
}
