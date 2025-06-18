import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: "70%",
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    alignContent: "center",
    marginHorizontal: "auto",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: 16,
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text.primary,
  },
  datePickerButton: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.text.primary,
  },
  separator: {
    width: 30,
    alignItems: "center",
  },
  separatorText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  shiftTypeContainer: {
    flexDirection: "row",
  },
  shiftTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeShiftTypeButton: {
    backgroundColor: colors.primary,
  },
  shiftTypeText: {
    color: colors.text.secondary,
  },
  activeShiftTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  deleteButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 200, 0, 0.8)",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  successText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  userListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedUserItem: {
    backgroundColor: colors.primary,
  },
  userItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedUserItemText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noResultsText: {
    padding: 10,
    textAlign: "center",
    color: colors.text.secondary,
  },
  pickerContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  selectedDatesContainer: {
    marginTop: 10,
  },
  selectedDateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  removeDateButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  removeDateText: {
    color: "red",
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  classesContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  classTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#43a047", // 濃い緑色
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
    letterSpacing: 1,
  },
  removeButton: {
    marginLeft: 10,
  },
});
