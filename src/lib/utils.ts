import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryImage(category: string): string {
  const categoryImages: { [key: string]: string } = {
    Groceries: 'https://placehold.co/600x400.png',
    Dining: 'https://placehold.co/600x400.png',
    Travel: 'https://placehold.co/600x400.png',
    Health: 'https://placehold.co/600x400.png',
    Entertainment: 'https://placehold.co/600x400.png',
    Shopping: 'https://placehold.co/600x400.png',
    Utilities: 'https://placehold.co/600x400.png',
    Rent: 'https://placehold.co/600x400.png',
    Other: 'https://placehold.co/600x400.png',
  };
  return categoryImages[category] || categoryImages['Other'];
}

export function getCategoryImageWithHint(category: string): { src: string; hint: string } {
  const categoryInfo: { [key: string]: { src: string; hint: string } } = {
    Groceries: {
      src: 'https://placehold.co/600x400.png',
      hint: 'groceries supermarket',
    },
    Dining: {
      src: 'https://placehold.co/600x400.png',
      hint: 'restaurant food',
    },
    Travel: {
      src: 'https://placehold.co/600x400.png',
      hint: 'air travel',
    },
    Health: {
      src: 'https://placehold.co/600x400.png',
      hint: 'healthcare medicine',
    },
    Entertainment: {
      src: 'https://placehold.co/600x400.png',
      hint: 'movies fun',
    },
    Shopping: {
      src: 'https://placehold.co/600x400.png',
      hint: 'retail bags',
    },
    Utilities: {
      src: 'https://placehold.co/600x400.png',
      hint: 'utility bill',
    },
    Rent: {
      src: 'https://placehold.co/600x400.png',
      hint: 'rental home',
    },
    Other: {
      src: 'https://placehold.co/600x400.png',
      hint: 'finance money',
    },
  };

  return categoryInfo[category] || categoryInfo['Other'];
}
