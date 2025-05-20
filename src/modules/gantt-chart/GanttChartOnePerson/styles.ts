import { StyleSheet, Platform, ViewStyle, TextStyle } from "react-native";

export interface Styles {
  container: ViewStyle;
  timelineContainer: ViewStyle;
  header: ViewStyle;
  name: TextStyle;
  timeline: ViewStyle;
  row: ViewStyle;
  timeLabel: TextStyle;
  bar: ViewStyle;
  shift: ViewStyle;
  lesson: ViewStyle;
}

export const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    height: 500,
  },
  timelineContainer: {
    flexDirection: "row",
    height: "100%",
  },
  header: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  name: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2C3E50",
  },
  timeline: {
    flex: 1,
    overflow: Platform.OS === "web" ? "scroll" : "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 18,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  timeLabel: {
    width: 40,
    fontSize: 11,
    color: "#666",
    marginRight: 6,
  },
  bar: {
    flex: 1,
    height: 12,
    backgroundColor: "#F5F6FA",
    borderRadius: 3,
  },
  shift: {
    backgroundColor: "#4A90E2",
  },
  lesson: {
    backgroundColor: "#50E3C2",
  },
});
