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
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';
import { PillButton, LabeledInput } from '../../components';
import { useAuth } from '../../context/AuthContext';
import * as noticeApi from '../../api/noticeApi';

// Matches what NOTICES actually stores — there's no fixed "date" field
// (created_at is set automatically by the DB).
const CATEGORY_OPTIONS = ['Academic', 'Facility', 'Event', 'Update'];
const SEMESTER_OPTIONS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const DEPARTMENT_OPTIONS = ['All Departments', 'AI', 'SE', 'CS'];

const AdminPostNotice = ({ navigation }) => {
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [description, setDescription] = useState('');
  const [semesterFrom, setSemesterFrom] = useState('1st');
  const [semesterTo, setSemesterTo] = useState('8th');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!category) e.category = 'Select a category.';
    if (!description.trim()) e.description = 'Description is required.';
    if (description.trim().length < 20) e.description = 'Minimum 20 characters required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    if (!session?.user?.id) {
      Alert.alert('Error', 'Missing admin reference. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      await noticeApi.createNotice({
        posted_by: session.user.id,
        title: title.trim(),
        category,
        description: description.trim(),
        // "All Departments" means no targeting filter — leave it NULL on the backend
        department: department === 'All Departments' ? undefined : department,
        semester_from: semesterFrom,
        semester_to: semesterTo,
      });
      Alert.alert(
        'Notice Published!',
        'Your notice has been published to the student portal.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not publish notice.');
    } finally {
      setLoading(false);
    }
  };

  const DropdownModal = ({ visible, onClose, options, onSelect, selected, title: modalTitle }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.dropdownModal}>
          <Text style={styles.dropdownTitle}>{modalTitle}</Text>
          <View style={styles.divider} />
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.7}
                style={[styles.dropdownOption, selected === opt && styles.dropdownOptionActive]}
                onPress={() => { onSelect(opt); onClose(); }}
              >
                <Text style={[styles.dropdownOptionText, selected === opt && styles.dropdownOptionTextActive]}>
                  {opt}
                </Text>
                {selected === opt && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Notice</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

            {/* Title */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Notice Title</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter a clear, descriptive title..."
                placeholderTextColor={COLORS.placeholder}
                value={title}
                onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
              />
              {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
            </View>

            {/* Department (maps to NOTICES.department) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Target Department</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.dropdown}
                onPress={() => setShowDeptModal(true)}
              >
                <Text style={styles.dropdownSelected}>{department}</Text>
                <Text style={styles.dropdownArrow}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Semester Range (maps to NOTICES.semester_from / semester_to) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Target Semester Range</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.dropdown, { flex: 1 }]}
                  onPress={() => setShowFromModal(true)}
                >
                  <Text style={styles.dropdownSelected}>From: {semesterFrom}</Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.dropdown, { flex: 1 }]}
                  onPress={() => setShowToModal(true)}
                >
                  <Text style={styles.dropdownSelected}>To: {semesterTo}</Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Dropdown */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Category</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.dropdown, errors.category && styles.inputError]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={category ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                  {category || 'Select category...'}
                </Text>
                <Text style={styles.dropdownArrow}>▾</Text>
              </TouchableOpacity>
              {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
            </View>

            {/* Description */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea, errors.description && styles.inputError]}
                placeholder="Write the full notice content here. Be clear and specific..."
                placeholderTextColor={COLORS.placeholder}
                value={description}
                onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length} characters</Text>
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>

          </View>

          {/* Preview Card */}
          {title.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewOfficialBadge}>
                  <Text style={styles.previewOfficialText}>● OFFICIAL</Text>
                </View>
                <Text style={styles.previewTitle}>{title}</Text>
                <Text style={styles.previewAudience}>
                  👥 {department} · Semester {semesterFrom}–{semesterTo}
                </Text>
                {description.length > 0 && (
                  <Text style={styles.previewBody} numberOfLines={3}>{description}</Text>
                )}
              </View>
            </View>
          )}

          <PillButton
            title="📢  PUBLISH NOTICE"
            onPress={handlePublish}
            loading={loading}
          />

          <TouchableOpacity activeOpacity={0.7} style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Department Modal */}
      <DropdownModal
        visible={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        options={DEPARTMENT_OPTIONS}
        onSelect={(val) => setDepartment(val)}
        selected={department}
        title="Target Department"
      />

      {/* Semester Modals */}
      <DropdownModal
        visible={showFromModal}
        onClose={() => setShowFromModal(false)}
        options={SEMESTER_OPTIONS}
        onSelect={(val) => setSemesterFrom(val)}
        selected={semesterFrom}
        title="From Semester"
      />
      <DropdownModal
        visible={showToModal}
        onClose={() => setShowToModal(false)}
        options={SEMESTER_OPTIONS}
        onSelect={(val) => setSemesterTo(val)}
        selected={semesterTo}
        title="To Semester"
      />

      {/* Category Modal */}
      <DropdownModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        options={CATEGORY_OPTIONS}
        onSelect={(val) => { setCategory(val); setErrors((e) => ({ ...e, category: '' })); }}
        selected={category}
        title="Select Category"
      />
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
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },
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
  fieldWrapper: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSubtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardFill,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  textarea: { minHeight: 130, textAlignVertical: 'top' },
  inputError: { borderColor: COLORS.errorRed },
  errorText: { fontSize: 12, color: COLORS.errorRed, marginTop: 5, fontWeight: '600' },
  charCount: { fontSize: 11, color: COLORS.placeholder, textAlign: 'right', marginTop: 4 },
  dropdown: {
    backgroundColor: COLORS.cardFill,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dropdownSelected: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  dropdownPlaceholder: { fontSize: 14, color: COLORS.placeholder },
  dropdownArrow: { fontSize: 16, color: COLORS.textSubtitle },
  previewSection: { marginBottom: 16 },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSubtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGreen,
    borderStyle: 'dashed',
  },
  previewOfficialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
  },
  previewOfficialText: { fontSize: 10, fontWeight: '800', color: COLORS.accentGreen },
  previewTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  previewAudience: { fontSize: 12, color: COLORS.textSubtitle, marginBottom: 8 },
  previewBody: { fontSize: 13, color: COLORS.textSubtitle, lineHeight: 19 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText: { color: COLORS.textSubtitle, fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dropdownModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  divider: { height: 1, backgroundColor: COLORS.cardFill, marginBottom: 4 },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardFill,
  },
  dropdownOptionActive: { backgroundColor: COLORS.lightGreen },
  dropdownOptionText: { fontSize: 14, color: COLORS.textPrimary },
  dropdownOptionTextActive: { color: COLORS.accentGreen, fontWeight: '700' },
  checkmark: { fontSize: 16, color: COLORS.accentGreen, fontWeight: '700' },
});

export default AdminPostNotice;