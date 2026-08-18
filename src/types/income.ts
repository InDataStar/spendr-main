export interface Income {
  id: string;
  name: string;
  amount: number;
  startDate: string;
  frequency: IncomeFrequency;
}

export type IncomeFrequency =
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "MONTHLY"
  | "YEARLY";