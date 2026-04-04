import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl", className)}
      {...props}
    />
  );
}
