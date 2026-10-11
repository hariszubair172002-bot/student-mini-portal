import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminNoticeBoard from '../screens/admin/AdminNoticeBoard';
import AdminPostNotice from '../screens/admin/AdminPostNotice';
import AdminApprovals from '../screens/admin/AdminApprovals';
import AdminProfile from '../screens/admin/AdminProfile';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Tab Icon ──────────────────────────────────────────────────
const TabIcon = ({ emoji, label, focused, badge }) => (
  <View style={tabStyles.wrapper}>
    <View>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      {badge > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

// ─── Stack Wrappers ────────────────────────────────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="AdminPostNotice" component={AdminPostNotice} />
    <Stack.Screen name="AdminApprovals" component={AdminApprovals} />
    <Stack.Screen name="AdminProfile" component={AdminProfile} />
  </Stack.Navigator>
);

const NoticesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminNoticeBoard" component={AdminNoticeBoard} />
    <Stack.Screen name="AdminPostNotice" component={AdminPostNotice} />
  </Stack.Navigator>
);

const ApprovalsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminApprovals" component={AdminApprovals} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminProfile" component={AdminProfile} />
    <Stack.Screen name="AdminPostNotice" component={AdminPostNotice} />
    <Stack.Screen name="AdminNoticeBoard" component={AdminNoticeBoard} />
    <Stack.Screen name="AdminApprovals" component={AdminApprovals} />
  </Stack.Navigator>
);

// ─── Admin Bottom Tab Navigator ────────────────────────────────
const AdminNavigator = () => (
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
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Dashboard" focused={focused} />,
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
      name="Approvals"
      component={ApprovalsStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="✅" label="Approvals" focused={focused} badge={14} />
        ),
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
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: COLORS.textSubtitle, marginTop: 3, fontWeight: '600' },
  labelActive: { color: COLORS.accentGreen },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#e65100',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
});

export default AdminNavigator;
