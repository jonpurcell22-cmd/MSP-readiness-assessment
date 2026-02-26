"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";
import { TITLE_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
} from "@/components/ui/select";

export function LeadCaptureForm() {
  const router = useRouter();
  const setContact = useAssessmentStore((s) => s.setContact);
  const reset = useAssessmentStore((s) => s.reset);
  const contact = useAssessmentStore((s) => s.contact);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const first = contact.fullName.trim().split(/\s+/)[0] ?? "";
  const last = contact.fullName.trim().split(/\s+/).slice(1).join(" ") ?? "";

  function validate(): boolean {
    const next: Record<string, string> = {};
    const fullName = `${first.trim()} ${last.trim()}`.trim();
    if (!fullName) next.fullName = "Required";
    if (!contact.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
      next.email = "Enter a valid email";
    if (!contact.phone.trim()) next.phone = "Required";
    if (!contact.title) next.title = "Required";
    if (!contact.companyName.trim()) next.companyName = "Required";
    if (!contact.productCategory) next.productCategory = "Required";
    if (
      contact.companyWebsite.trim() &&
      !/^https?:\/\/.+/.test(contact.companyWebsite.trim())
    ) {
      next.companyWebsite = "Enter a valid URL (e.g. https://example.com)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fullName = `${first.trim()} ${last.trim()}`.trim();
    if (!validate()) return;
    reset();
    setContact({
      fullName,
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      title: contact.title,
      companyName: contact.companyName.trim(),
      companyWebsite: contact.companyWebsite.trim() || "",
      productCategory: contact.productCategory,
    });
    router.push("/assessment/1");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="first_name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="first_name"
            value={first}
            onChange={(e) =>
              setContact({
                fullName: `${e.target.value} ${last}`.trim(),
              })
            }
            placeholder="John"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="last_name"
            value={last}
            onChange={(e) =>
              setContact({
                fullName: `${first} ${e.target.value}`.trim(),
              })
            }
            placeholder="Smith"
          />
        </div>
      </div>
      {errors.fullName && (
        <p className="text-sm text-destructive">{errors.fullName}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={contact.email}
          onChange={(e) => setContact({ email: e.target.value })}
          placeholder="john@company.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={contact.phone}
            onChange={(e) => setContact({ phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Select
            name="title"
            id="title"
            value={contact.title}
            onValueChange={(v) =>
              setContact({ title: v as typeof contact.title })
            }
          >
            <option value="">Select your title</option>
            {TITLE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </Select>
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company_name">
          Company Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="company_name"
          name="company_name"
          value={contact.companyName}
          onChange={(e) => setContact({ companyName: e.target.value })}
          placeholder="Acme Corp"
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company_website">Company Website</Label>
          <Input
            id="company_website"
            name="company_website"
            value={contact.companyWebsite}
            onChange={(e) => setContact({ companyWebsite: e.target.value })}
            placeholder="www.acme.com"
          />
          {errors.companyWebsite && (
            <p className="text-sm text-destructive">
              {errors.companyWebsite}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_category">
            Product Category <span className="text-destructive">*</span>
          </Label>
          <Select
            name="product_category"
            id="product_category"
            value={contact.productCategory}
            onValueChange={(v) =>
              setContact({
                productCategory: v as typeof contact.productCategory,
              })
            }
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </Select>
          {errors.productCategory && (
            <p className="text-sm text-destructive">
              {errors.productCategory}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="mt-3 h-14 bg-[var(--brand-green)] text-[var(--brand-dark)] font-bold shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--brand-green)]/90 hover:shadow-lg"
      >
        Start Your Assessment
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your information is confidential. Results are delivered by email only.
      </p>
    </form>
  );
}
