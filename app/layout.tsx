import type { Metadata } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/ui/Cursor";
import WhatsAppBar from "@/components/ui/WhatsAppBar";
import MotionProvider from "@/components/motion/MotionProvider";
import StageCanvas from "@/components/three/StageCanvas";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  style: ["italic"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gr-one.vercel.app"),
  title: "GR One — landing pages que transformam visitante em cliente",
  description:
    "Estúdio de landing pages premium para empresas de serviço de alto ticket. Estratégia, texto e design com um único objetivo: começar a conversa.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "GR One",
    title: "GR One — landing pages que transformam visitante em cliente",
    description:
      "Estúdio de landing pages premium para empresas de serviço de alto ticket.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <MotionProvider>
          {/* Antes do conteúdo: elementos com z-index ≥ 2 que vêm depois ficam por cima do objeto. */}
          <StageCanvas />
          <Cursor />
          {children}
          <WhatsAppBar />
        </MotionProvider>
      </body>
    </html>
  );
}
