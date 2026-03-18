"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "#8b8b9a",
    marginBottom: 6,
    display: "block",
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="first_name" style={labelStyle}>
            First Name <span style={{ color: "#4cf37b" }}>*</span>
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            placeholder="Jane"
            className="input-dark"
          />
        </div>
        <div>
          <label htmlFor="last_name" style={labelStyle}>
            Last Name <span style={{ color: "#4cf37b" }}>*</span>
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            placeholder="Smith"
            className="input-dark"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company_name" style={labelStyle}>
          Company Name <span style={{ color: "#4cf37b" }}>*</span>
        </label>
        <input
          id="company_name"
          name="company_name"
          required
          placeholder="Acme Corp"
          className="input-dark"
        />
      </div>

      <div>
        <label htmlFor="email" style={labelStyle}>
          Work Email <span style={{ color: "#4cf37b" }}>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jane@acme.com"
          className="input-dark"
        />
      </div>

      <div>
        <label htmlFor="title" style={labelStyle}>
          Title <span style={{ color: "#4cf37b" }}>*</span>
        </label>
        <select
          id="title"
          name="title"
          required
          defaultValue=""
          className="select-dark"
        >
          <option value="" disabled>Select your title</option>
          <option value="Founder/CEO">Founder/CEO</option>
          <option value="COO/CRO">COO/CRO</option>
          <option value="VP of Sales/Channel">VP of Sales/Channel</option>
          <option value="VP/Director of MSP">VP/Director of MSP</option>
        </select>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
        style={{
          marginTop: 4,
          height: 48,
          width: "100%",
          fontSize: 15,
          border: "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Starting..." : "Start Your Assessment"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12, color: "#555566", margin: 0 }}>
        Your information is confidential.
      </p>
    </form>
  )
}
