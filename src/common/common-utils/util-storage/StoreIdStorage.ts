import AsyncStorage from "@react-native-async-storage/async-storage";

const STORE_ID_KEY = "last_store_id";

export const StoreIdStorage = {
  /**
   * 店舗IDを保存
   */
  saveStoreId: async (storeId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORE_ID_KEY, storeId);
      console.log("店舗IDを保存しました:", storeId);
    } catch (error) {
      console.error("店舗IDの保存に失敗しました:", error);
    }
  },

  /**
   * 保存された店舗IDを取得
   */
  getStoreId: async (): Promise<string | null> => {
    try {
      const storeId = await AsyncStorage.getItem(STORE_ID_KEY);
      console.log("保存された店舗IDを取得:", storeId);
      return storeId;
    } catch (error) {
      console.error("店舗IDの取得に失敗しました:", error);
      return null;
    }
  },

  /**
   * 保存された店舗IDを削除
   */
  clearStoreId: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORE_ID_KEY);
      console.log("店舗IDを削除しました");
    } catch (error) {
      console.error("店舗IDの削除に失敗しました:", error);
    }
  },
};
