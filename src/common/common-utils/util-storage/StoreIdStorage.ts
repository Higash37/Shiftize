

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORE_ID_KEY = "last_store_id";

export const StoreIdStorage = {

  saveStoreId: async (storeId: string): Promise<void> => {
    try {

      await AsyncStorage.setItem(STORE_ID_KEY, storeId);
    } catch (err) {
      throw err;
    }
  },

  getStoreId: async (): Promise<string | null> => {
    try {

      const storeId = await AsyncStorage.getItem(STORE_ID_KEY);
      return storeId;
    } catch (err) {
      return null;
    }
  },

  clearStoreId: async (): Promise<void> => {
    try {

      await AsyncStorage.removeItem(STORE_ID_KEY);
    } catch (err) {
      throw err;
    }
  },
};
