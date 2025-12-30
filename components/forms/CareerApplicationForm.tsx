"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  coverLetter: string;
  _honeypot?: string;
};

export function CareerApplicationForm() {
  const t = useTranslations("forms.career");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  // Read position from URL hash and set it in the form
  useEffect(() => {
    const handlePositionSelect = (event: CustomEvent<string>) => {
      const position = event.detail;
      setValue("position", position);
      // Focus on the position dropdown after a short delay to ensure it's visible
      setTimeout(() => {
        const positionSelect = document.getElementById(
          "position"
        ) as HTMLSelectElement;
        if (positionSelect) {
          positionSelect.focus();
        }
      }, 100);
    };

    // Check URL hash on mount
    const hash = window.location.hash;
    if (hash.startsWith("#position=")) {
      const position = hash.split("=")[1];
      setValue("position", position);
    }

    // Listen for custom event
    window.addEventListener(
      "positionSelected",
      handlePositionSelect as EventListener
    );

    return () => {
      window.removeEventListener(
        "positionSelected",
        handlePositionSelect as EventListener
      );
    };
  }, [setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert(t("invalidFileType"));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("fileTooLarge"));
        return;
      }
      setProfilePicture(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePicture = () => {
    setProfilePicture(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: FormData) => {
    // Don't submit if honeypot field is filled
    if (data._honeypot) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("position", data.position);
      formData.append("experience", data.experience);
      formData.append("coverLetter", data.coverLetter);

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await fetch(
        `https://formspree.io/f/${
          SITE_CONFIG.formspree.careerFormId ||
          SITE_CONFIG.formspree.contactFormId
        }`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        reset();
        removePicture();
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
      {/* Honeypot field */}
      <input
        type="text"
        {...register("_honeypot")}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Profile Picture Upload */}
      <div>
        <label className="block text-white font-medium mb-2">
          {t("profilePicture")}
        </label>
        <div className="space-y-4">
          {preview ? (
            <div className="relative inline-block">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-mb-blue">
                <Image
                  src={preview}
                  alt={t("profilePicturePreview")}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removePicture}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                aria-label={t("removePicture")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label
                htmlFor="profilePicture"
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white hover:border-mb-blue transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t("uploadPicture")}
              </label>
              <input
                id="profilePicture"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm text-mb-silver">
                {t("fileRequirements")}
              </span>
            </div>
          )}
        </div>
      </div>

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
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-400" role="alert">
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
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-400" role="alert">
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
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400" role="alert">
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
          />
          {errors.phone && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Position */}
      <div>
        <label htmlFor="position" className="block text-white font-medium mb-2">
          {t("position")} <span className="text-mb-blue">*</span>
        </label>
        <select
          id="position"
          {...register("position", { required: t("required") })}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white focus:outline-none focus:border-mb-blue transition-colors"
          aria-invalid={errors.position ? "true" : "false"}
        >
          <option value="">{t("selectPosition")}</option>
          <option value="technician">{t("technician")}</option>
          <option value="advisor">{t("advisor")}</option>
        </select>
        {errors.position && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {errors.position.message}
          </p>
        )}
      </div>

      {/* Experience */}
      <div>
        <label
          htmlFor="experience"
          className="block text-white font-medium mb-2"
        >
          {t("experience")} <span className="text-mb-blue">*</span>
        </label>
        <textarea
          id="experience"
          rows={4}
          {...register("experience", { required: t("required") })}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors resize-y"
          placeholder={t("experiencePlaceholder")}
          aria-invalid={errors.experience ? "true" : "false"}
        />
        {errors.experience && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {errors.experience.message}
          </p>
        )}
      </div>

      {/* Cover Letter */}
      <div>
        <label
          htmlFor="coverLetter"
          className="block text-white font-medium mb-2"
        >
          {t("coverLetter")} <span className="text-mb-blue">*</span>
        </label>
        <textarea
          id="coverLetter"
          rows={6}
          {...register("coverLetter", { required: t("required") })}
          className="w-full px-4 py-3 bg-mb-anthracite border border-mb-border rounded-button text-white placeholder-mb-silver focus:outline-none focus:border-mb-blue transition-colors resize-y"
          placeholder={t("coverLetterPlaceholder")}
          aria-invalid={errors.coverLetter ? "true" : "false"}
        />
        {errors.coverLetter && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {errors.coverLetter.message}
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
        <span className="relative z-10">{isSubmitting ? t("submitting") : t("submit")}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300 disabled:opacity-50" />
      </button>
    </form>
  );
}
