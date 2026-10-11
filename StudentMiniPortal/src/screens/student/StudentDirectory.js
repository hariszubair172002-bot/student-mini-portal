import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import * as studentApi from '../../api/studentApi';

// Matches the CHECK constraint on STUDENTS.program in database.sql
const PROGRAMS = ['All Programs', 'BSCS', 'BSSE', 'ALUMNI'];

const AVATAR_COLORS = [
  '#e8f5e9',
  '#e3f2fd',
  '#fff3e0',
  '#fce4ec',
  '#f3e5f5',
  '#e0f7fa',
];

const TEXT_COLORS = [
  '#1d7837',
  '#1565c0',
  '#e65100',
  '#880e4f',
  '#6a1b9a',
  '#00695c',
];

const StudentDirectory = ({ navigation }) => {
  const [activeProgram, setActiveProgram] = useState('All Programs');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await studentApi.getAllStudents(activeProgram, search);
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Could not load students.');
    } finally {
      setLoading(false);
    }
  }, [activeProgram, search]);

  useEffect(() => {
    const t = setTimeout(loadStudents, 350);
    return () => clearTimeout(t);
  }, [loadStudents]);

  const openStudent = async (item) => {
    setDetailLoading(true);
    setSelectedStudent(item); // show basics immediately

    try {
      const full = await studentApi.getStudentById(item.id);
      setSelectedStudent(full);
    } catch (err) {
      // keep the basic row data if the detail fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '?';

  const getColor = (id) => {
    const idx = parseInt(id, 10) % AVATAR_COLORS.length;

    return {
      bg: AVATAR_COLORS[idx],
      text: TEXT_COLORS[idx],
    };
  };

  const renderStudent = ({ item }) => {
    const color = getColor(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: color.bg },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: color.text },
              ]}
            >
              {getInitials(item.name)}
            </Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.studentName}>{item.name}</Text>

            <Text style={styles.studentRoll}>
              {item.arid_number}
            </Text>

            <View style={styles.tagRow}>
              <View
                style={[
                  styles.programTag,
                  { backgroundColor: color.bg },
                ]}
              >
                <Text
                  style={[
                    styles.programTagText,
                    { color: color.text },
                  ]}
                >
                  {item.program}
                </Text>
              </View>

              <Text style={styles.semesterText}>
                {item.semester}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.viewBtn}
          onPress={() => openStudent(item)}
        >
          <Text style={styles.viewBtnText}>VIEW ›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryGreen}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Student Directory
          </Text>

          <View style={{ width: 28 }} />
        </View>

        {/* Search Bar - COMMENTED OUT */}
        {/*
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll no..."
            placeholderTextColor={COLORS.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        */}
      </View>

      {/* Student Filter Bar - COMMENTED OUT */}
      {/*
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {PROGRAMS.map((p) => (
            <TouchableOpacity
              key={p}
              activeOpacity={0.7}
              style={[
                styles.chip,
                activeProgram === p && styles.chipActive,
              ]}
              onPress={() => setActiveProgram(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeProgram === p && styles.chipTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      */}

      <Text style={styles.resultCount}>
        {loading
          ? 'Loading…'
          : `${students.length} student${
              students.length !== 1 ? 's' : ''
            } found`}
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderStudent}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View style={{ height: 10 }} />
        )}
        showsVerticalScrollIndicator={false}
        onRefresh={loadStudents}
        refreshing={loading}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>

              <Text style={styles.emptyText}>
                {error || 'No students found'}
              </Text>
            </View>
          )
        }
      />

      {/* Student Detail Modal */}
      <Modal
        visible={!!selectedStudent}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStudent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedStudent &&
              (() => {
                const color = getColor(selectedStudent.id);

                return (
                  <>
                    <View style={styles.modalHandle} />

                    <View style={styles.modalAvatarRow}>
                      <View
                        style={[
                          styles.modalAvatar,
                          { backgroundColor: color.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalAvatarText,
                            { color: color.text },
                          ]}
                        >
                          {getInitials(selectedStudent.name)}
                        </Text>
                      </View>

                      <View>
                        <Text style={styles.modalName}>
                          {selectedStudent.name}
                        </Text>

                        <Text style={styles.modalRoll}>
                          {selectedStudent.arid_number}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {[
                      {
                        icon: '🎓',
                        label: 'Program',
                        value: selectedStudent.program,
                      },
                      {
                        icon: '📚',
                        label: 'Department',
                        value:
                          selectedStudent.department || '—',
                      },
                      {
                        icon: '📅',
                        label: 'Semester',
                        value: selectedStudent.semester,
                      },
                      {
                        icon: '📧',
                        label: 'Email',
                        value: selectedStudent.email,
                      },
                      {
                        icon: '📞',
                        label: 'Phone',
                        value: selectedStudent.phone || '—',
                      },
                    ].map((row) => (
                      <View
                        key={row.label}
                        style={styles.infoRow}
                      >
                        <Text style={styles.infoIcon}>
                          {row.icon}
                        </Text>

                        <View>
                          <Text style={styles.infoLabel}>
                            {row.label}
                          </Text>

                          <Text style={styles.infoValue}>
                            {row.value}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.closeBtn}
                      onPress={() =>
                        setSelectedStudent(null)
                      }
                    >
                      <Text style={styles.closeBtnText}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

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

  backArrow: {
    fontSize: 22,
    color: COLORS.white,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },

  searchIcon: {
    fontSize: 16,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  filtersWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardFill,
  },

  filters: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: COLORS.cardFill,
  },

  chipActive: {
    backgroundColor: COLORS.primaryGreen,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSubtitle,
  },

  chipTextActive: {
    color: COLORS.white,
  },

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

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },

  cardInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  studentRoll: {
    fontSize: 12,
    color: COLORS.textSubtitle,
    marginTop: 1,
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },

  programTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },

  programTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  semesterText: {
    fontSize: 12,
    color: COLORS.textSubtitle,
  },

  viewBtn: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 8,
  },

  viewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accentGreen,
    letterSpacing: 0.3,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    color: COLORS.textSubtitle,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.cardFill,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  modalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },

  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalAvatarText: {
    fontSize: 22,
    fontWeight: '800',
  },

  modalName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  modalRoll: {
    fontSize: 13,
    color: COLORS.textSubtitle,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.cardFill,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },

  infoIcon: {
    fontSize: 18,
    marginTop: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: COLORS.textSubtitle,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },

  closeBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  closeBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default StudentDirectory;