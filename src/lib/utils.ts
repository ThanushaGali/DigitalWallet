import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryImage(category: string): string {
  const categoryImages: { [key: string]: string } = {
    Groceries: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/supermarket-1232944_1280.jpg',
    Dining: 'https://cdn.pixabay.com/photo/2015/04/20/13/25/restaurant-731351_1280.jpg',
    Travel: 'https://cdn.pixabay.com/photo/2016/11/18/13/47/airport-1839886_1280.jpg',
    Health: 'https://cdn.pixabay.com/photo/2018/02/10/12/00/medicine-3148711_1280.jpg',
    Entertainment: 'https://cdn.pixabay.com/photo/2016/11/29/06/15/audience-1866738_1280.jpg',
    Shopping: 'https://cdn.pixabay.com/photo/2016/03/27/22/16/bags-1283780_1280.jpg',
    Utilities: 'https://cdn.pixabay.com/photo/2014/04/02/10/55/power-lines-306543_1280.png',
    Rent: 'https://cdn.pixabay.com/photo/2016/11/29/03/52/architecture-1867187_1280.jpg',
    Other: 'https://cdn.pixabay.com/photo/2015/05/31/10/55/business-791174_1280.jpg',
  };
  return categoryImages[category] || categoryImages['Other'];
}

export function getCategoryImageWithHint(category: string): { src: string; hint: string } {
  const categoryInfo: { [key: string]: { src: string; hint: string } } = {
    Groceries: {
      src: 'https://tse1.mm.bing.net/th/id/OIP.weOGca_ZnTCQ4AAWvOWutwAAAA?w=375&h=375&rs=1&pid=ImgDetMain&o=7&rm=3',
      hint: 'fresh groceries and supermarket',
    },
    Dining: {
      src: 'https://www.decorilla.com/online-decorating/wp-content/uploads/2023/05/Rustic-modern-farmhouse-dining-room-ideas-by-Ryley-B.jpg',
      hint: 'restaurant food and meals',
    },
    Travel: {
      src: 'https://images.hdqwalls.com/download/travel-hd-2880x1800.jpg',
      hint: 'air travel and trips',
    },
    Health: {
      src: 'https://thumbs.dreamstime.com/b/good-health-best-wealth-signboard-small-wooden-green-grass-flowers-sun-ray-120158232.jpg',
      hint: 'healthcare and well-being',
    },
    Entertainment: {
      src: 'https://cdn.pixabay.com/photo/2017/01/18/19/17/popcorn-1992953_1280.jpg',
      hint: 'movies and fun',
    },
    Shopping: {
      src: 'https://a.cdn-hotels.com/gdcs/production130/d720/11434f2d-5d7f-4a59-b0be-32fff9ce2bfd.jpg',
      hint: 'retail and bags',
    },
    Utilities: {
      src: 'https://tse3.mm.bing.net/th/id/OIP.suz3d3v204LEHAq5rBUp_QHaDt?rs=1&pid=ImgDetMain&o=7&rm=3',
      hint: 'utility infrastructure',
    },
    Rent: {
      src: 'https://thumbs.dreamstime.com/b/wooden-house-inscription-rent-rental-property-apartments-services-realtor-affordable-housing-prices-real-estate-129678669.jpg',
      hint: 'rental property and home',
    },
    Other: {
      src: 'https://cdn.pixabay.com/photo/2015/01/08/18/25/money-593206_1280.jpg',
      hint: 'general finance and money',
    },
  };

  return categoryInfo[category] || categoryInfo['Other'];
}
