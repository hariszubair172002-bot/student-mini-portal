import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import * as noticeRequestApi from '../../api/noticeRequestApi';

const STATUS_CONFIG = {
  pending: { bg: '#fff8e1', text: '#e65100', dot: '#e65100', label: 'PENDING' },
  approved: { bg: '#e8f5e9', text: '#1d7837', dot: '#28a745', label: 'APPROVED' },
  rejected: { bg: '#fff0f0', text: '#c62828', dot: '#dc3545', label: 'REJECTED' },
};

const CATEGORY_COLORS = {
  Academic: { bg: '#e8f5e9', text: '#1d7837' },
  Update: { bg: '#fff3e0', text: '#e65100' },
  Event: { bg: '#e3f2fd', text: '#1565c0' },
  Facility: { bg: '#fce4ec', text: '#880e4f' },
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '?';

const AdminApprovals = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeFilter === 'All' ? undefined : activeFilter.toLowerCase();
      const data = await noticeRequestApi.getAllRequests(status);
      setRequests(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filtered = requests.filter((r) => {
    const s = search.toLowerCase();
    return (
      (r.student_name || '').toLowerCase().includes(s) ||
      (r.title || '').toLowerCase().includes(s)
    );
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const updateStatus = async (id, status) => {
    setActioning(true);
    try {
      await noticeRequestApi.updateRequestStatus(id, status);
      setSelectedRequest(null);
      loadRequests();
      Alert.alert(
        status === 'approved' ? '✅ Request Approved' : '❌ Request Rejected',
        status === 'approved'
          ? 'It has been published to the Notice Board.'
          : 'The request has been marked as rejected.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update the request.');
    } finally {
      setActioning(false);
    }
  };

  const handleApprove = (id) => {
    Alert.alert('Approve Request', 'This will publish it to the Notice Board. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => updateStatus(id, 'approved') },
    ]);
  };

  const handleReject = (id) => {
    Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus(id, 'rejected') },
    ]);
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const cat = CATEGORY_COLORS[item.category] || { bg: COLORS.lightGreen, text: COLORS.accentGreen };
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.card}
        onPress={() => setSelectedRequest(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.initials}>
            <Text style={styles.initialsText}>{getInitials(item.student_name)}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.student_name}</Text>
            <Text style={styles.studentMeta}>{item.program}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusDot, { color: status.dot }]}>●</Text>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.requestSubject}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.categoryTag, { backgroundColor: cat.bg }]}>
            <Text style={[styles.categoryTagText, { color: cat.text }]}>{item.category}</Text>
          </View>
          <Text style={styles.submittedDate}>📅 {formatDate(item.created_at)}</Text>
        </View>

        <Text style={styles.previewText} numberOfLines={2}>{item.description}</Text>

        {item.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity activeOpacity={0.7} style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
              <Text style={styles.approveBtnIcon}>✓</Text>
              <Text style={styles.approveBtnText}>APPROVE</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
              <Text style={styles.rejectBtnIcon}>✕</Text>
              <Text style={styles.rejectBtnText}>REJECT</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Approvals</Text>
              {pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
            <View style={{ width: 22 }} />
          </View>

          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or subject..."
              placeholderTextColor={COLORS.placeholder}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => {
            const count = f === 'All' ? requests.length : requests.filter((r) => r.status === f.toLowerCase()).length;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.7}
                style={[styles.chip, activeFilter === f && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
                <View style={[styles.chipBadge, activeFilter === f && styles.chipBadgeActive]}>
                  <Text style={[styles.chipBadgeText, activeFilter === f && styles.chipBadgeTextActive]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.resultCount}>
        {loading ? 'Loading…' : `${filtered.length} request${filtered.length !== 1 ? 's' : ''}`}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        onRefresh={loadRequests}
        refreshing={loading}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No requests found</Text>
            </View>
          )
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selectedRequest}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedRequest(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => {}}>
            {selectedRequest && (
              <>
                <View style={styles.modalHandle} />
                <View style={styles.modalStudentRow}>
                  <View style={styles.modalInitials}>
                    <Text style={styles.modalInitialsText}>{getInitials(selectedRequest.student_name)}</Text>
                  </View>
                  <View style={styles.modalStudentInfo}>
                    <Text style={styles.modalStudentName}>{selectedRequest.student_name}</Text>
                    <Text style={styles.modalStudentMeta}>{selectedRequest.program}</Text>
                  </View>
                </View>

                <View style={styles.modalDivider} />

                <Text style={styles.modalSubject}>{selectedRequest.title}</Text>
                <View style={styles.modalMeta}>
                  <View
                    style={[
                      styles.categoryTag,
                      { backgroundColor: (CATEGORY_COLORS[selectedRequest.category] || {}).bg || COLORS.lightGreen },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTagText,
                        { color: (CATEGORY_COLORS[selectedRequest.category] || {}).text || COLORS.accentGreen },
                      ]}
                    >
                      {selectedRequest.category}
                    </Text>
                  </View>
                  <Text style={styles.modalDate}>📅 {formatDate(selectedRequest.created_at)}</Text>
                </View>

                <Text style={styles.modalSectionLabel}>Description</Text>
                <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalDescription}>{selectedRequest.description}</Text>
                </ScrollView>

                {selectedRequest.status === 'pending' ? (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.modalApproveBtn}
                      disabled={actioning}
                      onPress={() => updateStatus(selectedRequest.id, 'approved')}
                    >
                      <Text style={styles.modalApproveBtnText}>{actioning ? '...' : '✓ APPROVE'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.modalRejectBtn}
                      disabled={actioning}
                      onPress={() => updateStatus(selectedRequest.id, 'rejected')}
                    >
                      <Text style={styles.modalRejectBtnText}>{actioning ? '...' : '✕ REJECT'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.closeBtn}
                    onPress={() => setSelectedRequest(null)}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primaryGreen, paddingHorizontal: 20, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginBottom: 14 },
  backArrow: { fontSize: 22, color: COLORS.white },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  pendingBadge: { backgroundColor: '#e65100', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  pendingBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { fontSize: 14, color: COLORS.textSubtitle, padding: 2 },
  filtersWrapper: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.cardFill },
  filters: { paddingHorizontal: 18, paddingVertical: 12, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, backgroundColor: COLORS.cardFill, gap: 6 },
  chipActive: { backgroundColor: COLORS.primaryGreen },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSubtitle },
  chipTextActive: { color: COLORS.white },
  chipBadge: { backgroundColor: '#e65100', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  chipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  chipBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
  chipBadgeTextActive: { color: COLORS.white },
  resultCount: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, fontSize: 12, color: COLORS.textSubtitle, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },
  card: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  initials: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.lightGreen, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 15, fontWeight: '800', color: COLORS.accentGreen },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  studentMeta: { fontSize: 11, color: COLORS.textSubtitle, marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 3 },
  statusDot: { fontSize: 8 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  requestSubject: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  categoryTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  categoryTagText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  submittedDate: { fontSize: 12, color: COLORS.textSubtitle },
  previewText: { fontSize: 13, color: COLORS.textSubtitle, lineHeight: 19, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#e8f5e9', paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.successGreen },
  approveBtnIcon: { fontSize: 14, color: COLORS.successGreen, fontWeight: '800' },
  approveBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.successGreen, letterSpacing: 0.3 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff0f0', paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.errorRed },
  rejectBtnIcon: { fontSize: 14, color: COLORS.errorRed, fontWeight: '800' },
  rejectBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.errorRed, letterSpacing: 0.3 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textSubtitle, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: '88%' },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.cardFill, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalStudentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  modalInitials: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.lightGreen, alignItems: 'center', justifyContent: 'center' },
  modalInitialsText: { fontSize: 18, fontWeight: '900', color: COLORS.accentGreen },
  modalStudentInfo: { flex: 1 },
  modalStudentName: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  modalStudentMeta: { fontSize: 12, color: COLORS.textSubtitle, marginTop: 2 },
  modalDivider: { height: 1, backgroundColor: COLORS.cardFill, marginVertical: 14 },
  modalSubject: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  modalMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  modalDate: { fontSize: 12, color: COLORS.textSubtitle },
  modalSectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSubtitle, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  modalDescription: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  modalApproveBtn: { flex: 1, backgroundColor: COLORS.successGreen, borderRadius: 50, paddingVertical: 15, alignItems: 'center' },
  modalApproveBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  modalRejectBtn: { flex: 1, backgroundColor: COLORS.errorRed, borderRadius: 50, paddingVertical: 15, alignItems: 'center' },
  modalRejectBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  closeBtn: { backgroundColor: COLORS.accentGreen, borderRadius: 50, paddingVertical: 14, alignItems: 'center' },
  closeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});

export default AdminApprovals;