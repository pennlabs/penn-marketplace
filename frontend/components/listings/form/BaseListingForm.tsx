"use client";

import { useEffect } from "react";
import { Controller, Control, FieldErrors, Path, FieldError } from "react-hook-form";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BaseCreatePayload } from "@/lib/types";

type BaseFields = "title" | "price" | "description";

export interface BaseListingFormProps<T extends BaseCreatePayload> {
  control: Control<T>;
  errors: FieldErrors<T>;
  touchedFields: Partial<Record<keyof T, boolean>>;
  disabled?: boolean;
  displayLabel: string;
  exampleTitle: string;
  /** when true, show "/mo" suffix on price */
  isSublet?: boolean;
  /** rendered between price and description */
  childrenAfterPrice?: React.ReactNode;
  /** rendered after description */
  childrenAfterDescription?: React.ReactNode;
  /** when provided, warns on tab/window close if form is dirty or has unsaved images */
  abandonGuard?: { isDirty: boolean; unsavedImageCount: number };
}

const getErrorMessage = (error: FieldError | undefined): string | undefined => {
  return error?.message;
};

export const BaseListingForm = <T extends BaseCreatePayload>({
  control,
  errors,
  touchedFields,
  disabled = false,
  displayLabel,
  exampleTitle,
  isSublet = false,
  childrenAfterPrice,
  childrenAfterDescription,
  abandonGuard,
}: BaseListingFormProps<T>) => {
  /**
   * safe cast: BaseCreatePayload guarantees these keys exist on T.
   * RHF's Path<T> is too deeply recursive for TS to infer this automatically
   */
  const basePath = (name: keyof BaseCreatePayload) => name as Path<T>;

  useEffect(() => {
    if (abandonGuard === undefined) return;
    const { isDirty, unsavedImageCount } = abandonGuard;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || unsavedImageCount > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [abandonGuard]);

  return (
    <>
      {/* title */}
      <Controller
        name={basePath("title")}
        control={control}
        render={({ field }) => (
          <FormField
            label={`${displayLabel} title`}
            error={getErrorMessage(errors.title as FieldError)}
            touched={touchedFields.title}
          >
            <Input
              {...field}
              placeholder={exampleTitle}
              aria-invalid={!!errors.title}
              disabled={disabled}
              autoComplete="off"
            />
          </FormField>
        )}
      />

      {/* price */}
      <Controller
        name={basePath("price")}
        control={control}
        render={({ field }) => (
          <FormField
            label={`${displayLabel} Price`}
            error={getErrorMessage(errors.price as FieldError)}
            touched={touchedFields.price}
          >
            <div className="relative">
              <span
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                aria-hidden="true"
              >
                $
              </span>
              <Input
                {...field}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className={isSublet ? "pr-12 pl-7" : "pl-7"}
                aria-invalid={!!errors.price}
                disabled={disabled}
                autoComplete="off"
              />
              {isSublet && (
                <span
                  className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                  aria-hidden="true"
                >
                  /mo
                </span>
              )}
            </div>
          </FormField>
        )}
      />

      {childrenAfterPrice}

      {/* description */}
      <Controller
        name={basePath("description")}
        control={control}
        render={({ field }) => (
          <FormField
            label={`${displayLabel} Description`}
            error={getErrorMessage(errors.description as FieldError)}
            touched={touchedFields.description}
          >
            <Textarea
              {...field}
              placeholder={`Enter ${displayLabel} Description`}
              className="min-h-[120px] resize-y"
              aria-invalid={!!errors.description}
              disabled={disabled}
            />
          </FormField>
        )}
      />

      {childrenAfterDescription}
    </>
  );
};
