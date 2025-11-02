import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createAddProductModalStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.darkText,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: colors.background,
    color: colors.darkText,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: colors.headerBlue,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    color: colors.darkText,
  },
  saveButtonText: {
    color: isDark ? colors.card : '#FFFFFF',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: colors.lightGray,
  },
  imageHint: {
    color: colors.grayText,
    marginBottom: 8,
    textAlign: 'center',
  },
  imagePickerButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  imagePickerButtonText: {
    color: colors.darkText,
    fontWeight: '600',
  },
});
