

import { useState } from "react";
import { z } from "zod";
import { timeStringToMinutes } from "@/common/common-utils/util-shift/wageCalculator";

export function useZodForm<T extends z.ZodSchema>(schema: T) {
  type FormData = z.infer<T>;

  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: unknown): data is FormData => {
    const result = schema.safeParse(data);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      for (const error of result.error.issues) {
        const path = error.path.join(".");
        newErrors[path] = error.message;
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (
    onSubmit: (data: FormData) => Promise<void> | void
  ) => {
    setIsSubmitting(true);

    try {
      if (validate(formData)) {
        await onSubmit(formData);
      }
    } catch (error) {
      setErrors({
        _submit: error instanceof Error ? error.message : "Submission failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as string]) {
      const testData = { ...formData, [field]: value };
      const result = schema.safeParse(testData);

      if (
        result.success ||
        !result.error.issues.some((e: any) => e.path.includes(field as string))
      ) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  };

  const reset = () => {
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    validate,
    handleSubmit,
    updateField,
    reset,
    hasErrors: Object.keys(errors).length > 0,
  };
}

export function useUserForm() {
  const UserFormSchema = z.object({
    nickname: z.string().min(1, "ニックネームは必須です"),
    email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "有効なメールアドレスを入力してください",
    }),
    password: z.string().min(6, "パスワードは6文字以上です"),
    role: z.enum(["master", "user"], {
      message: "ロールを選択してください",
    }),
    color: z.string().optional(),
    hourlyWage: z.number().positive("時給は正の数値です").optional(),
  });

  return useZodForm(UserFormSchema);
}

export function useShiftForm() {
  const ShiftFormSchema = z
    .object({
      shiftDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "日付を選択してください",
      }),
      startTime: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
        message: "開始時刻を入力してください",
      }),
      endTime: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
        message: "終了時刻を入力してください",
      }),
      memo: z.string().max(500, "メモは500文字以内です").optional(),
    })
    .refine(
      (data) => {

        return timeStringToMinutes(data.startTime) < timeStringToMinutes(data.endTime);
      },
      {
        message: "終了時刻は開始時刻より後である必要があります",
        path: ["endTime"],
      }
    );

  return useZodForm(ShiftFormSchema);
}

