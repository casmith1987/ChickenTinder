import {
  Text,
  View,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import React from 'react';
import { firebase } from '../../firebase/config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// const Foods = [
//   { id: '1', uri: require('../../../assets/1.jpeg') },
//   { id: '2', uri: require('../../../assets/2.jpeg') },
//   { id: '3', uri: require('../../../assets/9.jpeg') },
//   { id: '4', uri: require('../../../assets/4.jpeg') },
//   { id: '5', uri: require('../../../assets/5.jpeg') },
//   { id: '6', uri: require('../../../assets/6.jpeg') },
// ];

const pic1 = { id: '1', uri: require('../../../assets/1.jpeg') };
const pic2 = { id: '2', uri: require('../../../assets/2.jpeg') };
const pic3 = { id: '3', uri: require('../../../assets/9.jpeg') };
const pic4 = { id: '4', uri: require('../../../assets/4.jpeg') };
const pic5 = { id: '5', uri: require('../../../assets/5.jpeg') };
const pic6 = { id: '6', uri: require('../../../assets/9.jpeg') };
pic1.next = pic2;
pic2.next = pic3;
pic3.next = pic4;
pic4.next = pic5;
pic5.next = pic6;
pic6.next = pic1;

let Food = pic6;

let unsubscribe;

class Card extends React.Component {
  constructor() {
    super();
    this.position = new Animated.ValueXY();
    this.state = {
      currentIndex: 0,
      restaurants: [],
      index: 0,
      results: {},
      name: '',
      nextPage: '',
    };
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          let name = this.state.restaurants[this.state.index].name;
          console.log(`LIKED ${name}`);
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: true,
          }).start(() => {
            this.setState(
              {
                ...this.state,
                index: this.state.index + 1,
                currentIndex: this.state.currentIndex + 1,
              },
              () => {
                this.position.setValue({ x: 0, y: 0 });
              }
            );
          });
          this.likeRestaurant(name);
        } else if (gestureState.dx < -120) {
          if (this.state.currentIndex === 5) {
            this.setState({ ...this.state, currentIndex: -1 });
          }
          console.log(
            `DISLIKED ${this.state.restaurants[this.state.index].name}`
          );
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: true,
          }).start(() => {
            this.setState(
              {
                ...this.state,
                index: this.state.index + 1,
                currentIndex: this.state.currentIndex + 1,
              },
              () => {
                this.position.setValue({ x: 0, y: 0 });
              }
            );
          });
        } else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    });
    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });
    this.rotateAndTranslate = {
      transform: [
        {
          rotate: this.rotate,
        },
        ...this.position.getTranslateTransform(),
      ],
    };
    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });
    this.nopeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    });
    // this.nextCardOpacity = this.position.x.interpolate({
    //   inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    //   outputRange: [1, 0, 1],
    //   extrapolate: 'clamp',
    // });
    // this.nextCardScale = this.position.x.interpolate({
    //   inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    //   outputRange: [1, 0.8, 1],
    //   extrapolate: 'clamp',
    // });
  }

  async likeRestaurant(name) {
    const userID = this.props.extraData.id;
    let newLikeRef = firebase.firestore().collection('restaurants').doc(userID);
    let currentLikes = [...this.state.restaurants].map((restaurant) => {
      if (restaurant.name === name) {
        restaurant.votes = restaurant.votes + 1;
      }
      return restaurant;
    });
    await newLikeRef.set({ restaurants: currentLikes });
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
    Food = Food.next;
    return (
      <Animated.View
        {...this.PanResponder.panHandlers}
        key={this.state.index}
        style={[
          this.rotateAndTranslate,
          {
            height: SCREEN_HEIGHT - 120,
            width: SCREEN_WIDTH,
            padding: 10,
            position: 'absolute',
          },
        ]}
      >
        <Animated.View
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
            {this.state.restaurants[this.state.index] &&
              this.state.restaurants[this.state.index].name}
          </Text>
        </Animated.View>
        <Animated.View
          style={{
            opacity: this.likeOpacity,
            transform: [{ rotate: '-40deg' }],
            position: 'absolute',
            top: 50,
            left: 40,
            zIndex: 1000,
            backgroundColor: 'white',
          }}
        >
          <Text
            style={{
              borderWidth: 2,
              borderColor: 'green',
              color: 'green',
              fontSize: 32,
              fontWeight: '800',
              padding: 10,
            }}
          >
            LIKE
          </Text>
        </Animated.View>
        <Animated.View
          style={{
            opacity: this.nopeOpacity,
            transform: [{ rotate: '40deg' }],
            position: 'absolute',
            top: 50,
            right: 40,
            zIndex: 1000,
            backgroundColor: 'white',
          }}
        >
          <Text
            style={{
              borderWidth: 2,
              borderColor: 'red',
              color: 'red',
              fontSize: 32,
              fontWeight: '800',
              padding: 10,
            }}
          >
            NOPE
          </Text>
        </Animated.View>
        <Image
          style={{
            flex: 1,
            height: null,
            width: null,
            resizeMode: 'cover',
            borderRadius: 20,
          }}
          source={Food.next.uri}
        />
      </Animated.View>
    );
  };

  render() {
    if (
      this.state.restaurants.length &&
      this.state.index >= this.state.restaurants.length
    ) {
      this.props.navigation.replace('Pass');
      return null;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>{this.renderFoods()}</View>
          <View style={{ height: 60 }} />
        </View>
      );
    }
  }
}

export default Card;

// style={[
//     {
//       opacity: this.nextCardOpacity,
//       transform: [{ scale: this.nextCardScale }],
//       height: SCREEN_HEIGHT - 120,
//       width: SCREEN_WIDTH,
//       padding: 10,
//       position: 'absolute',
//     },
//   ]}
