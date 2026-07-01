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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { dir, lang } = useLang();

  const theme = createTheme({
    direction: dir,
    palette: {
      primary: { main: '#1a237e' },
      secondary: { main: '#ff6f00' },
      background: { default: '#f5f5f5' },
    },
    typography: {
      fontFamily: lang === 'ar'
        ? '"Cairo", "Roboto", "Arial", sans-serif'
        : '"Inter", "Roboto", "Arial", sans-serif',
    },
    components: {
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
      },
      MuiButton: {
        defaultProps: { size: 'small' },
      },
      MuiCard: {
        defaultProps: { elevation: 1 },
      },
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
