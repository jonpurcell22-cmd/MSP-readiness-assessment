"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const NAV_LINKS = [
  { label: "Problems", href: "https://untappedchannelstrategy.com#problems" },
  { label: "How It Works", href: "https://untappedchannelstrategy.com#how-it-works" },
  { label: "Services", href: "https://untappedchannelstrategy.com#services" },
  { label: "About", href: "https://untappedchannelstrategy.com#about" },
]

const CALENDLY = "https://calendly.com/jon-untappedchannelstrategy/30min"

export function Header({ rightContent }: { rightContent?: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const navBg = scrolled
    ? "rgba(17,17,17,0.9)"
    : "transparent"
  const navBorder = scrolled
    ? "1px solid #2a2a2a"
    : "1px solid transparent"

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <div style={{ background: navBg, borderBottom: navBorder, backdropFilter: scrolled ? "blur(12px)" : "none", transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">

            <a href="https://untappedchannelstrategy.com" className="inline-flex shrink-0 items-center opacity-90 hover:opacity-100 transition-opacity">
              <Image
                src="/logo-inverted.svg"
                alt="Untapped Channel Strategy"
                width={431}
                height={100}
                className="h-[30px] w-auto md:h-9"
                priority
              />
            </a>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,245,245,0.8)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#F5F5F5")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,245,245,0.8)")}
                >
                  {item.label}
                </a>
              ))}
              <a
                href={CALENDLY}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: "'Raleway', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4CF37B", border: "1px solid #4CF37B", padding: "8px 16px", textDecoration: "none", transition: "transform 0.15s", display: "inline-flex", alignItems: "center" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                Book a Call
              </a>
              {rightContent && (
                <div style={{ color: "#888888", fontSize: 13 }}>{rightContent}</div>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="inline-flex md:hidden"
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", border: "1px solid #2a2a2a", background: "rgba(17,17,17,0.2)", color: "#F5F5F5", position: "relative" }}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" style={{ position: "absolute", height: 1, width: 20, background: "currentColor", transition: "transform 0.2s", transform: open ? "translateY(0) rotate(45deg)" : "translateY(-6px)" }} />
              <span aria-hidden="true" style={{ position: "absolute", height: 1, width: 20, background: "currentColor", transition: "opacity 0.2s", opacity: open ? 0 : 1 }} />
              <span aria-hidden="true" style={{ position: "absolute", height: 1, width: 20, background: "currentColor", transition: "transform 0.2s", transform: open ? "translateY(0) rotate(-45deg)" : "translateY(6px)" }} />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[99]"
          style={{ background: "#111111" }}
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6 md:px-8">
            <div className="flex items-center justify-between">
              <a href="https://untappedchannelstrategy.com">
                <Image
                  src="/logo-inverted.svg"
                  alt="Untapped Channel Strategy"
                  width={431}
                  height={100}
                  className="h-[30px] w-auto"
                  priority
                />
              </a>
              <button
                type="button"
                style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #2a2a2a", color: "#F5F5F5", fontSize: 20 }}
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mt-10 flex flex-1 flex-col gap-6">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: "'Raleway', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "0.04em", color: "#F5F5F5", textDecoration: "none" }}
                >
                  {item.label}
                </a>
              ))}

              <div style={{ paddingTop: 16 }}>
                <a
                  href={CALENDLY}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: "'Raleway', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4CF37B", border: "1px solid #4CF37B", padding: "16px 20px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", transition: "transform 0.15s" }}
                >
                  Book a Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
