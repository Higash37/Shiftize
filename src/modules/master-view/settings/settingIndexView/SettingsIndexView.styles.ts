import { StyleSheet } from "react-native";

export const settingsIndexViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 32,
    alignSelf: "center",
    color: "#222",
    letterSpacing: 0.5,
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignSelf: "center",
    width: "70%",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  listText: {
    fontSize: 18,
    color: "#222",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginLeft: 20,
  },
});
