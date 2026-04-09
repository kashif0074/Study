// utils/responsive.js
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
// (iPhone 11 / Pro / 12 / 13 / 14 Pro ~ 375-390 width)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

const scale = (size) => (width / GUIDELINE_BASE_WIDTH) * size;
const verticalScale = (size) => (height / GUIDELINE_BASE_HEIGHT) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const isTablet = width >= 768; // Simple breakpoint for tablet

export { scale, verticalScale, moderateScale, isTablet, width, height };
