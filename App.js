import React, { useState }  from 'react';
import { Linking, FlatList, StyleSheet, Text, View , Button, TextInput} from 'react-native';
import { InstantSearch } from 'react-instantsearch/native';
import {
  connectSearchBox,
  connectInfiniteHits,
  connectStats
} from 'react-instantsearch/connectors';
import {AppLoading, Constants} from "expo";

const INFOBOE_URL = "https://www.infoboe.com/alertas";
const BRAND_COLOR = "#034ea1";

export default function App() {
  const [searchState, setSearchState] = useState({});
    const [isReady, setIsReady] = useState(false);

    if (!isReady) {
        return (
            <AppLoading
                onFinish={() => setIsReady(true)}
                onError={console.warn}
            />
        );
    }

  return (
      <View>
          <View style={styles.statusBar} />
          <View style={styles.container}>

            <InstantSearch
                appId="HELCA5ISYR"
                apiKey="7ef891d068873166b020d1b939a7f5f9"
                indexName="chunks_pro_index"
                searchState={searchState}
                onSearchStateChange={setSearchState}
            >
              <Text>Infoboe</Text>
              <ConnectedSearchBox />
              <Button
                  onPress={() => Linking.openURL(INFOBOE_URL)}
                  title="Crear alerta diaria"
                  color={BRAND_COLOR}
                  accessibilityLabel="Crear alterta diaria"
              />
              <ConnectedStats/>
              <ConnectedHits/>
            </InstantSearch>
          </View>
      </View>
  );
}
const SearchBox = props =>
        <View>
          <TextInput
              style={styles.input}
              onChangeText={text => props.refine(text)}
              value={props.currentRefinement}
              placeholder={'Busca un DNI, una empresa...'}
              clearButtonMode={'always'}
              underlineColorAndroid={'white'}
              spellCheck={false}
              autoCorrect={false}
              autoCapitalize={'none'}
          />
        </View>


const ConnectedSearchBox = connectSearchBox(SearchBox);

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
    return <View style={styles.item} key={rowId}>
      <Text>{hit.item.day}</Text>
      <Text>{hit.item.publication_name}</Text>
      <Text>{hit.item._snippetResult.content.value}</Text>
      <Button
          onPress={() => Linking.openURL(hit.item.url)}
          title="Acceder al PDF"
          color={BRAND_COLOR}
          accessibilityLabel="Acceder al PDF de la publicación"
      />
    </View>
  };

  _renderSeparator = (sectionID, rowID, adjacentRowHighlighted) => (
      <View
          key={`${sectionID}-${rowID}`}
          style={{
            height: adjacentRowHighlighted ? 4 : 1,
            backgroundColor: adjacentRowHighlighted ? BRAND_COLOR : '#CCCCCC',
          }}
      />
  );
}


const ConnectedHits = connectInfiniteHits(Hits);
const ConnectedStats = connectStats(({ nbHits }) => (
    <Text style={{ paddingLeft: 8 }}>{nbHits} resultados encontrados</Text>
));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 10,
    color: "#444444"
  },
  input: {
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 2,
    padding: 10,
    color: "#444444",
    height: 40
  },
  item: {
    borderWidth: 1,
    borderColor: "grey",
    padding: 10
  },
    statusBar: {
        backgroundColor: BRAND_COLOR,
        height: Constants.statusBarHeight,
    },

});
