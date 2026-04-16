import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold-300/60 focus:ring-2 focus:ring-gold-300/20",
        className,
      )}
      {...props}
    />
  );
}
