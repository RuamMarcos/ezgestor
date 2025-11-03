import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/context/ThemeContext';

export const createFinancialStyles = (colors: ThemeColors) => StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.background,
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
		color: colors.darkText,
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
		color: colors.darkText,
	},
	footerLoader: {
		marginVertical: 20,
	},
	fab: {
		position: 'absolute',
		width: 56,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		right: 20,
		bottom: 75,
		backgroundColor: colors.headerBlue,
		borderRadius: 28,
		elevation: 8,
		shadowColor: '#000',
		shadowOpacity: 0.3,
		shadowRadius: 4,
		shadowOffset: { width: 1, height: 2 },
	},
});

