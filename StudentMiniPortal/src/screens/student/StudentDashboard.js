import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import * as noticeApi from '../../api/noticeApi';

const MENU_ITEMS = [
  { id: '1', label: 'Notices', emoji: '📋', route: 'StudentNoticeBoard', bg: '#e8f5e9' },
  { id: '2', label: 'Profile', emoji: '👤', route: 'StudentProfile', bg: '#e3f2fd' },
  { id: '3', label: 'Directory', emoji: '📖', route: 'StudentDirectory', bg: '#fff3e0' },
  { id: '4', label: 'Request', emoji: '📝', route: 'PostRequest', bg: '#fce4ec' },
];

const CATEGORY_COLORS = {
  Academic: { bg: '#e8f5e9', text: COLORS.accentGreen },
  Update: { bg: '#fff3e0', text: '#e65100' },
  Event: { bg: '#e3f2fd', text: '#1565c0' },
  Facility: { bg: '#fce4ec', text: '#880e4f' },
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const StudentDashboard = ({ navigation }) => {
  const { session } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const student = session?.student;
  const user = session?.user;

  const loadNotices = async () => {
    setLoading(true);
    setError('');
    try {
      // Only notices targeted at this student's department/semester (or
      // untargeted "for everyone" notices) show up — see noticeController.
      const data = await noticeApi.getAllNotices({
        limit: 4,
        department: student?.department,
        semester: student?.semester,
      });
      setNotices(data);
    } catch (err) {
      setError(err.message || 'Could not load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
    // Nudge to update profile if email or phone isn't verified yet
    if (student && (!student.is_email_verified || !student.is_phone_verified)) {
      const timer = setTimeout(() => setShowReminder(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const renderNoticeCard = ({ item }) => {
    const cat = CATEGORY_COLORS[item.category] || { bg: COLORS.lightGreen, text: COLORS.accentGreen };
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.noticeCard}
        onPress={() => navigation.navigate('StudentNoticeBoard')}
      >
        <View style={styles.noticeTop}>
          <View style={[styles.categoryTag, { backgroundColor: cat.bg }]}>
            <Text style={[styles.categoryText, { color: cat.text }]}>{item.category}</Text>
          </View>
          <Text style={styles.noticeDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.noticeTitle}>{item.title}</Text>
        <Text style={styles.noticePreview} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.detailsLink}>Details →</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Rounded Green Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            <Text style={styles.userMeta}>
              {student ? `${student.program} · Semester ${student.semester}` : ''}
            </Text>
          </View>
          {/* Avatar */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('StudentProfile')}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initialsOf(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Grid 2x2 */}
        <Text style={styles.sectionLabel}>Quick Access</Text>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Notice Feed */}
        <View style={styles.feedHeader}>
          <Text style={styles.sectionLabel}>Latest Notices</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('StudentNoticeBoard')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.emptyText}>Loading notices…</Text>
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : notices.length === 0 ? (
          <Text style={styles.emptyText}>No notices yet.</Text>
        ) : (
          <FlatList
            data={notices}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNoticeCard}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.fab}
        onPress={() => navigation.navigate('PostRequest')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Monthly Reminder Modal */}
      <Modal
        visible={showReminder}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReminder(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🔔</Text>
            <Text style={styles.modalTitle}>Profile Reminder</Text>
            <Text style={styles.modalSubtitle}>
              Your email or phone isn't verified yet. Verify it to keep your profile complete and up to date.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.updateBtn}
              onPress={() => {
                setShowReminder(false);
                navigation.navigate('StudentEditProfile');
              }}
            >
              <Text style={styles.updateBtnText}>🖊 Update Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowReminder(false)}
              style={styles.laterBtn}
            >
              <Text style={styles.laterText}>Remind Me Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  userMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 22 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 26,
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
  menuLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAll: { fontSize: 13, color: COLORS.accentGreen, fontWeight: '700' },
  emptyText: { fontSize: 13, color: COLORS.textSubtitle, textAlign: 'center', paddingVertical: 20 },
  noticeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  noticeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  noticeDate: { fontSize: 12, color: COLORS.textSubtitle },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  noticePreview: { fontSize: 13, color: COLORS.textSubtitle, lineHeight: 19 },
  detailsLink: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
    alignSelf: 'flex-end',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: { fontSize: 32, color: COLORS.white, lineHeight: 36, marginTop: -2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalEmoji: { fontSize: 48, marginBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSubtitle,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  updateBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  laterBtn: { paddingVertical: 10 },
  laterText: { color: COLORS.textSubtitle, fontSize: 14 },
});

export default StudentDashboard;