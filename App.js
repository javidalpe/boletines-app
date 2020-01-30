import React, {useState} from "react";
import {FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {InstantSearch} from "react-instantsearch/native";
import {connectHighlight} from "react-instantsearch-native";
import algoliasearch from "algoliasearch/lite";

import {connectInfiniteHits, connectSearchBox, connectStats} from "react-instantsearch/connectors";
import {AppLoading} from "expo";
import {createAppContainer} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";
import Detail from "./Detail";
import {BRAND_COLOR, INFOBOE_URL} from "./Constants";

const searchClient = algoliasearch(
  "HELCA5ISYR",
  "7ef891d068873166b020d1b939a7f5f9"
);

const Intro = () => (
  <View style={{padding: 20}}>
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
  fontSize: 14
};

const styleHighlight = {
  backgroundColor: BRAND_COLOR,
  color: "white",
  fontSize: 14
};

const Highlight = ({ attribute, hit, highlight }) => {
  const highlights = highlight({
    highlightProperty: "_highlightResult",
    attribute,
    hit
  });

  return (
    <Text>
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
          <Text style={{ fontSize: 14, marginBottom: 2 }}>
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
    <Text style={{ paddingLeft: 8, fontSize: 14, marginTop: 5, color: "#777" }}>
      {props.nbHits} resultados encontrados en {props.processingTimeMS}ms
    </Text>
  );
});

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
    backgroundColor: "white",
    color: "#555"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d8d8",
    borderRadius: 14,
    padding: 10,
    color: "#444444",
    height: 45,
    backgroundColor: "white",
    marginLeft: 20,
    marginRight: 20,
  },
  inputSearch: {
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    padding: 10,
    color: "#444444",
    height: 50,
    fontSize: 24,
    backgroundColor: "white",
  },
  items: {
    marginTop: 10
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 10,
    backgroundColor: "white",
  },
});
