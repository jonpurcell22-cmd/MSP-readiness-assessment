import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FinancialsForm } from "@/components/FinancialsForm";

export default function AssessmentFinancialsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#ffffff] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#333333] sm:text-3xl">
            Your Numbers
          </h1>
          <p className="mt-2 text-[#333333]/80">
            We use these to model the financial impact of an MSP channel. Estimates are fine.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border-t-[2px] border-t-[#4cf37b] bg-card p-6 shadow-lg sm:p-8">
          <FinancialsForm />
        </section>
      </div>
    </main>
      <Footer />
    </>
  );
}
