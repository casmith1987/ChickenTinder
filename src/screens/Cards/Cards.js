import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import React from 'react';
import axios from 'axios';
import { firebase } from '../../firebase/config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const Foods = [
  { id: '1', uri: require('../../../assets/1.jpeg') },
  { id: '2', uri: require('../../../assets/2.jpeg') },
  { id: '3', uri: require('../../../assets/9.jpeg') },
  { id: '4', uri: require('../../../assets/4.jpeg') },
  { id: '5', uri: require('../../../assets/5.jpeg') },
  { id: '6', uri: require('../../../assets/6.jpeg') },
];

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
          if (this.state.currentIndex === 5) {
            this.setState({ ...this.state, currentIndex: -1 });
          }
          console.log(`LIKED ${this.state.restaurants[this.state.index]}`);
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
        } else if (gestureState.dx < -120) {
          if (this.state.currentIndex === 5) {
            this.setState({ ...this.state, currentIndex: -1 });
          }
          console.log(`DISLIKED ${this.state.restaurants[this.state.index]}`);
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
    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    });
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp',
    });
  }

  async componentDidMount() {
    // let restaurants = [];
    // let { data } = await axios.get(
    //   // 'https://developers.zomato.com/api/v2.1/geocode?lat=41.9374&lon=-88.7425',
    //   // {
    //   //   headers: {
    //   //     'user-key': '60ec69519f566f1344e4fd1ab27c04fe',
    //   //   },
    //   // }

    //   'https://maps.googleapis.com/maps/api/place/textsearch/json?query=Restaurant&location=41.9375,-88.7425&radius=10&key=AIzaSyD1qE51csQAx2MijMZ5FG03MTRh5g-kyj8&types=food'
    // );
    // // console.log('WHAT THE FUCK', data);
    // restaurants = [...data.results];
    // this.setState({ ...this.state, nextPage: data.next_page_token });
    // restaurants = restaurants.map((x) => x.name);
    // console.log('RESTAURANTS', restaurants);
    // this.setState({ ...this.state, restaurants: restaurants });
    const restaurantRef = firebase.firestore().collection('restaurants');
    const userID = this.props.extraData.id;

    let unsubscribe;

    unsubscribe = restaurantRef
      .where('authorID', '==', userID)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const newRestaurants = [];
          querySnapshot.forEach((doc) => {
            const restaurant = doc.data();
            restaurant.id = doc.id;
            newRestaurants.push(restaurant);
          });
          let newRestaurantsToState = newRestaurants.map((x) => x.text);
          this.setState({ ...this.state, restaurants: newRestaurantsToState });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  renderFoods = () => {
    return Foods.map((item, i) => {
      if (i < this.state.currentIndex) {
        return null;
      } else if (this.state.index >= this.state.restaurants.length) {
        return (
          <View style={{ top: 300 }}>
            <Text style={{ textAlign: 'center' }}>Out of Restaurants</Text>
          </View>
        );
      } else if (i == this.state.currentIndex) {
        return (
          <Animated.View
            {...this.PanResponder.panHandlers}
            key={i}
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
                  this.state.restaurants[this.state.index]}
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
              source={item.uri}
            />
          </Animated.View>
        );
      } else {
        return (
          <Animated.View
            key={item.id}
            style={[
              {
                opacity: this.nextCardOpacity,
                transform: [{ scale: this.nextCardScale }],
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
                zIndex: 1001,
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
                {this.state.restaurants[this.state.index + 1] &&
                  this.state.restaurants[this.state.index + 1]}
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
              source={item.uri}
            />
          </Animated.View>
        );
      }
    }).reverse();
  };

  render() {
    console.log('refresh');
    return (
      <View style={{ flex: 1 }}>
        {/* <View style={{ height: 60 }} /> */}
        <View style={{ flex: 1 }}>{this.renderFoods()}</View>
        <View style={{ height: 60 }} />
      </View>
    );
  }
}

export default Card;
