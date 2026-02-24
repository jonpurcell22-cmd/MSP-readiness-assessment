"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";
import { TITLE_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from "@/lib/constants";

export function LeadCaptureForm() {
  const router = useRouter();
  const setContact = useAssessmentStore((s) => s.setContact);
  const reset = useAssessmentStore((s) => s.reset);
  const contact = useAssessmentStore((s) => s.contact);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!contact.fullName.trim()) next.fullName = "Required";
    if (!contact.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) next.email = "Enter a valid email";
    if (!contact.phone.trim()) next.phone = "Required";
    if (!contact.title) next.title = "Required";
    if (!contact.companyName.trim()) next.companyName = "Required";
    if (!contact.productCategory) next.productCategory = "Required";
    if (contact.companyWebsite.trim() && !/^https?:\/\/.+/.test(contact.companyWebsite.trim())) {
      next.companyWebsite = "Enter a valid URL (e.g. https://example.com)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const inputBase =
    "w-full rounded-lg border bg-white px-4 py-3 text-[#1B3A5C] placeholder:text-gray-400 focus:border-[#1A8A7D] focus:outline-none focus:ring-1 focus:ring-[#1A8A7D]";
  const inputError = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const labelBase = "mb-1.5 block text-sm font-medium text-[#1B3A5C]";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        reset();
        setContact({
          fullName: contact.fullName.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          title: contact.title,
          companyName: contact.companyName.trim(),
          companyWebsite: contact.companyWebsite.trim() || "",
          productCategory: contact.productCategory,
        });
        router.push("/assessment/product");
      }}
      className="flex flex-col gap-5"
    >
      <div>
        <label htmlFor="fullName" className={labelBase}>
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={contact.fullName}
          onChange={(e) => setContact({ fullName: e.target.value })}
          className={`${inputBase} ${errors.fullName ? inputError : "border-gray-300"}`}
          placeholder="Jane Smith"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelBase}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={contact.email}
          onChange={(e) => setContact({ email: e.target.value })}
          className={`${inputBase} ${errors.email ? inputError : "border-gray-300"}`}
          placeholder="jane@company.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelBase}>
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={contact.phone}
          onChange={(e) => setContact({ phone: e.target.value })}
          className={`${inputBase} ${errors.phone ? inputError : "border-gray-300"}`}
          placeholder="(555) 123-4567"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="title" className={labelBase}>
          Title <span className="text-red-500">*</span>
        </label>
        <select
          id="title"
          required
          value={contact.title}
          onChange={(e) => setContact({ title: e.target.value as typeof contact.title })}
          className={`${inputBase} ${errors.title ? inputError : "border-gray-300"} cursor-pointer`}
        >
          <option value="">Select One</option>
          {TITLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="companyName" className={labelBase}>
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          id="companyName"
          type="text"
          required
          value={contact.companyName}
          onChange={(e) => setContact({ companyName: e.target.value })}
          className={`${inputBase} ${errors.companyName ? inputError : "border-gray-300"}`}
          placeholder="Acme Inc."
        />
        {errors.companyName && <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>}
      </div>

      <div>
        <label htmlFor="companyWebsite" className={labelBase}>
          Company Website <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="companyWebsite"
          type="url"
          value={contact.companyWebsite}
          onChange={(e) => setContact({ companyWebsite: e.target.value })}
          className={`${inputBase} ${errors.companyWebsite ? inputError : "border-gray-300"}`}
          placeholder="https://acme.com"
        />
        {errors.companyWebsite && <p className="mt-1 text-sm text-red-500">{errors.companyWebsite}</p>}
      </div>

      <div>
        <label htmlFor="productCategory" className={labelBase}>
          Product Category <span className="text-red-500">*</span>
        </label>
        <select
          id="productCategory"
          required
          value={contact.productCategory}
          onChange={(e) => setContact({ productCategory: e.target.value as typeof contact.productCategory })}
          className={`${inputBase} ${errors.productCategory ? inputError : "border-gray-300"} cursor-pointer`}
        >
          <option value="">Select One</option>
          {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.productCategory && <p className="mt-1 text-sm text-red-500">{errors.productCategory}</p>}
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#1A8A7D] px-6 py-4 font-semibold text-white transition hover:bg-[#157a6e] focus:outline-none focus:ring-2 focus:ring-[#1A8A7D] focus:ring-offset-2"
      >
        Start Assessment →
      </button>
    </form>
  );
}
