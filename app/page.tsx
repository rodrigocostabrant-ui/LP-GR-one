import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Metodo from "@/components/sections/Metodo";
import Processo from "@/components/sections/Processo";
import ManifestoTipografico from "@/components/sections/ManifestoTipografico";
import AntesDepois from "@/components/sections/AntesDepois";
import Investimento from "@/components/sections/Investimento";
import Contato from "@/components/sections/Contato";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Metodo />
        <Processo />
        <ManifestoTipografico />
        <AntesDepois />
        <Investimento />
        <Contato />
      </main>
      <Footer />
    </>
  );
}
