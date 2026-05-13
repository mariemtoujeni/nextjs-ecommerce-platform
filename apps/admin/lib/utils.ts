import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const langMap:Record<string, string> = {
  'fr': 'français',
  'en': 'anglais',
}

export const generateRandomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

export const cartesianProduct = <T,>(arr: T[][]): T[][] =>
  arr.reduce<T[][]>(
    (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
    [[]]
  );
