import { createTheme } from '@shopify/restyle';

const palette = {
  purpleLight: '#8C6FF7',
  purplePrimary: '#5A31F4',
  purpleDark: '#3A227E',

  greenLight: '#035A6E',
  greenPrimary: '#035A6E',
  greenDark: '#035A6E',

  black: '#0B0B0B',
  white: '#FFFFFF',
};

const theme = createTheme({
  colors: {
    // Palette colors
    white: palette.white,
    black: palette.black,
    purpleLight: palette.purpleLight,
    purplePrimary: palette.purplePrimary,
    purpleDark: palette.purpleDark,
    greenLight: palette.greenLight,
    greenPrimary: palette.greenPrimary,
    greenDark: palette.greenDark,
    
    // Theme-specific colors
    mainBackground: palette.white,
    cardPrimaryBackground: palette.purplePrimary,
    primary: '#002043',
    secondary: '#6C757D',
    success: '#035A6E',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
    light: '#F8F9FA',
    dark: '#343A40',
    text: palette.black,
    buttonPrimary: '#002043',
    buttonSecondary: '#6C757D',
    textPrimary: '#002043',
    textGray: '#666666',
    textDark: '#425466',
    infoPrimary: '#002043',
    textTitle: '#035A6E',
    textSecondary: palette.white,
  },
  spacing: {
    none: 0,
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  textVariants: {
    header: {
      fontWeight: 'bold',
      fontSize: 34,
    },
    subheader: {
      fontWeight: '400',
      fontSize: 30,
      fontFamily: 'Asap',
    },
    routeTitle: {
      fontWeight: '700',
      fontSize: 24,
      fontFamily: 'Asap',
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: 19,
      color: 'textPrimary',
      fontFamily: 'Asap',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    button: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    defaults: {},
  },
});

export type Theme = typeof theme;
export default theme;


