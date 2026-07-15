
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { AppState } from "react-native";
import { useAuth } from "@/services/auth/useAuth";
import { Routes, RouteGroups, getDefaultHomeRoute } from "@/common/common-constants/RouteConstants";

export const useRouteGuard = () => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const atRoot = RouteGroups.isAtRoot(segments);

    if (atRoot) {
      return;
    }

    if (user) {
      handleAuthenticatedUser();
      return;
    }

    handleUnauthenticatedUser();
  }, [user, role, loading, segments, router]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !loading) {
        const inAuthGroup = RouteGroups.isAuthGroup(segments);

        timeoutId = setTimeout(() => {
          if (user || loading || inAuthGroup) {
            return;
          }

          const currentPath = segments.join("/");
          let urlParams = "";
          if (globalThis.window) {
            urlParams = globalThis.window.location.search;
          }
          const redirectPath = encodeURIComponent("/" + currentPath + urlParams);
          router.replace(`${Routes.auth.login}?redirect=${redirectPath}`);
        }, 1000);
      }
    });
    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, [user, loading, segments, router]);

  const handleAuthenticatedUser = () => {
    const inAuthGroup = RouteGroups.isAuthGroup(segments);
    if (!inAuthGroup) {
      return;
    }

    const redirectPath = getRedirectPath();
    if (redirectPath) {
      const decodedPath = decodeURIComponent(redirectPath);
      router.replace(decodedPath);
      return;
    }

    redirectToDefaultHome();
  };

  const handleUnauthenticatedUser = () => {
    const inMainGroup = RouteGroups.isMainGroup(segments);
    if (!inMainGroup) {
      return;
    }

    const currentPath = segments.join("/");
    let urlParams = "";
    if (globalThis.window) {
      urlParams = globalThis.window.location.search;
    }
    const redirectPath = encodeURIComponent("/" + currentPath + urlParams);
    router.replace(`${Routes.auth.login}?redirect=${redirectPath}`);
  };

  const getRedirectPath = (): string | null => {
    if (globalThis.window === undefined) {
      return null;
    }
    const urlParams = new URLSearchParams(globalThis.window.location.search);
    return urlParams.get("redirect");
  };

  const redirectToDefaultHome = () => {
    const currentSegments = segments.filter((seg) => seg && seg !== "(auth)");

    if (currentSegments.length === 0 || segments.includes("login")) {
      const homeRoute = getDefaultHomeRoute(role);
      router.replace(homeRoute);
    }
  };
};

