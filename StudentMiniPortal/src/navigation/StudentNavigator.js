import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import StudentDashboard from '../screens/student/StudentDashboard';
import StudentNoticeBoard from '../screens/student/StudentNoticeBoard';
import StudentDirectory from '../screens/student/StudentDirectory';
import StudentProfile from '../screens/student/StudentProfile';
import StudentEditProfile from '../screens/student/StudentEditProfile';
import PostRequest from '../screens/student/PostRequest';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Tab Bar Icon ──────────────────────────────────────────────
const TabIcon = ({ emoji, label, focused }) => (
  <View style={tabStyles.iconWrapper}>
    <Text style={tabStyles.emoji}>{emoji}</Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

// ─── Stack Wrappers (so modals/screens live above tabs) ────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
    <Stack.Screen name="PostRequest" component={PostRequest} />
    <Stack.Screen name="StudentEditProfile" component={StudentEditProfile} />
  </Stack.Navigator>
);

const NoticesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentNoticeBoard" component={StudentNoticeBoard} />
  </Stack.Navigator>
);

const DirectoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentDirectory" component={StudentDirectory} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentProfile" component={StudentProfile} />
    <Stack.Screen name="StudentEditProfile" component={StudentEditProfile} />
  </Stack.Navigator>
);

// ─── Student Bottom Tab Navigator ─────────────────────────────
const StudentNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: tabStyles.tabBar,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Notices"
      component={NoticesStack}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Notices" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Directory"
      component={DirectoryStack}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="📖" label="Directory" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardFill,
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrapper: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: COLORS.textSubtitle, marginTop: 3, fontWeight: '600' },
  labelActive: { color: COLORS.accentGreen },
});

export default StudentNavigator;
