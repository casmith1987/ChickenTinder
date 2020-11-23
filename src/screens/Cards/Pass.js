import {
  Text,
  View,
  Dimensions,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { firebase } from '../../firebase/config';
import styles from '../HomeScreen/styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

let unsubscribe;

class Pass extends React.Component {
  constructor() {
    super();
    this.state = {
      restaurants: [],
    };
  }
  async componentDidMount() {
    const userID = this.props.extraData.id;
    const restaurantRef = firebase
      .firestore()
      .collection('restaurants')
      .doc(userID);

    unsubscribe = restaurantRef.onSnapshot(
      (querySnapshot) => {
        let newRestaurants = querySnapshot.data().restaurants;
        this.setState({ ...this.state, restaurants: newRestaurants });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  componentWillUnmount() {
    unsubscribe();
  }

  renderFoods = () => {
    return (
      <View
        style={{
          height: SCREEN_HEIGHT - 120,
          width: SCREEN_WIDTH,
          padding: 10,
          position: 'absolute',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT / 2 - 120,
            left: 0,
            width: SCREEN_WIDTH,
            padding: 30,
            zIndex: 1000,
          }}
        >
          <Text
            style={{
              borderWidth: 2,
              borderColor: 'white',
              color: 'white',
              fontSize: 20,
              fontWeight: '800',
              padding: 10,
              textAlign: 'center',
              backgroundColor: 'black',
            }}
          >
            {String(
              this.state.restaurants[this.state.index] &&
                this.state.restaurants[this.state.index]
            )}
          </Text>
        </View>
        <Image
          style={{
            flex: 1,
            height: null,
            width: null,
            resizeMode: 'cover',
            borderRadius: 20,
          }}
          source={require('../../../assets/1.jpeg')}
        />
      </View>
    );
  };

  renderRestaurant = ({ item, index }) => {
    return (
      <View style={styles.entityContainer} key={index}>
        <Text style={styles.entityText}>{item.name}</Text>
      </View>
    );
  };

  render() {
    if (
      this.state.restaurants &&
      this.state.restaurants.filter((x) => x.votes >= 2).length
    ) {
      return (
        <View style={styles.container}>
          <View style={styles.listContainer}>
            <Text style={{ textAlign: 'center', fontSize: 30 }}>Matched!</Text>
            <FlatList
              data={this.state.restaurants.filter((x) => x.votes >= 2)}
              renderItem={this.renderRestaurant}
              keyExtractor={(item) => this.state.restaurants.indexOf(item)}
              removeClippedSubviews={true}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (unsubscribe) unsubscribe();
              this.props.navigation.replace('Cards');
            }}
          >
            <Text style={styles.buttonText}>Cards</Text>
          </TouchableOpacity>
        </View>
        <View style={{ top: SCREEN_HEIGHT / 2 - 900 }}>
          <Text style={{ textAlign: 'center', fontSize: 30 }}>
            No Matches Yet.
          </Text>
        </View>
      </View>
    );
  }
}

export default Pass;
