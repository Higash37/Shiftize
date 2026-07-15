
import React from "react";
import { Text } from "react-native";
import { styles } from "./FeedbackError.styles";
import { ErrorMessageProps } from "./FeedbackError.types";

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, textStyle, testID }) => {
  if (!message) return null;

  return (
    <Text style={[styles.error, textStyle]} testID={testID}>
      {message}
    </Text>
  );
};

export default ErrorMessage;
