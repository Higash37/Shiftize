
import { shadows } from "../../common-constants/ShadowConstants";

export const getPlatformShadow = (elevation: number = 2) => {
  if (elevation <= 2) return shadows.small;
  if (elevation <= 6) return shadows.medium;
  if (elevation <= 10) return shadows.large;
  return shadows.xlarge;
};

export const adjustColor = (color: string, amount: number): string => {
  let usePound = false;

  if (color.startsWith("#")) {
    color = color.slice(1);
    usePound = true;
  }

  const num = Number.parseInt(color, 16);
  if (Number.isNaN(num)) {
    throw new TypeError("Invalid color format. Expected HEX color code.");
  }

  let r = (num >> 16) + amount * 255;
  let g = ((num >> 8) & 0x00ff) + amount * 255;
  let b = (num & 0x0000ff) + amount * 255;

  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));

  const newColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

  return (usePound ? "#" : "") + newColor;
};
