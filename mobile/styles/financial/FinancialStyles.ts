import { StyleSheet } from 'react-native';
import { DashboardColors } from '@/constants/DashboardColors';

export const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: DashboardColors.background,
	},
	listContent: {
		paddingBottom: 24,
	},
	headerSpacing: {
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	pageTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: DashboardColors.darkText,
	},
	cardsSection: {
		paddingHorizontal: 20,
		paddingTop: 12,
	},
	cardsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	cardsRowFull: {
		marginTop: 12,
	},
	chartContainer: {
		paddingHorizontal: 20,
		marginTop: 16,
	},
	listTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginHorizontal: 20,
		marginTop: 16,
		marginBottom: 12,
		color: DashboardColors.darkText,
	},
	footerLoader: {
		marginVertical: 20,
	},
});

