import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import * as studentApi from '../../api/studentApi';

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const StudentProfile = ({ navigation }) => {
  const { session, logout, updateSession } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) return;
    setRefreshing(true);
    try {
      const student = await studentApi.getStudentByUserId(session.user.id);
      updateSession({ student });
    } catch (err) {
      // silent — keep whatever is in session already
    } finally {
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refresh();
  }, []);

  const student = session?.student || {};
  const user = session?.user || {};

  const INFO_ROWS = [
    { icon: '🎓', label: 'STUDENT ID', value: student.arid_number || '—', bg: '#e8f5e9' },
    { icon: '🏫', label: 'DEPARTMENT', value: student.department || '—', bg: '#e3f2fd' },
    { icon: '📧', label: 'EMAIL', value: user.email || '—', bg: '#fff3e0' },
    { icon: '📞', label: 'PHONE', value: student.phone || 'Not provided', bg: '#fce4ec' },
  ];

  const handleLogout = async () => {
    await logout();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} style={styles.cameraBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user.name || 'Student'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {student.program ? `${student.program} · Semester ${student.semester}` : ''}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={[styles.badgeText, styles.badgeGreenText]}>
                ● {student.status === 'alumni' ? 'Alumni' : 'Active'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {INFO_ROWS.map((row, i) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: row.bg }]}>
                  <Text style={styles.iconBoxEmoji}>{row.icon}</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
              {i < INFO_ROWS.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        {/*
        Verification Status Card — disabled for now, uncomment to show again
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          {[
            { label: 'Program', value: student.program || '—' },
            { label: 'Semester', value: student.semester || '—' },
            { label: 'Email Verified', value: student.is_email_verified ? '✅ Yes' : '⚠️ No' },
            { label: 'Phone Verified', value: student.is_phone_verified ? '✅ Yes' : '⚠️ No' },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={styles.academicRow}>
                <Text style={styles.academicLabel}>{row.label}</Text>
                <Text style={styles.academicValue}>{row.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>
        */}

        {/* Edit Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.editBtn}
          onPress={() => navigation.navigate('StudentEditProfile')}
        >
          <Text style={styles.editBtnText}>🖊  Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 20,
  },
  backArrow: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  avatarSection: { alignItems: 'center' },
  avatarOuter: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: COLORS.white },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: { fontSize: 14 },
  profileName: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  badgeGreen: { backgroundColor: 'rgba(40,167,69,0.3)' },
  badgeGreenText: { color: '#90ee90' },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 20 },
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
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxEmoji: { fontSize: 20 },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSubtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  rowDivider: { height: 1, backgroundColor: COLORS.cardFill, marginVertical: 10 },
  academicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  academicLabel: { fontSize: 13, color: COLORS.textSubtitle, fontWeight: '500' },
  academicValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 12 },
  editBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  editBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.errorRed,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: COLORS.errorRed, fontSize: 15, fontWeight: '700' },
});

export default StudentProfile;