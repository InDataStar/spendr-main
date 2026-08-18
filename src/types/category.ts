import { Transaction } from "./transaction";

export interface Category {
  _id: string;
  direction: string;
  name: string;
  groups?: Groups;
}

export interface Groups {
  personal_finance: PersonalFinance;
}

export interface PersonalFinance {
  _id: string;
  name: string;
}


export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  total: number;
  transactions: Transaction[];
}