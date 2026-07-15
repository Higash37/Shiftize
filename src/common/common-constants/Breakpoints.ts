
import { useWindowDimensions } from "react-native";

export const breakpoints = {

  mobile: 0,

  tablet: 600,

  desktop: 1024,
} as const;

export type Breakpoint = "mobile" | "tablet" | "desktop";

export const useBreakpoint = () => {
  const { width } = useWindowDimensions();

  const isMobile = width < breakpoints.tablet;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isDesktop = width >= breakpoints.desktop;

  const breakpoint: Breakpoint = isDesktop
    ? "desktop"
    : isTablet
      ? "tablet"
      : "mobile";

  return { isMobile, isTablet, isDesktop, breakpoint, width } as const;
};
