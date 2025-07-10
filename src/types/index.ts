export interface Item {
  item: string;
  price: number;
}

export interface Receipt {
  id: string;
  image: string; // Can be a data URI from upload or a URL for mock data
  date: string;
  vendor: string;
  totalAmount: number;
  itemizedList: Item[];
  category: string;
  confidence: number;
  isFraudulent: boolean;
  fraudulentDetails: string;
  wallet: 'Personal' | 'Family'; // New property for shared wallets
}
