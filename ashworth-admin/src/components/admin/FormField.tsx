import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#57534E]">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full rounded-md border border-[#DCD6C8] bg-white px-3.5 py-2.5 text-sm text-[#221D17] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25 disabled:bg-[#F5F3EE] disabled:text-[#A8A29E]"
      />
    </div>
  );
}

export function PrimaryButton({
  children,
  isLoading,
  ...buttonProps
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <button
      {...buttonProps}
      disabled={buttonProps.disabled || isLoading}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#C9A227] px-4 py-2.5 text-sm font-semibold text-[#221D17] transition hover:bg-[#BB9622] disabled:cursor-not-allowed disabled:bg-[#DCCB92] disabled:text-[#8A7B4D]"
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}
