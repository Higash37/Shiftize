

import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";
import { View, Dimensions, StyleSheet } from "react-native";
import { Routes } from "@/common/common-constants/RouteConstants";

import { MasterFooter } from "@/common/common-ui/ui-layout";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isStandalonePWA() {
  if (typeof window !== "undefined") {
    const navigatorStandalone = window.navigator as NavigatorWithStandalone;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorStandalone.standalone === true
    );
  }
  return false;
}

const { height: screenHeight } = Dimensions.get("window");

export default function MasterLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isPWA, setIsPWA] = useState(false);

  const wasAuthorized = useRef(false);

  if (user && role === "master") {
    wasAuthorized.current = true;
  }

  useEffect(() => {
    setIsPWA(isStandalonePWA());
  }, []);

  useEffect(() => {
    if (user && role !== "master") {
      router.replace(Routes.main.user.home);
    }
  }, [user, role, router]);

  if (loading) {
    return null;
  }

  if ((!user || role !== "master") && !wasAuthorized.current) {
    return null;
  }

  return (
    <View style={styles.container}>
      {}
      <Stack
        screenOptions={{
          headerShown: false,               
          gestureEnabled: true,             
          animation: "slide_from_right",    
          presentation: "card",             
        }}
      >
        {}
        <Stack.Screen
          name="home"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="gantt-view"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="gantt-edit"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="info"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="users/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/create"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/this-month"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shifts/next-month"
          options={{ headerShown: false }}
        />
      </Stack>

      {}
      <View style={[styles.footerArea, isPWA && styles.footerPWA]}>
        <MasterFooter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: screenHeight,
  },
  footerArea: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerPWA: {

    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,  
  },
});
