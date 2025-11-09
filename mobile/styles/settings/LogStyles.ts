import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/context/ThemeContext";

export const createLogStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.darkText,
    },
    listContainer: {
      flex: 1,
    },
    listContentContainer: {
      padding: 16,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    errorText: {
      fontSize: 16,
      color: "#EF4444",
    },
    emptyText: {
      fontSize: 16,
      color: colors.grayText,
    },
    footerLoading: {
      paddingVertical: 20,
    },
    logItemContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.border : "transparent",
    },
    logDescription: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.darkText,
      marginBottom: 8,
    },
    logMetaContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    logMetaText: {
      fontSize: 14,
      color: colors.grayText,
    },
    logTimestamp: {
      fontSize: 12,
      color: colors.grayText,
      textAlign: "right",
    },
    filterContainer: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? colors.border : "transparent",
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.darkText,
      marginBottom: 8,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: isDark ? colors.lightGray : "#f9f9f9",
    },
    picker: {
      width: "100%",
      height: 50,
      color: colors.darkText,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    button: {
      flex: 1,
      marginHorizontal: 4,
    },
  });
