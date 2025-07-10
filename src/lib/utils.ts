import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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