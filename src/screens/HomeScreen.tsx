import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomeScreen = () => {
  return (
    <View style={Styles.container}>
      <Text style={Styles.text}>ホーム画面(仮)</Text>
    </View>
  );
};

export default HomeScreen;

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
  },
});
