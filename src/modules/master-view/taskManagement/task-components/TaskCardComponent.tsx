import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface TaskCardProps {
  title: string;
  frequency: string;
  timePerTask: string;
  onPress: () => void;
}

const TaskCardComponent: React.FC<TaskCardProps> = ({
  title,
  frequency,
  timePerTask,
  onPress,
}) => {
  console.log("Rendering TaskCardComponent with title:", title);
  return (
    <TouchableOpacity onPress={onPress}>
      <Box
        variant="card"
        padding="medium"
        margin="small"
        shadow="small"
        style={styles.taskCard}
      >
        <Text style={[styles.titleText]}>{title}</Text>
        <Text style={styles.taskText}>
          {frequency} | {timePerTask}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "70%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  titleText: {
    textAlign: "left",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default TaskCardComponent;
