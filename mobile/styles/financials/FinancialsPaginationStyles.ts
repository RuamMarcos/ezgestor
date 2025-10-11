import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DashboardColors.headerBlue,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activePage: {
    backgroundColor: DashboardColors.headerBlue,
    borderColor: DashboardColors.headerBlue,
  },
  activePageText: {
    color: '#fff',
  },
  disabledText: {
    color: '#ccc',
  },
});