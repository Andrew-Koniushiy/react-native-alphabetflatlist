import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Platform,
  InteractionManager,
} from 'react-native';

import PropTypes from 'prop-types';

const styleType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.number,
  PropTypes.array,
]);

export default class AlphabetFlatList extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func,
    viewabilityConfig: PropTypes.object,
    getItemLayout: PropTypes.func.isRequired,
    mainFlatListContainerStyle: styleType,
    matchFieldName: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),

    alphabetListProps: PropTypes.shape({
      onPressLetter: PropTypes.func,
      alphabetListContainerStyle: styleType,
      alphabetButtonStyle: styleType,
      selectedAlphabetButtonStyle: styleType,
      alphabetTextStyle: styleType,
      selectedAlphabetTextStyle: styleType,
    }),
  };

  static defaultProps = {
    viewabilityConfig: {
      itemVisiblePercentThreshold: 100,
    },
    keyExtractor: (item, index) => index.toString(),
    mainFlatListContainerStyle: {},
    alphabetListProps: {
      alphabetListContainerStyle: {},
      alphabetButtonStyle: {},
      selectedAlphabetButtonStyle: {},
      alphabetTextStyle: {},
      selectedAlphabetTextStyle: {},
    },
    matchFieldName: false,
  };

  constructor(props) {
    super(props);
    let letters = 'abcdefghijklmnopqrstuvwxyz#'.toUpperCase().split('');
    this.state = {
      alphabetList: letters,
      selectedLetter: letters[0],
    };
  }

  onPressLetter = selectedItem => {
    // alert(selectedItem)
    let {matchFieldName} = this.props;

    let matchedIndex = this.props.data.findIndex(item => {
      if (matchFieldName && !item[matchFieldName]) {
        return console.warn(
          `matchFieldName ${matchFieldName} is not present in data`,
        );
      }

      let letterToMatch = matchFieldName ? item[matchFieldName][0] : item[0];
      return letterToMatch.toUpperCase() === selectedItem;
    });
    if (matchedIndex === -1) return;
    this._mainList.scrollToIndex({
      animated: true,
      index: matchedIndex,
      viewPosition: 0.1,
    });

    InteractionManager.runAfterInteractions(() => {
      this.setState({selectedLetter: selectedItem});
    });
    this.props.onPressLetter && this.props.onPressLetter(selectedItem);
  };

  setAlphabetTextStyle = letter =>
    this.state.selectedLetter === letter
      ? [
          styles.selectedAlphabetTextStyle,
          this.props.alphabetListProps.selectedAlphabetTextStyle,
        ]
      : [
          styles.alphabetTextStyle,
          this.props.alphabetListProps.alphabetTextStyle,
        ];

  setAlphabetButtonStyle = letter =>
    this.state.selectedLetter === letter
      ? [
          styles.alphabetButtonStyle,
          this.props.alphabetListProps.selectedAlphabetButtonStyle,
        ]
      : [
          styles.alphabetButtonStyle,
          this.props.alphabetListProps.alphabetButtonStyle,
        ];

  renderAlphabetItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={this.onPressLetter.bind(this, item)}
        style={styles.alphabetButtonContainerStyle}>
        <View style={this.setAlphabetButtonStyle(item)}>
          <Text
            allowFontScaling={false}
            style={this.setAlphabetTextStyle(item)}>
            {item}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  onViewableItemsChanged = ({viewableItems, changed}) => {
    let topItem = viewableItems[0];
    let {matchFieldName} = this.props;
    if (!topItem) return;

    let {item} = topItem;

    if (matchFieldName && !item[matchFieldName]) {
      return console.warn(
        `matchFieldName ${matchFieldName} is not present in data`,
      );
    }

    let letterToMatch = matchFieldName ? item[matchFieldName][0] : item[0];

    let letter = letterToMatch.toUpperCase();
    let matchedIndex = this.state.alphabetList.findIndex(
      item => item === letter,
    );
    if (matchedIndex > -1 && letter !== this.state.selectedLetter) {
      InteractionManager.runAfterInteractions(() => {
        this.setState({
          selectedLetter: letter,
        });
      });
    }
  };

  alphabetKeyExtractor = (item, index) => index.toString();

  render() {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.mainFlatListContainerStyle,
            this.props.mainFlatListContainerStyle,
          ]}>
          <FlatList
            ref={ref => (this._mainList = ref)}
            scrollEventThrottle={16}
            onViewableItemsChanged={this.onViewableItemsChanged}
            extraData={this.props}
            getItemLayout={this.props.getItemLayout}
            {...this.props}
          />
        </View>

        {/** Right Side Alphabet FlatList */}
        <View
          style={[
            styles.alphabetListContainerStyle,
            this.props.alphabetListProps.alphabetListContainerStyle,
          ]}>
          <FlatList
            ref={ref => (this._alphaList = ref)}
            data={this.state.alphabetList}
            renderItem={this.renderAlphabetItem}
            keyExtractor={this.alphabetKeyExtractor}
            extraData={this.state}
            showsVerticalScrollIndicator={false}
            {...this.props.alphabetListProps}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // height: '65%',
    flexDirection: 'row',
    // width: '100%',
    flex: 1,
    alignSelf: 'center',
    // justifyContent: 'space-between',
    // marginBottom: '90%',
    backgroundColor: 'transparent',
    paddingLeft: 32,
    marginTop: 2,
  },
  mainFlatListContainerStyle: {
    backgroundColor: 'transparent',
    // marginBottom: '8%',
  },
  alphabetListContainerStyle: {
    marginTop: '5%',
    flex: 0.1,
    // marginBottom: '10%',
  },
  alphabetButtonStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetButtonContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetTextStyle: {
    fontSize: 14,
    color: '#00b7ce',
  },
  selectedAlphabetTextStyle: {
    fontSize: 14,
    color: '#00b7ce',
    lineHeight: 17,
  },
});
