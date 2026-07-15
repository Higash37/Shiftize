

import { useFonts } from "expo-font";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export const useBasicFonts = () => {
  return useFonts({
    ...AntDesign.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
  });
};

export const useExtendedFonts = () => {
  return useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialCommunityIcons.font,
  });
};
