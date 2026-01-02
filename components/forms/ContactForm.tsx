"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/lib/constants";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  carBrand: string;
  model: string;
  year: string;
  vin: string;
  inquiry: string;
  _honeypot?: string;
};

export function ContactForm() {
  const t = useTranslations("forms.contact");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Don't submit if honeypot field is filled
    if (data._honeypot) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(
        `https://formspree.io/f/${SITE_CONFIG.formspree.contactFormId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            carBrand: data.carBrand,
            model: data.model,
            year: data.year,
            vin: data.vin || "Not provided",
            inquiry: data.inquiry,
          }),
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Honeypot field - hidden from users but visible to bots */}
      <input
        type="text"
        {...register("_honeypot")}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-white font-medium mb-2"
          >
            {t("firstName")} <span className="text-mb-blue">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName", { required: t("required") })}
            className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
            aria-invalid={errors.firstName ? "true" : "false"}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p
              id="firstName-error"
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-white font-medium mb-2"
          >
            {t("lastName")} <span className="text-mb-blue">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName", { required: t("required") })}
            className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
            aria-invalid={errors.lastName ? "true" : "false"}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p
              id="lastName-error"
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-white font-medium mb-2">
            {t("email")} <span className="text-mb-blue">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: t("required"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("invalidEmail"),
              },
            })}
            className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-white font-medium mb-2">
            {t("phone")} <span className="text-mb-blue">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone", {
              required: t("required"),
              pattern: {
                value:
                  /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                message: t("invalidPhone"),
              },
            })}
            className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
            aria-invalid={errors.phone ? "true" : "false"}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p
              id="phone-error"
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-white font-medium mb-2">
          {t("subject")} <span className="text-mb-blue">*</span>
        </label>
        <input
          id="subject"
          type="text"
          {...register("subject", { required: t("required") })}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
          aria-invalid={errors.subject ? "true" : "false"}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        />
        {errors.subject && (
          <p
            id="subject-error"
            className="mt-2 text-sm text-red-400"
            role="alert"
          >
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Car Brand (dropdown with only Mercedes-Benz) */}
      <div>
        <label htmlFor="carBrand" className="block text-white font-medium mb-2">
          {t("carBrand")} <span className="text-mb-blue">*</span>
        </label>
        <select
          id="carBrand"
          {...register("carBrand", { required: t("required") })}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white focus:outline-none focus:border-mb-blue transition-colors"
          aria-invalid={errors.carBrand ? "true" : "false"}
          aria-describedby={errors.carBrand ? "carBrand-error" : undefined}
        >
          <option value="">{t("select")}</option>
          <option value="Mercedes-Benz">Mercedes-Benz</option>
        </select>
        {errors.carBrand && (
          <p
            id="carBrand-error"
            className="mt-2 text-sm text-red-400"
            role="alert"
          >
            {errors.carBrand.message}
          </p>
        )}
      </div>

      {/* Model & Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="model" className="block text-white font-medium mb-2">
            {t("model")} <span className="text-mb-blue">*</span>
          </label>
          <input
            id="model"
            type="text"
            {...register("model", { required: t("required") })}
            className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
            placeholder={t("modelPlaceholder")}
            aria-invalid={errors.model ? "true" : "false"}
            aria-describedby={errors.model ? "model-error" : undefined}
          />
          {errors.model && (
            <p
              id="model-error"
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {errors.model.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="year" className="block text-white font-medium mb-2">
            {t("year")} <span className="text-mb-blue">*</span>
          </label>
          <input
            id="year"
            type="number"
            {...register("year", {
              required: t("required"),
              min: { value: 1900, message: t("invalidYear") },
              max: {
                value: new Date().getFullYear() + 1,
                message: t("invalidYear"),
              },
            })}
            className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
            aria-invalid={errors.year ? "true" : "false"}
            aria-describedby={errors.year ? "year-error" : undefined}
          />
          {errors.year && (
            <p
              id="year-error"
              className="mt-2 text-sm text-red-400"
              role="alert"
            >
              {errors.year.message}
            </p>
          )}
        </div>
      </div>

      {/* VIN Number (optional) */}
      <div>
        <label htmlFor="vin" className="block text-white font-medium mb-2">
          {t("vin")}
        </label>
        <input
          id="vin"
          type="text"
          {...register("vin")}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors"
          maxLength={17}
        />
      </div>

      {/* Inquiry */}
      <div>
        <label htmlFor="inquiry" className="block text-white font-medium mb-2">
          {t("inquiry")} <span className="text-mb-blue">*</span>
        </label>
        <textarea
          id="inquiry"
          rows={5}
          {...register("inquiry", { required: t("required") })}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors resize-y"
          aria-invalid={errors.inquiry ? "true" : "false"}
          aria-describedby={errors.inquiry ? "inquiry-error" : undefined}
        />
        {errors.inquiry && (
          <p
            id="inquiry-error"
            className="mt-2 text-sm text-red-400"
            role="alert"
          >
            {errors.inquiry.message}
          </p>
        )}
      </div>

      {/* Submit Status Messages */}
      {submitStatus === "success" && (
        <div
          className="p-4 bg-green-900/30 border border-green-700 rounded-button text-green-400"
          role="alert"
        >
          {t("success")}
        </div>
      )}

      {submitStatus === "error" && (
        <div
          className="p-4 bg-red-900/30 border border-red-700 rounded-button text-red-400"
          role="alert"
        >
          {t("error")}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full bg-mb-blue text-white px-8 py-4 rounded-button hover:opacity-90 transition-opacity font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <span className="relative z-10">
          {isSubmitting ? t("submitting") : t("submit")}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300 disabled:opacity-50" />
      </button>
    </form>
  );
}
