"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LeadCaptureForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const firstName = (formData.get("first_name") as string).trim()
    const lastName = (formData.get("last_name") as string).trim()
    const companyName = (formData.get("company_name") as string).trim()
    const email = (formData.get("email") as string).trim()
    const title = (formData.get("title") as string).trim()

    const payload = {
      contact_name: `${firstName} ${lastName}`.trim(),
      email,
      company_name: companyName,
      title: title || null,
      phone: null,
      company_website: null,
      product_category: null,
      current_revenue: null,
    }

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({})) as { id?: string; error?: string }

      if (!res.ok) {
        setError(data?.error ?? "Failed to start. Please try again.")
        setIsSubmitting(false)
        return
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("assessment_first_name", firstName)
      }

      router.push(`/assessment?id=${data.id}`)
    } catch {
      setError("Unable to reach the server. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="first_name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input id="first_name" name="first_name" required placeholder="Jane" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="last_name" name="last_name" required placeholder="Smith" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company_name">
          Company Name <span className="text-destructive">*</span>
        </Label>
        <Input id="company_name" name="company_name" required placeholder="Acme Corp" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">
          Work Email <span className="text-destructive">*</span>
        </Label>
        <Input id="email" name="email" type="email" required placeholder="jane@acme.com" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <select
          id="title"
          name="title"
          required
          defaultValue=""
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="" disabled>Select your title</option>
          <option value="Founder/CEO">Founder/CEO</option>
          <option value="COO/CRO">COO/CRO</option>
          <option value="VP of Sales/Channel">VP of Sales/Channel</option>
          <option value="VP/Director of MSP">VP/Director of MSP</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-bold text-base shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      >
        {isSubmitting ? "Starting..." : "Start Your Assessment"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your information is confidential.
      </p>
    </form>
  )
}
