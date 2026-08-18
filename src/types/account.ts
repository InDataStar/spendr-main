import { ACCOUNT_TYPES } from "../constants/account-types";
 

export interface Account {
  _id: string;
  name: string;
  type: ACCOUNT_TYPES;
  status: string; 
  connection: Connection; 
  attributes:string[];
  balance: Balance;
  formatted_account:string;
  created_at: string;
  meta:AkahuMeta;
  isPrimary:boolean;
}

export interface Balance {
  currency:string;
  current:number;
  available:number;
} 
export interface Connection {
  _id:string;
  name:string;
  logo:string;
  connection_type:string;
}

export interface AkahuMeta {
  holder?: string;

  has_unlisted_holders?: boolean;

  payment_details?: {
    account_holder: string;
    account_number: string;
    particulars?: string;
    code?: string;
    reference?: string;
    minimum_amount?: number;
  };

  loan_details?: {
    purpose?: "HOME" | "UNKNOWN" | string;

    type?: "TABLE" | "UNKNOWN" | string;

    interest?: {
      rate?: number;
      type?: "FIXED" | "VARIABLE" | string;
      expires_at?: string;
    };

    is_interest_only?: boolean;

    interest_only_expires_at?: string;

    term?: number;

    matures_at?: string;

    initial_principal?: number;

    repayment?: {
      frequency?: "MONTHLY" | string;
      next_date?: string;
      next_amount?: number;
    };
  };

  profile?:ProfileDetails;

  breakdown?: BreakDown;

  portfolio?: Portfolio[];
}

export interface BreakDown{
  returns:number;
}

export interface ProfileDetails{
  pir:number;
}


export interface Portfolio{
  fund_id:string;
  value:number;
  shares:number;
  returns:number;
  name:string;
  symbol:string;
  exchange:string;
  currency:string
  logo:string;
}