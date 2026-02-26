"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const titles = [
  "CEO / Founder",
  "CRO / VP Sales",
  "VP Partnerships / Channel",
  "VP Marketing",
  "VP Product",
  "COO / Operations",
  "Other",
]

const categories = [
  "Cybersecurity",
  "Cloud / Infrastructure",
  "Backup & Disaster Recovery",
  "Unified Communications",
  "RMM / PSA",
  "Compliance / GRC",
  "Networking / SD-WAN",
  "SaaS / Productivity",
  "Other",
]

export function LeadCaptureForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    const payload = {
      contact_name: `${formData.get("first_name")} ${formData.get("last_name")}`,
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      company_name: formData.get("company_name"),
      title: formData.get("title") || null,
      current_revenue: null,
    }

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to start assessment")
      }

      const data = await res.json()

      // Store additional fields in sessionStorage for later use
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "assessment_meta",
          JSON.stringify({
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            company_website: formData.get("company_website"),
            product_category: formData.get("product_category"),
            title: formData.get("title"),
          })
        )
      }

      router.push(`/assessment/1?id=${data.id}`)
    } catch {
      setError("Something went wrong. Please try again.")
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
          <Input id="first_name" name="first_name" required placeholder="John" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="last_name" name="last_name" required placeholder="Smith" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@company.com"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Select name="title">
            <SelectTrigger id="title">
              <SelectValue placeholder="Select your title" />
            </SelectTrigger>
            <SelectContent>
              {titles.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company_name">
          Company Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="company_name"
          name="company_name"
          required
          placeholder="Acme Corp"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company_website">Company Website</Label>
          <Input
            id="company_website"
            name="company_website"
            placeholder="www.acme.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_category">Product Category</Label>
          <Select name="product_category">
            <SelectTrigger id="product_category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 h-14 bg-[var(--brand-green)] text-[var(--brand-dark)] hover:bg-[var(--brand-green)]/90 font-bold text-base shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      >
        {isSubmitting ? "Starting Assessment..." : "Start Your Assessment"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your information is confidential. Results are delivered by email only.
      </p>
    </form>
  )
}
