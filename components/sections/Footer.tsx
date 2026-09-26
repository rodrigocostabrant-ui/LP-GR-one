import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer style={{ position: "relative", padding: "48px var(--m) 28px", background: "var(--bg)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 24, font: "400 13px/1.5 var(--font-sans)", color: "var(--mute)" }}>
          <span>{site.footer.nome}</span>
          <nav aria-label="Rodapé" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {site.nav.map((item) => (
              <a key={item.id} href={`#${item.id}`} style={{ color: "var(--silver)" }}>
                {item.label}
              </a>
            ))}
          </nav>
          <span>{site.footer.copyright}</span>
        </div>
        <div
          aria-hidden="true"
          style={{
            font: "900 clamp(80px,24vw,440px)/.78 var(--font-sans)",
            fontVariationSettings: "'wdth' 118",
            letterSpacing: "-.06em",
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(238,241,245,.22), rgba(238,241,245,0) 85%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            userSelect: "none",
          }}
        >
          {site.footer.marca}
        </div>
      </div>
    </footer>
  );
}
