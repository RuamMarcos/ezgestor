import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16, 
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DashboardColors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: DashboardColors.grayText,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: DashboardColors.lightGray,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: DashboardColors.headerBlue,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: DashboardColors.lightGray,
    opacity: 0.7,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: DashboardColors.lightGray,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '600',
    color: DashboardColors.darkText,
  },
  loadingIndicator: {
    marginTop: 50,
  },
});