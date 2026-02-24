import { LeadCaptureForm } from "@/components/LeadCaptureForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F4F7FA]">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1B3A5C] sm:text-4xl">
            Is Your Product Ready for MSP Distribution?
          </h1>
          <p className="mt-4 text-xl text-[#1B3A5C]/90">
            Find out in 10 minutes. Get a personalized readiness score and financial impact analysis.
          </p>
          <p className="mt-4 text-[#1B3A5C]/80">
            MSPs control access to millions of customers. This assessment evaluates your product, pricing, organization, and competitive position against the 7 dimensions that determine whether an MSP program will succeed or fail.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <LeadCaptureForm />
        </section>
      </div>
    </main>
  );
}
