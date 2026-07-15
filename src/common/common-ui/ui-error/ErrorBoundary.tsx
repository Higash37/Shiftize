
import React, { Component, ErrorInfo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;

  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {

    if (__DEV__) {
      console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ""}]`, error, errorInfo);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>!</Text>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.message}>
            {this.props.name
              ? `${this.props.name}の表示中にエラーが発生しました。`
              : "画面の表示中にエラーが発生しました。"}
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetail}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>再試行</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FAFAFA",
  },
  icon: {
    fontSize: 48,
    fontWeight: "700",
    color: "#D32F2F",
    width: 72,
    height: 72,
    lineHeight: 72,
    textAlign: "center",
    borderRadius: 36,
    backgroundColor: "#FFEBEE",
    marginBottom: 16,
    overflow: "hidden",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    marginBottom: 12,
  },
  errorDetail: {
    fontSize: 12,
    color: "#D32F2F",
    backgroundColor: "#FFF3F3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    maxWidth: 300,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
