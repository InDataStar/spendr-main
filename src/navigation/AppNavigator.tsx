import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
 
import { Dashboard } from '../screens/Dashboard';
import { RootStackParamList } from './types';
import AccountsScreen from '../screens/Accounts';


const Stack =
  createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Main"
          component={Dashboard}
        />
        <Stack.Screen
          name="Accounts"
          component={AccountsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};