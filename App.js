import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
} from "react-native";
import { InstantSearch } from "react-instantsearch/native";
import { connectHighlight } from "react-instantsearch-native";
import algoliasearch from "algoliasearch/lite";

import {
  connectInfiniteHits,
  connectSearchBox,
  connectStats
} from "react-instantsearch/connectors";
import { AppLoading } from "expo";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Detail from "./Detail";

export const INFOBOE_URL = "https://www.infoboe.com/alertas";
export const BRAND_COLOR = "#034ea1";

const searchClient = algoliasearch(
  "HELCA5ISYR",
  "7ef891d068873166b020d1b939a7f5f9"
);

const Intro = () => (
  <View>
    <Text style={styles.titleText}>Infoboe</Text>
    <Text style={styles.lead}>
      ¡Bienvenido a Infoboe! Utiliza la barra de abajo para buscar en los
      últimos Boletines Oficiales del Estado.
    </Text>
  </View>
);

function App({ navigation }) {
  const [isReady, setIsReady] = useState(true);
  const [searchState, setSearchState] = useState({});

  if (!isReady) {
    return (
      <AppLoading onFinish={() => setIsReady(true)} onError={console.warn} />
    );
  }

  const query = searchState.query;
  const existSearchTerm = !!(query && query.length > 0);
  const urlAlert = INFOBOE_URL + (existSearchTerm ? `?query=${query}` : "");
  return (
    <View>
      <View style={styles.container}>
        <InstantSearch
          indexName="chunks_pro_index"
          searchClient={searchClient}
          searchState={searchState}
          onSearchStateChange={setSearchState}
        >
          {existSearchTerm ? null : <Intro />}
          <ConnectedSearchBox existSearchTerm={existSearchTerm} />
          {existSearchTerm && <ConnectedStats />}
          {existSearchTerm && (
            <ConnectedHits navigation={navigation} query={query} />
          )}
        </InstantSearch>
      </View>
    </View>
  );
}

const AppNavigator = createStackNavigator(
  {
    Buscar: App,
    Resultado: Detail
  },
  {
    initialRouteName: "Buscar"
  }
);

export default createAppContainer(AppNavigator);

const SearchBox = props => (
  <View>
    <TextInput
      style={props.existSearchTerm ? styles.inputSearch : styles.input}
      onChangeText={text => props.refine(text)}
      value={props.currentRefinement}
      placeholder={"Busca un DNI, una empresa..."}
      clearButtonMode={"always"}
      underlineColorAndroid={"white"}
      spellCheck={false}
      autoCorrect={false}
      autoCapitalize={"none"}
    />
  </View>
);

const ConnectedSearchBox = connectSearchBox(SearchBox);

const styleNormal = {
  backgroundColor: "transparent",
  color: "#666",
  fontSize: 12
};

const styleHighlight = {
  backgroundColor: BRAND_COLOR,
  color: "white",
  fontSize: 12
};

const Highlight = ({ attribute, hit, highlight }) => {
  const highlights = highlight({
    highlightProperty: "_highlightResult",
    attribute,
    hit
  });

  return (
    <Text style={{ fontSize: 12 }}>
      {highlights.slice(0, 5).map(({ value, isHighlighted }, index) => {
        const style = isHighlighted ? styleHighlight : styleNormal;
        return (
          <Text key={index} style={style}>
            {isHighlighted ? value : value.slice(-40)}
          </Text>
        );
      })}
    </Text>
  );
};

const HighlightConnected = connectHighlight(Highlight);

class Hits extends React.Component {
  onEndReached = () => {
    if (this.props.hasMore) {
      this.props.refine();
    }
  };

  render() {
    const hits =
      this.props.hits.length > 0 ? (
        <View style={styles.items}>
          <FlatList
            data={this.props.hits}
            renderItem={this._renderRow}
            renderSeparator={this._renderSeparator}
            onEndReached={this.onEndReached}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      ) : null;
    return hits;
  }

  _renderRow = (hit, sectionId, rowId) => {
    return (
      <TouchableOpacity
        style={styles.item}
        key={rowId}
        onPress={() =>
          this.props.navigation.navigate("Resultado", {
            hit: hit.item,
            query: this.props.query
          })
        }
      >
        <View>
          <Text style={{ fontSize: 10 }}>
            {hit.item.day} - {hit.item.publication_name}
          </Text>
          <HighlightConnected attribute="content" hit={hit.item} />
        </View>
      </TouchableOpacity>
    );
  };

  _renderSeparator = (sectionID, rowID, adjacentRowHighlighted) => (
    <View
      key={`${sectionID}-${rowID}`}
      style={{
        height: adjacentRowHighlighted ? 4 : 1,
        backgroundColor: adjacentRowHighlighted ? BRAND_COLOR : "#CCCCCC"
      }}
    />
  );
}

const ConnectedHits = connectInfiniteHits(Hits);
const ConnectedStats = connectStats(props => {
  return (
    <Text style={{ paddingLeft: 8, fontSize: 10, marginTop: 5, color: "#777" }}>
      {props.nbHits} resultados encontrados en {props.processingTimeMS}ms
    </Text>
  );
});

const boxShadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  backgroundColor: "#fff",
  elevation: 5
};

const styles = StyleSheet.create({
  titleText: {
    marginTop: 100,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: BRAND_COLOR
  },
  lead: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
    color: "#777"
  },
  header: {
    backgroundColor: BRAND_COLOR
  },
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FDFDFD",
    paddingTop: 20,
    paddingRight: 10,
    paddingLeft: 10,
    paddingBottom: 10,
    color: "#555"
  },
  input: {
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 14,
    padding: 10,
    color: "#444444",
    height: 45,
    ...boxShadow
  },
  inputSearch: {
    padding: 10,
    color: "#444444",
    height: 50,
    fontSize: 24,
    ...boxShadow
  },
  items: {
    marginTop: 10
  },
  item: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginTop: 10,
    backgroundColor: "white",
    ...boxShadow
  },

  callToAction: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    ...boxShadow
  }
});
