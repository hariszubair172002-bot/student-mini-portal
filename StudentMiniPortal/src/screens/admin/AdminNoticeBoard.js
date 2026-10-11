import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import * as noticeApi from '../../api/noticeApi';
import * as commentApi from '../../api/commentApi';

const CATEGORY_COLORS = {
  Academic: { bg: '#e8f5e9', text: '#1d7837' },
  Update: { bg: '#fff3e0', text: '#e65100' },
  Event: { bg: '#e3f2fd', text: '#1565c0' },
  Facility: { bg: '#fce4ec', text: '#880e4f' },
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit',
  });
};

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const audienceOf = (item) => {
  const dept = item.department || 'All Departments';
  const sem = item.semester_from && item.semester_to
    ? `Semester ${item.semester_from}–${item.semester_to}`
    : 'All Semesters';
  return `${dept} · ${sem}`;
};

const AdminNoticeBoard = ({ navigation }) => {
  const { session } = useAuth();
  const currentUser = session?.user;

  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comments state — feature temporarily disabled below (see "COMMENTS DISABLED")
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await noticeApi.getAllNotices({ search: search || undefined });
      setNotices(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load notices.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadNotices, 350);
    return () => clearTimeout(t);
  }, [loadNotices]);

  const loadComments = useCallback(async (noticeId) => {
    setCommentsLoading(true);
    try {
      const data = await commentApi.getComments(noticeId);
      setComments(data);
    } catch (err) {
      // silent — comments are secondary to the notice content
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedNotice) {
      setCommentText('');
      // COMMENTS DISABLED — uncomment to re-enable fetching comments on open
      // loadComments(selectedNotice.id);
    } else {
      setComments([]);
    }
  }, [selectedNotice, loadComments]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedNotice || !currentUser?.id) return;
    setPostingComment(true);
    try {
      const newComment = await commentApi.addComment(selectedNotice.id, currentUser.id, commentText);
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = (comment) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentApi.deleteComment(comment.id, currentUser.id, currentUser.role);
            setComments((prev) => prev.filter((c) => c.id !== comment.id));
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not delete comment.');
          }
        },
      },
    ]);
  };

  // Admin can always delete, per your moderation rule
  const canDelete = () => true;

  const handleDelete = (id) => {
    Alert.alert(
      'Archive Notice',
      'This will remove it from the active Notice Board. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await noticeApi.deleteNotice(id);
              setNotices((prev) => prev.filter((n) => n.id !== id));
              setSelectedNotice(null);
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not delete notice.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const cat = CATEGORY_COLORS[item.category] || { bg: COLORS.lightGreen, text: COLORS.accentGreen };
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.card}
        onPress={() => setSelectedNotice(item)}
      >
        {/* Official Tag */}
        <View style={styles.officialBadge}>
          <Text style={styles.officialText}>● OFFICIAL</Text>
        </View>

        <View style={styles.cardTop}>
          <View style={[styles.tag, { backgroundColor: cat.bg }]}>
            <Text style={[styles.tagText, { color: cat.text }]}>{item.category}</Text>
          </View>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardAudience}>👥 {audienceOf(item)}</Text>

        {/* Action Row — editing isn't supported by the backend (no PUT /api/notices/:id yet) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Notices</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addBtn}
            onPress={() => navigation.navigate('AdminPostNotice', {})}
          >
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notices..."
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

      <Text style={styles.resultCount}>
        {loading ? 'Loading…' : `${notices.length} notice${notices.length !== 1 ? 's' : ''}`}
      </Text>

      <FlatList
        data={notices}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        onRefresh={loadNotices}
        refreshing={loading}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No notices found</Text>
            </View>
          )
        }
      />

      {/* Detail / Preview Modal */}
      <Modal
        visible={!!selectedNotice}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedNotice(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            {selectedNotice && (
              <>
                <View style={styles.modalHandle} />
                {(() => {
                  const cat = CATEGORY_COLORS[selectedNotice.category] || { bg: COLORS.lightGreen, text: COLORS.accentGreen };
                  return (
                    <View style={styles.modalTopRow}>
                      <View style={[styles.tag, { backgroundColor: cat.bg }]}>
                        <Text style={[styles.tagText, { color: cat.text }]}>{selectedNotice.category}</Text>
                      </View>
                      <Text style={styles.cardDate}>{formatDate(selectedNotice.created_at)}</Text>
                    </View>
                  );
                })()}
                <Text style={styles.modalTitle}>{selectedNotice.title}</Text>
                <Text style={styles.modalAudience}>👥 Target: {audienceOf(selectedNotice)}</Text>
                <View style={styles.divider} />

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '100%' }}>
                  <Text style={styles.modalBody}>{selectedNotice.description}</Text>
                  {selectedNotice.posted_by_name ? (
                    <Text style={styles.modalPostedBy}>Posted by {selectedNotice.posted_by_name}</Text>
                  ) : null}

                  {/*
                  COMMENTS SECTION — temporarily disabled. Delete the /* and *\/ markers
                  around this block to bring it back.

                  <View style={styles.commentsDivider} />
                  <Text style={styles.commentsHeader}>
                    💬 Comments {comments.length > 0 ? `(${comments.length})` : ''}
                  </Text>

                  {commentsLoading ? (
                    <Text style={styles.commentsEmpty}>Loading comments…</Text>
                  ) : comments.length === 0 ? (
                    <Text style={styles.commentsEmpty}>No comments yet.</Text>
                  ) : (
                    comments.map((c) => (
                      <View key={c.id} style={styles.commentRow}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>{getInitials(c.name)}</Text>
                        </View>
                        <View style={styles.commentBody}>
                          <View style={styles.commentMetaRow}>
                            <Text style={styles.commentName}>{c.name}</Text>
                            {c.role === 'admin' && (
                              <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                              </View>
                            )}
                            <Text style={styles.commentTime}>{formatTime(c.created_at)}</Text>
                          </View>
                          <Text style={styles.commentText}>{c.comment_text}</Text>
                        </View>
                        {canDelete(c) && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleDeleteComment(c)}
                            style={styles.commentDeleteBtn}
                          >
                            <Text style={styles.commentDeleteIcon}>🗑</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}
                  */}
                </ScrollView>

                {/*
                Add Comment Input — temporarily disabled along with the section above.

                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    placeholderTextColor={COLORS.placeholder}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.commentSendBtn, (!commentText.trim() || postingComment) && styles.commentSendBtnDisabled]}
                    onPress={handleAddComment}
                    disabled={!commentText.trim() || postingComment}
                  >
                    <Text style={styles.commentSendText}>{postingComment ? '...' : 'Send'}</Text>
                  </TouchableOpacity>
                </View>
                */}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.modalDeleteBtn}
                    onPress={() => handleDelete(selectedNotice.id)}
                  >
                    <Text style={styles.modalDeleteText}>🗑  Delete Notice</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
    marginBottom: 14,
  },
  backArrow: { fontSize: 22, color: COLORS.white },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { fontSize: 14, color: COLORS.textSubtitle, padding: 2 },
  resultCount: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    fontSize: 12,
    color: COLORS.textSubtitle,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  officialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
  },
  officialText: { fontSize: 10, fontWeight: '800', color: COLORS.accentGreen, letterSpacing: 0.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardDate: { fontSize: 12, color: COLORS.textSubtitle },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4, lineHeight: 21 },
  cardAudience: { fontSize: 12, color: COLORS.textSubtitle, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff0f0',
    paddingVertical: 9,
    borderRadius: 12,
  },
  deleteIcon: { fontSize: 14 },
  deleteBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.errorRed },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textSubtitle, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: COLORS.cardFill,
    borderRadius: 2, alignSelf: 'center', marginBottom: 18,
  },
  modalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 26, marginBottom: 4 },
  modalAudience: { fontSize: 13, color: COLORS.textSubtitle, marginBottom: 14 },
  divider: { height: 1, backgroundColor: COLORS.cardFill, marginBottom: 14 },
  modalBody: { fontSize: 14, color: COLORS.textSubtitle, lineHeight: 22 },
  modalPostedBy: { fontSize: 12, color: COLORS.placeholder, marginTop: 8, fontStyle: 'italic' },
  commentsDivider: { height: 1, backgroundColor: COLORS.cardFill, marginTop: 14, marginBottom: 14 },
  commentsHeader: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  commentsEmpty: { fontSize: 13, color: COLORS.textSubtitle, fontStyle: 'italic', marginBottom: 10 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.lightGreen, alignItems: 'center', justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 11, fontWeight: '800', color: COLORS.accentGreen },
  commentBody: { flex: 1 },
  commentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' },
  commentName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  adminBadge: { backgroundColor: COLORS.lightGreen, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  adminBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.accentGreen },
  commentTime: { fontSize: 11, color: COLORS.placeholder },
  commentText: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 19 },
  commentDeleteBtn: { padding: 4 },
  commentDeleteIcon: { fontSize: 14 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardFill,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.cardFill,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
    maxHeight: 90,
  },
  commentSendBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  commentSendBtnDisabled: { opacity: 0.5 },
  commentSendText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalDeleteBtn: {
    flex: 1, backgroundColor: '#fff0f0',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  modalDeleteText: { color: COLORS.errorRed, fontWeight: '700', fontSize: 14 },
});

export default AdminNoticeBoard;