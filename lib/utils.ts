import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Difficulty, Confidence } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function difficultyColor(d: Difficulty) {
  return {
    Easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Hard: 'bg-orange-100 text-orange-800 border-orange-200',
    Complex: 'bg-red-100 text-red-800 border-red-200',
  }[d];
}

export function difficultyDot(d: Difficulty) {
  return {
    Easy: 'bg-emerald-500',
    Medium: 'bg-amber-500',
    Hard: 'bg-orange-500',
    Complex: 'bg-red-500',
  }[d];
}

export function confidenceColor(c: Confidence) {
  return {
    High: 'text-emerald-700',
    Medium: 'text-amber-700',
    Low: 'text-red-700',
  }[c];
}

export function confidenceBg(c: Confidence) {
  return {
    High: 'bg-emerald-50 border-emerald-200',
    Medium: 'bg-amber-50 border-amber-200',
    Low: 'bg-red-50 border-red-200',
  }[c];
}
