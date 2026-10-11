import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import { LabeledInput, PillButton } from '../../components';
import { useAuth } from '../../context/AuthContext';
import * as studentApi from '../../api/studentApi';

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const StudentEditProfile = ({ navigation }) => {
  const { session, updateSession } = useAuth();
  const student = session?.student || {};
  const user = session?.user || {};

  // Backend only allows updating email + phone (see studentController.updateStudent)
  const [form, setForm] = useState({
    email: user.email || '',
    phone: student.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setError('');
    if (!student.id) {
      setError('Missing student reference. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      await studentApi.updateStudent(student.id, form);
      // Reflect changes locally without another round trip
      await updateSession({
        user: { ...user, email: form.email },
        student: { ...student, phone: form.phone },
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
            <LabeledInput
              label="Email Address"
              value={form.email}
              onChangeText={(v) => update('email', v)}
              placeholder="you@biit.edu.pk"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <LabeledInput
              label="Phone Number"
              value={form.phone}
              onChangeText={(v) => update('phone', v)}
              placeholder="+92 3XX XXXXXXX"
              keyboardType="phone-pad"
              style={{ marginBottom: 0 }}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              ℹ️  Student ID, Name, Program, and Department can only be changed by the administration.
            </Text>
          </View>

          <PillButton title="Save Changes" onPress={handleSave} loading={loading} />

          <TouchableOpacity activeOpacity={0.7} style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backArrow: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 22 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.lightGreen,
    borderWidth: 3,
    borderColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: COLORS.accentGreen },
  changePhotoBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.lightGreen,
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
  },
  changePhotoText: { fontSize: 13, color: COLORS.accentGreen, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.errorRed,
  },
  errorText: { color: COLORS.errorRed, fontSize: 13, fontWeight: '600' },
  infoNote: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoNoteText: { fontSize: 13, color: COLORS.accentGreen, lineHeight: 19, fontWeight: '500' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText: { color: COLORS.textSubtitle, fontSize: 14, fontWeight: '600' },
});

export default StudentEditProfile;