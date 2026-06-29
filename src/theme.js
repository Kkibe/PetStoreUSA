import { theme } from 'antd';

export const themeConfig = {
  token: {
    colorPrimary: '#2D6A4F',
    colorSecondary: '#D4A373',
    colorAccent: '#B7E4C7',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#2D6A4F',
    borderRadius: 10,
    fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 15,
    colorBgLayout: '#FAFBF9',
    colorText: '#1A2E25',
    colorTextSecondary: '#5A6B62',
    wireframe: false,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 14,
      boxShadowTertiary: '0 4px 20px rgba(45, 106, 79, 0.06)',
    },
    Menu: {
      itemColor: '#1A2E25',
      itemSelectedColor: '#2D6A4F',
      itemSelectedBg: 'rgba(45, 106, 79, 0.08)',
      horizontalItemSelectedColor: '#2D6A4F',
    },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
    Drawer: { borderRadiusLG: 14 },
    Tag: { borderRadiusSM: 6 },
  },
  algorithm: theme.defaultAlgorithm,
};

export const colors = {
  primary: '#2D6A4F',
  primaryDark: '#1B4332',
  primaryLight: '#B7E4C7',
  secondary: '#D4A373',
  secondaryLight: '#FAEDCD',
  bg: '#FAFBF9',
  surface: '#FFFFFF',
  text: '#1A2E25',
  textSecondary: '#5A6B62',
  border: '#E8EDE9',
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
};
