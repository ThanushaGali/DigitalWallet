export interface Item {
  item: string;
  price: number;
}

export interface Receipt {
  id: string;
  image?: string; // Optional, as it's being removed
  date: string;
  vendor: string;
  totalAmount: number;
  itemizedList: Item[];
  category: string;
  confidence: number;
  isFraudulent: boolean;
  fraudulentDetails: string;
}
