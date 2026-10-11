import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthNavigator from './src/navigation/AuthNavigator';
import StudentNavigator from './src/navigation/StudentNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/theme';

const RootStack = createStackNavigator();

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    // Restoring a saved session from AsyncStorage on app launch
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  const initialRoute = !session
    ? 'Auth'
    : session.user?.role === 'admin'
    ? 'AdminDashboard'
    : 'StudentDashboard';

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="StudentDashboard" component={StudentNavigator} />
      <RootStack.Screen name="AdminDashboard" component={AdminNavigator} />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
