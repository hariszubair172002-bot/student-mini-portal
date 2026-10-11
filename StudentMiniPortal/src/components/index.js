import React from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme';

// ─── Pill Button ───────────────────────────────────────────────
export const PillButton = ({ title, onPress, style, textStyle, loading, outline }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[styles.pillBtn, outline && styles.pillBtnOutline, style]}
  >
    {loading ? (
      <ActivityIndicator color={outline ? COLORS.primaryGreen : COLORS.white} />
    ) : (
      <Text style={[styles.pillBtnText, outline && styles.pillBtnTextOutline, textStyle]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

// ─── Labeled Input ─────────────────────────────────────────────
export const LabeledInput = ({ label, style, inputStyle, ...props }) => (
  <View style={[styles.inputWrapper, style]}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <TextInput
      style={[styles.input, inputStyle]}
      placeholderTextColor={COLORS.placeholder}
      {...props}
    />
  </View>
);

// ─── OTP Single Box ────────────────────────────────────────────
export const OTPBox = ({ value, onChangeText, inputRef }) => (
  <TextInput
    ref={inputRef}
    style={styles.otpBox}
    maxLength={1}
    keyboardType="number-pad"
    value={value}
    onChangeText={onChangeText}
    placeholderTextColor={COLORS.placeholder}
  />
);

// ─── Circular Icon Badge ───────────────────────────────────────
export const IconCircle = ({ emoji, size = 72 }) => (
  <View style={[styles.iconCircle, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
  </View>
);

// ─── Screen Title Block ────────────────────────────────────────
export const ScreenTitle = ({ title, subtitle }) => (
  <View style={styles.screenTitleWrapper}>
    <Text style={styles.screenTitle}>{title}</Text>
    {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
  </View>
);

// ─── Divider ───────────────────────────────────────────────────
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pillBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  pillBtnOutline: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
  },
  pillBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillBtnTextOutline: {
    color: COLORS.primaryGreen,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textSubtitle,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: COLORS.cardFill,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  otpBox: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.cardFill,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
  },
  iconCircle: {
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  screenTitleWrapper: {
    marginBottom: 28,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 14,
    color: COLORS.textSubtitle,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardFill,
    marginVertical: 16,
  },
});
