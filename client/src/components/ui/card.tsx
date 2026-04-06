import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[30px] border border-white/10 bg-white/5 p-7 shadow-glow backdrop-blur-xl", className)}
      {...props}
    />
  );
}
