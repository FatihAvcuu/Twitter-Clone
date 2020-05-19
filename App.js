import React from 'react';
import { Text, View } from 'react-native';
import * as firebase from 'firebase';
import Home from './main/screens/home';
import Login from './main/screens/login';
import Signup from './main/screens/signup';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

export default function App() {

  var firebaseConfig = {
    apiKey: "*******",
    authDomain: "******.firebaseapp.com",
    databaseURL: "https://******.firebaseio.com",
    projectId: "*******",
    storageBucket: "******.appspot.com",
    messagingSenderId: "*******",
    appId: "************"
  };
  // Initialize Firebase
  !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

  return (
    <NavigationContainer>
      <Stack.Navigator headerMode='none'>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}