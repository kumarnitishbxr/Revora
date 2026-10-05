import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { ValidationResult } from '../utils/validators';

export type ValidatorFn<T> = (values: T) => Partial<Record<keyof T, string>>;

interface UseFormOptions<T> {
  initialValues: T;
  validate?: ValidatorFn<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const runValidation = useCallback(
    (currentValues: T) => {
      if (!validate) return {};
      return validate(currentValues);
    },
    [validate]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;

      setValues((prev) => {
        const next = { ...prev, [name]: parsedValue };
        // Live validation if submit was already attempted
        if (hasSubmitted) {
          const newErrors = runValidation(next);
          setErrors(newErrors);
        }
        return next;
      });
    },
    [hasSubmitted, runValidation]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (hasSubmitted) {
          const newErrors = runValidation(next);
          setErrors(newErrors);
        }
        return next;
      });
    },
    [hasSubmitted, runValidation]
  );

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (hasSubmitted) {
        const newErrors = runValidation(values);
        setErrors(newErrors);
      }
    },
    [hasSubmitted, runValidation, values]
  );

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      setHasSubmitted(true);
      const validationErrors = runValidation(values);
      setErrors(validationErrors);

      const hasError = Object.values(validationErrors).some((msg) => !!msg);
      if (hasError) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [runValidation, values, onSubmit]
  );

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
      setHasSubmitted(false);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    hasSubmitted,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}

export default useForm;
