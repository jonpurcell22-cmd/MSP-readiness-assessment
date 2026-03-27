export function Footer() {
  return (
    <footer
      id="footer"
      className="py-8 md:py-12"
      style={{ position: "relative", zIndex: 10 }}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px"
        style={{ backgroundColor: "#4CF37B", opacity: 0.25 }}
      />

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: "0.18em", color: "#F5F5F5" }}>
              UNTAPPED CHANNEL STRATEGY
            </div>
            <div style={{ marginTop: 12, fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#888888" }}>
              © 2026 JPENT LLC d/b/a Untapped Channel Strategy. All rights reserved.
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center md:items-center">
            <a
              href="mailto:jon@untappedchannelstrategy.com"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#888888", textDecoration: "underline", textDecorationColor: "rgba(76,243,123,0.6)", textUnderlineOffset: 4 }}
            >
              jon@untappedchannelstrategy.com
            </a>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <a
              href="#"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#888888", textDecoration: "underline", textDecorationColor: "rgba(76,243,123,0.6)", textUnderlineOffset: 4 }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: "#888888", textDecoration: "underline", textDecorationColor: "rgba(76,243,123,0.6)", textUnderlineOffset: 4 }}
            >
              Accessibility Statement
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
