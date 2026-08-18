import { Income } from "../types/income";
import {
  loadFromStorageAsync,
  removeFromStorageAsync,
  saveToStorageAsync,
} from "./async-storage-services";
 

const INCOME_STORAGE_KEY = "@income";

export const IncomeServices = {
  /**
   * Get all income sources
   */
  getIncome: async (): Promise<Income[]> => {
    const income = await loadFromStorageAsync(INCOME_STORAGE_KEY);

    return income ?? [];
  },

  /**
   * Get a single income source
   */
  getIncomeById: async (id: string): Promise<Income | null> => {
    const income = await IncomeServices.getIncome();

    return income.find((item) => item.id === id) ?? null;
  },

  /**
   * Add income
   */
  addIncome: async (newIncome: Income): Promise<Income> => {
    const income = await IncomeServices.getIncome();

    const updatedIncome = [...income, newIncome];

    await saveToStorageAsync(
      INCOME_STORAGE_KEY,
      updatedIncome,
    );

    return newIncome;
  },

  /**
   * Update income
   */
  updateIncome: async (updatedIncome: Income): Promise<Income> => {
    const income = await IncomeServices.getIncome();

    const updated = income.map((item) =>
      item.id === updatedIncome.id
        ? updatedIncome
        : item,
    );

    await saveToStorageAsync(
      INCOME_STORAGE_KEY,
      updated,
    );

    return updatedIncome;
  },

  /**
   * Delete income
   */
  deleteIncome: async (id: string): Promise<void> => {
    const income = await IncomeServices.getIncome();

    const updated = income.filter(
      (item) => item.id !== id,
    );

    await saveToStorageAsync(
      INCOME_STORAGE_KEY,
      updated,
    );
  },

  /**
   * Delete all income
   */
  deleteAllIncome: async (): Promise<void> => {
    await removeFromStorageAsync(INCOME_STORAGE_KEY);
  },
};