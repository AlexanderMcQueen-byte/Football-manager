import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFormBadgeColor(result: "W" | "D" | "L") {
  switch (result) {
    case "W": return "badge-win";
    case "D": return "badge-draw";
    case "L": return "badge-loss";
    default: return "bg-zinc-800 text-zinc-500 border border-zinc-700";
  }
}
