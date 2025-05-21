import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 2,
    zIndex: 10,
    height: 40,
  },
  headerDateCell: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  headerGanttCell: {
    flexDirection: "row",
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    height: 40,
  },
  headerInfoCell: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timeLabel: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    paddingTop: 12,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  monthNavButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 1,
  },
  shiftRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    minHeight: 65,
    height: 65,
  },
  dateCell: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  dateDayText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateWeekText: {
    fontSize: 12,
  },
  emptyCellDate: {
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  emptyCell: {
    height: 65,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    position: "relative",
    backgroundColor: "#fff",
    overflow: "hidden",
    flexDirection: "row", // 追加: GanttChartGridのグリッド線と完全一致させる
    borderBottomWidth: 1, // 追加: 行の下線
    borderBottomColor: "#eee", // 追加: 行の下線色
  },
  emptyInfoCell: {
    height: 65,
    backgroundColor: "#f9f9f9",
  },
  ganttCell: {
    position: "relative",
    height: 65,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    overflow: "hidden",
    backgroundColor: "#fff",
    flexDirection: "row", // 追加
  },
  ganttBgRow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  ganttBgCell: {
    height: "100%",
    borderRightColor: "#e0e0e0",
  },
  classTimeCell: {
    backgroundColor: "rgba(180, 180, 180, 0.15)",
  },
  shiftBar: {
    position: "absolute",
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 0,
    elevation: 3,
    borderWidth: 0,
    zIndex: 10,
  },
  shiftBarText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  shiftTimeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  infoCell: {
    padding: 0,
    justifyContent: "flex-start",
    height: 65,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  infoContent: {
    marginBottom: 0,
    padding: 3,
    borderRadius: 3,
    marginHorizontal: 0,
    marginTop: 1,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "bold",
    flex: 1,
  },
  infoTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  infoTimeText: {
    fontSize: 11,
    color: "#333",
  },
  infoTimeTextDisabled: {
    color: "#999",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#555",
  },
  timeButton: {
    paddingVertical: 0,
  },
  deleteButton: {
    padding: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: 280,
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 14,
    textAlign: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 6,
    fontSize: 14,
  },
  timeInputSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  actionButton: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    width: 70,
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 8,
  },
  picker: {
    height: 40,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  statusButtons: {
    marginTop: 12,
  },
  statusButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statusButton: {
    padding: 5,
    borderRadius: 4,
    margin: 2,
    minWidth: 60,
  },
  statusButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default styles;
