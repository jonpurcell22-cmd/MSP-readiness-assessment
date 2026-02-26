import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function AssessmentLayout({
  children,
  rightContent,
}: {
  children: ReactNode;
  rightContent?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header rightContent={rightContent} />
      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 py-8 overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
}
