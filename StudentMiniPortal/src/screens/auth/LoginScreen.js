import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS } from '../../theme';
import { LabeledInput, PillButton } from '../../components';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password, role);
      // App.js watches session and switches stacks automatically,
      // but we also reset navigation here so back button can't return to Login.
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: role === 'admin' ? 'AdminDashboard' : 'StudentDashboard' }],
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Green Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.logoSmall}>
              <Text style={styles.logoSmallText}>BIIT</Text>
            </View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Sign in to your student account</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* White Card Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log In</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials below</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            {/* Role Toggle */}
            <View style={styles.roleToggle}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRole('student')}
                style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
              >
                <Text style={[styles.roleBtnText, role === 'student' && styles.roleBtnTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRole('admin')}
                style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
              >
                <Text style={[styles.roleBtnText, role === 'admin' && styles.roleBtnTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            <LabeledInput
              label="Email Address"
              placeholder="you@biit.edu.pk"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputSpacing}
            />

            <LabeledInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputSpacing}
            />

            <PillButton
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            <Text style={styles.footerHint}>
              🔒 Secure login powered by BIIT Portal
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryGreen },
  flex: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  backBtn: {
    marginTop: 8,
    marginBottom: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.white,
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  logoSmall: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoSmallText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primaryGreen,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSubtitle,
    marginBottom: 22,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginTop: -4,
  },
  forgotText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 18,
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 16,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.errorRed,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 13,
    fontWeight: '600',
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardFill,
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: COLORS.accentGreen,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSubtitle,
  },
  roleBtnTextActive: {
    color: COLORS.white,
  },
});

export default LoginScreen;
