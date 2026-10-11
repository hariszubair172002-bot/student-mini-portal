import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { COLORS } from '../../theme';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Background gradient-like overlay */}
      <View style={styles.bgOverlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>BIIT</Text>
          </View>
          <Text style={styles.logoSubText}>BARANI INSTITUTE OF INFORMATION AND TECHNOLOGY </Text>
        </View>

        {/* Center Content */}
        <View style={styles.centerContent}>
          <Text style={styles.title}>BIIT STUDENT</Text>
          <Text style={styles.subtitle}>MINI PORTAL</Text>
          <View style={styles.dividerLine} />
          <Text style={styles.description}>
            Access your curated academic dashboard with notices, directory, profile management
            and request submissions — all in one place.
          </Text>
        </View>

        {/* Bottom Action */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
            <Text style={styles.loginArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            BIIT Student Portal · Secure Access
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryGreen,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.accentGreen,
    opacity: 0.18,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primaryGreen,
    letterSpacing: 1,
  },
  logoSubText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  dividerLine: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginVertical: 20,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  loginArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  footerNote: {
    marginTop: 20,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
