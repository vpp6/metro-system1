import React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CssBaseline } from '@mui/material';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#ff6f00' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Cairo", "Roboto", "Arial", sans-serif',
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={rtlCache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
