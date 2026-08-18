
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToStorageAsync = async (readKey: string, input: any) => {
  try {
    // Serialize the input value to a string (to handle all data types).
    const stringifiedInput = JSON.stringify(input);

    // Store the stringified value in AsyncStorage.
    await AsyncStorage.setItem(readKey, stringifiedInput);
  } catch (error) {
    console.error('Error saving to AsyncStorage: ', error);
  }
};

export const loadFromStorageAsync = async (readKey: string) => {
  try {
    const result = await AsyncStorage.getItem(readKey);
    if (result !== null) {
      return JSON.parse(result); // Parse the JSON string back into its original value
    }
    return null; // Or you can return a default value if nothing is found.
  } catch (error) {
    console.error('Error loading from AsyncStorage: ', error);
    return null; // Return a fallback value or handle it accordingly
  }
};

export const removeFromStorageAsync = async (readKey: string) => {
  try {
    await AsyncStorage.removeItem(readKey);
  } catch (error) {
    console.error('Error removing from AsyncStorage: ', error);
  }
};

/**
 * Accounts
 * *Buckets
 * **Transactions
 * *Transactions
 * 
 */