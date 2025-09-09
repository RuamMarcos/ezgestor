/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * 
 * IMPORTANT: Note that the colors for the dark mode are defined in the same way as the light mode.
 * This means that if you change the color in the light mode, it will also change in the dark mode.
 * To avoid this, you can define the colors for the dark mode in the dark object.
 */

const tintColorLight = '#4f46e5'; 
const tintColorDark = '#fff';  

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    card: '#FFFFFF',
    inputBackground: '#F9FAFB',
    button: '#4f46e5',
    buttonText: '#FFFFFF',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#374151',
    card: '#1F2937',
    inputBackground: '#111827',
    button: '#4f46e5',
    buttonText: '#FFFFFF',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
};

export default Colors;