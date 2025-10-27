import { StyleSheet } from 'react-native';

export const useUserListStyles = (colors: any) => StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.headerBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: colors.grayText,
    marginBottom: 8,
  },
  memberTags: {
    flexDirection: 'row',
    gap: 8,
  },
  roleTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  adminTag: {
    backgroundColor: colors.headerBlue,
    borderColor: colors.headerBlue,
  },
  employeeTag: {
    backgroundColor: colors.lightGray,
    borderColor: colors.border,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  adminTagText: {
    color: '#FFFFFF',
  },
  employeeTagText: {
    color: colors.grayText,
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeTag: {
    backgroundColor: '#10B981', // Green for active
    borderColor: '#10B981',
  },
  inactiveTag: {
    backgroundColor: '#EF4444', // Red for inactive
    borderColor: '#EF4444',
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeTagText: {
    color: '#FFFFFF',
  },
  inactiveTagText: {
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: colors.background,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.grayText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
