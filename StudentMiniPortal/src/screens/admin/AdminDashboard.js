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
import * as noticeApi from '../../api/noticeApi';
import * as noticeRequestApi from '../../api/noticeRequestApi';

// Note: 'Directory' was removed from this menu — there's no AdminDirectory
// screen registered in AdminNavigator.js. Wire one up if you want it back.
const MENU_ITEMS = [
  { id: '1', label: 'Manage Notices', emoji: '📋', route: 'AdminNoticeBoard', bg: '#e8f5e9', color: '#1d7837' },
  { id: '2', label: 'Post Notice', emoji: '📝', route: 'AdminPostNotice', bg: '#e3f2fd', color: '#1565c0' },
  { id: '3', label: 'Approvals', emoji: '✅', route: 'AdminApprovals', bg: '#fff3e0', color: '#e65100' },
  { id: '4', label: 'My Profile', emoji: '👤', route: 'AdminProfile', bg: '#fce4ec', color: '#880e4f' },
];

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const AdminDashboard = ({ navigation }) => {
  const { session } = useAuth();
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const [stats, setStats] = useState({ students: 0, pending: 0, notices: 0 });
  const [recentNotices, setRecentNotices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [students, pending, notices] = await Promise.all([
        studentApi.getAllStudents(),
        noticeRequestApi.getAllRequests('pending'),
        noticeApi.getAllNotices({ limit: 5 }),
      ]);
      setStats({ students: students.length, pending: pending.length, notices: notices.length });
      setRecentNotices(notices);
    } catch (err) {
      // silent — dashboard just shows whatever loaded
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  const STAT_CARDS = [
    { id: '1', label: 'Total Students', value: String(stats.students), emoji: '🎓', bg: '#e8f5e9', text: '#1d7837' },
    { id: '2', label: 'Pending', value: String(stats.pending), emoji: '⏳', bg: '#fff3e0', text: '#e65100' },
    { id: '3', label: 'Active Notices', value: String(stats.notices), emoji: '📋', bg: '#e3f2fd', text: '#1565c0' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Rounded Green Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.adminName}>{session?.user?.name || 'Admin'}</Text>
              <Text style={styles.adminRole}>Admin Code: {session?.admin?.admin_code || '—'}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.avatar}
              onPress={() => navigation.navigate('AdminProfile')}
            >
              <Text style={styles.avatarText}>
                {(session?.user?.name || 'A').split(' ').map((w) => w[0]?.toUpperCase()).slice(0, 2).join('')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stat Cards Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            {STAT_CARDS.map((card) => (
              <View key={card.id} style={[styles.statCard, { backgroundColor: card.bg }]}>
                <Text style={styles.statEmoji}>{card.emoji}</Text>
                <Text style={[styles.statValue, { color: card.text }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: card.text }]}>{card.label}</Text>
              </View>
            ))}
          </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        {/* Menu Grid 2x2 */}
        <Text style={styles.sectionLabel}>Admin Controls</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending Requests Banner */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.pendingBanner}
          onPress={() => navigation.navigate('AdminApprovals')}
        >
          <View style={styles.pendingLeft}>
            <Text style={styles.pendingEmoji}>⏳</Text>
            <View>
              <Text style={styles.pendingTitle}>{stats.pending} Pending Requests</Text>
              <Text style={styles.pendingSub}>Tap to review and take action</Text>
            </View>
          </View>
          <Text style={styles.pendingArrow}>→</Text>
        </TouchableOpacity>

        {/* Recent Notices */}
        <Text style={styles.sectionLabel}>Recent Notices</Text>
        {recentNotices.length === 0 ? (
          <Text style={styles.emptyText}>No notices yet.</Text>
        ) : (
          recentNotices.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              style={styles.activityRow}
              onPress={() => navigation.navigate('AdminNoticeBoard')}
            >
              <View style={styles.activityIconBox}>
                <Text style={styles.activityEmoji}>📢</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{item.title}</Text>
                <Text style={styles.activityDetail}>{item.category}</Text>
              </View>
              <Text style={styles.activityTime}>{formatDate(item.created_at)}</Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryGreen,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 22,
    paddingBottom: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  adminName: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  adminRole: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  statsRow: { paddingRight: 4, gap: 12, paddingBottom: 4 },
  statCard: {
    borderRadius: 18,
    padding: 16,
    minWidth: 110,
    alignItems: 'center',
  },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '900', marginBottom: 3 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 22 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  menuCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  menuEmoji: { fontSize: 26 },
  menuLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  menuArrow: { fontSize: 20, fontWeight: '800' },
  pendingBanner: {
    backgroundColor: '#fff8e1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#e65100',
  },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pendingEmoji: { fontSize: 26 },
  pendingTitle: { fontSize: 15, fontWeight: '800', color: '#e65100' },
  pendingSub: { fontSize: 12, color: '#bf360c', marginTop: 2 },
  pendingArrow: { fontSize: 20, color: '#e65100', fontWeight: '800' },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  activityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityEmoji: { fontSize: 18 },
  activityContent: { flex: 1 },
  activityAction: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  activityDetail: { fontSize: 12, color: COLORS.textSubtitle, marginTop: 2 },
  activityTime: { fontSize: 11, color: COLORS.placeholder, fontWeight: '600' },
  activityDivider: { position: 'absolute', display: 'none' },
  emptyText: { fontSize: 13, color: COLORS.textSubtitle, textAlign: 'center', paddingVertical: 16 },
});

export default AdminDashboard;