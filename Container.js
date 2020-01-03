import React from "react";
import { View } from "react-native";

const Container = ({ children }) => {
  return (
    <View style={{ padding: 20, backgroundColor: "white", height: "100%" }}>
      {children}
    </View>
  );
};

export default Container;
