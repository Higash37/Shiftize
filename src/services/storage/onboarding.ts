import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@onboarding_completed";

export class OnboardingStorage {
  static async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("Error setting onboarding completed:", error);
    }
  }

  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      const isCompleted = value === "true";

      return isCompleted;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  }

  static async clearOnboardingStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error("Error clearing onboarding status:", error);
    }
  }
}
