import { FinancialsForm } from "@/components/FinancialsForm";

export default function AssessmentFinancialsPage() {
  return (
    <main className="min-h-screen bg-[#F4F7FA] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#1B3A5C] sm:text-3xl">
            Your Numbers
          </h1>
          <p className="mt-2 text-[#1B3A5C]/80">
            We use these to model the financial impact of an MSP channel. Estimates are fine.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <FinancialsForm />
        </section>
      </div>
    </main>
  );
}
