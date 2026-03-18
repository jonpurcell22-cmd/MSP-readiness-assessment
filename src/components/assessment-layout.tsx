import { Header } from "./header"
import { Footer } from "./footer"

export function AssessmentLayout({
  children,
  rightContent,
}: {
  children: React.ReactNode
  rightContent?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col" style={{ background: "#0a0a0f" }}>
      {/* Radial green bloom */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(76,243,123,0.07) 0%, transparent 60%)",
        }}
      />
      <Header rightContent={rightContent} />
      <main className="relative z-10 mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 py-10 overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  )
}
