import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFormBadgeColor(result: "W" | "D" | "L") {
  switch (result) {
    case "W": return "bg-green-500 text-white border-green-600";
    case "D": return "bg-zinc-500 text-white border-zinc-600";
    case "L": return "bg-red-500 text-white border-red-600";
    default: return "bg-zinc-700 text-white";
  }
}
