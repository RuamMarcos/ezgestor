import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: DashboardColors.background,
	},
	listContent: {
		paddingBottom: 100,
	},
	headerSpacing: {
		paddingTop: 16,
		paddingBottom: 16,
	},
	pageTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: DashboardColors.darkText,
	},
	cardsSection: {
		marginBottom: 16,
	},
	cardsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	cardsRowFull: {
		flexDirection: 'row',
	},
	chartContainer: {
		marginBottom: 16,
	},
	listTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: DashboardColors.darkText,
		marginBottom: 12,
		paddingTop: 16,
	},
	footerLoader: {
		padding: 20,
	},
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		width: 56,
		borderRadius: 28,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
	},
	addButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: 200,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
});

