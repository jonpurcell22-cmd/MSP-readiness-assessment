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
    <div className="relative flex min-h-screen flex-col">
      <Header rightContent={rightContent} />
      <main className="relative z-10 w-full flex-1 flex flex-col px-6 pb-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}
