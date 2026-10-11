import React, { useEffect, useCallback, useState } from 'react';
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
import * as adminApi from '../../api/adminApi';

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const AdminProfile = ({ navigation }) => {
  const { session, logout, updateSession } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) return;
    setRefreshing(true);
    try {
      const admin = await adminApi.getAdminProfile(session.user.id);
      updateSession({ admin });
    } catch (err) {
      // silent — keep whatever is already in session
    } finally {
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refresh();
  }, []);

  const admin = session?.admin || {};
  const user = session?.user || {};

  // Only fields the backend actually returns (see adminController.getAdminProfile)
  const ADMIN_INFO = [
    { icon: '🪪', label: 'ADMIN CODE', value: admin.admin_code || '—', bg: '#e8f5e9' },
    { icon: '📧', label: 'EMAIL', value: admin.email || user.email || '—', bg: '#fff3e0' },
  ];

  const handleLogout = async () => {
    await logout();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Profile</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(admin.name || user.name)}</Text>
            </View>
            <Text style={styles.adminName}>{admin.name || user.name || 'Admin'}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, styles.activeBadge]}>
                <Text style={[styles.badgeText, styles.activeBadgeText]}>● Active</Text>
              </View>
            </View>
          </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {/* Info Rows */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {ADMIN_INFO.map((row, i) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: row.bg }]}>
                  <Text style={styles.iconEmoji}>{row.icon}</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
              {i < ADMIN_INFO.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Admin Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          {[
            { icon: '📢', label: 'Post New Notice', route: 'AdminPostNotice' },
            { icon: '✅', label: 'Review Pending Requests', route: 'AdminApprovals' },
            { icon: '📋', label: 'Manage All Notices', route: 'AdminNoticeBoard' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              activeOpacity={0.7}
              style={styles.actionItem}
              onPress={() => navigation.navigate(action.route, {})}
            >
              <Text style={styles.actionEmoji}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

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
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: COLORS.white },
  adminName: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  badgeText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  activeBadge: { backgroundColor: 'rgba(40,167,69,0.3)' },
  activeBadgeText: { color: '#90ee90' },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: COLORS.textPrimary,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  iconEmoji: { fontSize: 20 },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textSubtitle,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2,
  },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.cardFill, marginVertical: 10 },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.cardFill,
  },
  actionEmoji: { fontSize: 20 },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  actionArrow: { fontSize: 20, color: COLORS.textSubtitle },
  logoutBtn: {
    borderWidth: 1.5, borderColor: COLORS.errorRed,
    borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  logoutText: { color: COLORS.errorRed, fontSize: 15, fontWeight: '700' },
});

export default AdminProfile;