import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import { firebase } from '../../firebase/config';

export default function HomeScreen(props) {
  const [restaurantText, setRestaurantText] = useState('');
  const [restaurants, setRestaurants] = useState([]);

  const userID = props.extraData.id;
  const restaurantRef = firebase
    .firestore()
    .collection('restaurants')
    .doc(userID);

  let unsubscribe;

  useEffect(() => {
    unsubscribe = restaurantRef.onSnapshot(
      (querySnapshot) => {
        const newRestaurants = querySnapshot.data().restaurants;
        setRestaurants(newRestaurants);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  const onAddButtonPress = () => {
    if (restaurantText && restaurantText.length > 0) {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const data = {
        text: restaurantText,
        authorID: userID,
        createdAt: timestamp,
      };
      restaurantRef
        .update({
          restaurants: firebase.firestore.FieldValue.arrayUnion(restaurantText),
        })
        .then((_doc) => {
          setRestaurantText('');
          Keyboard.dismiss();
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  const renderRestaurant = ({ item, index }) => {
    return (
      <View style={styles.entityContainer}>
        <Text style={styles.entityText}>{item}</Text>
      </View>
    );
  };

  const logout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        if (unsubscribe) unsubscribe();
        props.setUser(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (unsubscribe) unsubscribe();
            props.navigation.navigate('Cards');
          }}
        >
          <Text style={styles.buttonText}>Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new restaurant"
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => setRestaurantText(text)}
          value={restaurantText}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={onAddButtonPress}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {restaurants && (
        <View style={styles.listContainer}>
          <FlatList
            data={restaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            removeClippedSubviews={true}
          />
        </View>
      )}
    </View>
  );
}
