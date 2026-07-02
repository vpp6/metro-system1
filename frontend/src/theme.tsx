import React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CssBaseline } from '@mui/material';
import { useLang } from './context/LanguageContext';

function RTLProvider({ children, dir }: { children: React.ReactNode; dir: 'rtl' | 'ltr' }) {
  if (dir === 'ltr') return <>{children}</>;
  const cache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

const commonTheme = {
  shape: { borderRadius: 12 },
  palette: {
    primary: { main: '#0f2b5e', light: '#1a3f7a', dark: '#091a3a' },
    secondary: { main: '#d4a11e', light: '#e8b82e', dark: '#b08210' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  typography: {
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s',
            '&:hover': { '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0f2b5e' } },
            '&.Mui-focused': { '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2 } },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          transition: 'all 0.2s',
        },
        contained: {
          background: 'linear-gradient(135deg, #0f2b5e 0%, #1a3f7a 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #091a3a 0%, #0f2b5e 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(15,43,94,0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': { borderWidth: 2, transform: 'translateY(-1px)' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#f8f9fc',
            color: '#0f2b5e',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s',
          '&:hover': { backgroundColor: '#f8faff' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '12px 16px' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
      },
    },
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { dir, lang } = useLang();

  const theme = createTheme({
    ...commonTheme,
    direction: dir,
    typography: {
      ...commonTheme.typography,
      fontFamily: lang === 'ar'
        ? '"Cairo", "Roboto", "Arial", sans-serif'
        : '"Inter", "Roboto", "Arial", sans-serif',
    },
  });

  return (
    <RTLProvider dir={dir}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </RTLProvider>
  );
}
