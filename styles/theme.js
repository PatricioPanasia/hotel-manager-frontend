export const COLORS = {
  background: '#F9FAFB',
  primary: '#1E3A8A',
  secondary: '#64748B',
  accent: '#38BDF8',
  warning: '#f59e0b',
  google: '#db4437',
  error: '#EF4444',
  success: '#10B981',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  card: '#FFFFFF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  placeholder: '#9CA3AF',
};



export const FONT_SIZES = {
  h1: 30,
  h2: 22,
  body: 16,
  caption: 13,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDERS = {
  radius: 8,
  cardRadius: 12,
  borderWidth: 1,
};

export const SHADOWS = {
  card: {
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5, // for Android
  },
  inputFocus: {
    shadowColor: 'rgba(30,58,138,0.15)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5, // for Android
  },
};

const theme = {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDERS,
  SHADOWS,
};

export default theme;
