import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-gold-300 px-6 text-base font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
