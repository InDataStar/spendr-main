import { Keys } from "../constants/keys";
import { Cost } from "../types/cost";
import {
  loadFromStorageAsync,
  saveToStorageAsync,
} from "./async-storage-services";

const COSTS_STORAGE_KEY = "costs";

export class CostServices {
  /**
   * Create
   */
  static addCost = async (cost: Cost): Promise<Cost> => {
    try {
      const costs = await this.getCosts();

      const updatedCosts = [...costs, cost];

      await saveToStorageAsync(Keys.COST_LIST(), updatedCosts);

      return cost;
    } catch (error) {
      console.error("Failed to add cost:", error);
      throw error;
    }
  };

  /**
   * Read
   */
  static getCosts = async (): Promise<Cost[]> => {
    try {
      const costs = await loadFromStorageAsync(Keys.COST_LIST());

      return costs ?? [];
    } catch (error) {
      console.error("Failed to get costs:", error);
      return [];
    }
  };

  /**
   * Update
   */
  static updateCost = async (cost: Cost): Promise<Cost> => {
    try {
      const costs = await this.getCosts();

      const updatedCosts = costs.map((existingCost) =>
        existingCost.id === cost.id ? cost : existingCost,
      );

      await saveToStorageAsync(Keys.COST_LIST(), updatedCosts);

      return cost;
    } catch (error) {
      console.error("Failed to update cost:", error);
      throw error;
    }
  };

  /**
   * Delete
   */
  static deleteCost = async (costId: string): Promise<void> => {
    try {
      const costs = await this.getCosts();

      const updatedCosts = costs.filter((cost) => cost.id !== costId);

      await saveToStorageAsync(Keys.COST_LIST(), updatedCosts);
    } catch (error) {
      console.error("Failed to delete cost:", error);
      throw error;
    }
  };
}
