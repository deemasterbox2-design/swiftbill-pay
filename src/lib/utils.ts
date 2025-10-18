// File: utils.ts | Path: src/lib/utils.ts
// Function: Utility functions for className merging with tailwind-merge
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
