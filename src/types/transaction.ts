import { TRANSACTION_TYPES } from '../constants/transaction-types'; 
import { Category } from './category';
import { Merchant } from './merchant'; 

export interface Transaction {
  _id: string;
  _account: string;
  _user: string;
  _connection: string;
  created_at: string;
  updated_at: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  type: TRANSACTION_TYPES;
  hash: string;
  meta: Meta;
  merchant: Merchant;
  category: Category;
  groups: string;
  personal_finance: string; 
}

export interface Meta {
  reference:string;
  particulars:string;
}