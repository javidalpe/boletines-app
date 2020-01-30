import React from "react";
import { View, Text, Button, Linking, Share } from "react-native";

import Container from "./Container";
import {BRAND_COLOR, INFOBOE_URL} from "./Constants";

const Detail = ({ navigation }) => {
  const query = navigation.getParam("query");
  const item = navigation.getParam("hit");

  const urlAlert = `${INFOBOE_URL}?query=${query}`;
  const pdfUrl = item.url;

  return (
    <Container>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Publicación:</Text>{" "}
        {item.publication_name}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Fecha:</Text> {item.day}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Enlace:</Text> {pdfUrl}
      </Text>
      <View style={{marginTop: 20}}>
        <Button
          onPress={() => Linking.openURL(pdfUrl)}
          title="Acceder al PDF"
          color={BRAND_COLOR}
          accessibilityLabel="Acceder al PDF"
        />
      </View>
      <View>
        <Button
          onPress={() => Share.share({ message: pdfUrl })}
          title="Compartir PDF"
          color={BRAND_COLOR}
          accessibilityLabel="Compartir publicación"
        />
      </View>
      <View>
        <Button
          onPress={() => Linking.openURL(urlAlert)}
          title={`Crear alerta diaria para "${query}"`}
          color={BRAND_COLOR}
          accessibilityLabel="Crear alerta diaria"
        />
      </View>
    </Container>
  );
};

export default Detail;
