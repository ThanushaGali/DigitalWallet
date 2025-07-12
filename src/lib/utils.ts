import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryImageWithHint(category: string): { src: string; hint: string } {
  const categoryInfo: { [key: string]: { src: string; hint: string } } = {
    Groceries: {
      src: 'https://images.hdqwalls.com/download/groceries-5k-j6-1280x720.jpg',
      hint: 'groceries supermarket',
    },
    Dining: {
      src: 'https://www.multivu.com/players/English/8243951-the-coffee-bean-and-tea-leaf-regular-hold-program/image/iced-americano-1512435732126-1-HR.jpg',
      hint: 'restaurant food',
    },
    Travel: {
      src: 'https://tse3.mm.bing.net/th?id=OIP.Ude9s-c-l_t_dt0iT-z26AHaEo&pid=Api&P=0&h=180',
      hint: 'air travel',
    },
    Health: {
      src: 'https://tse1.mm.bing.net/th?id=OIP.iP-c2oVp3q0KynB-BZbEowHaEK&pid=Api&P=0&h=180',
      hint: 'healthcare medicine',
    },
    Entertainment: {
      src: 'https://cdn.pixabay.com/photo/2016/09/16/20/49/soda-1675302_1280.jpg',
      hint: 'movies fun',
    },
    Shopping: {
      src: 'https://www.decorilla.com/online-decorating/wp-content/uploads/2022/07/Luxury-Retail-Interior-Design-and-Store-Layout.jpg',
      hint: 'retail bags',
    },
    Utilities: {
      src: 'https://tse1.mm.bing.net/th?id=OIP.w0Jv7W6J6Z3X6Q8Z6Y2qQAHaE8&pid=Api&P=0&h=180',
      hint: 'utility bill',
    },
    Rent: {
      src: 'https://a.cdn-hotels.com/gdcs/production144/d1369/55415712-4462-45a7-a3ac-059a416b2a4a.jpg',
      hint: 'rental home',
    },
    Other: {
      src: 'https://placehold.co/600x400.png',
      hint: 'finance money',
    },
  };

  return categoryInfo[category] || categoryInfo['Other'];
}
