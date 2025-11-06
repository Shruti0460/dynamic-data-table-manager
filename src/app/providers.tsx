"use client";
import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from '@/store/store';
import { getTheme } from '@/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { RootState } from '@/store/store';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = React.useMemo(() => getTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </Provider>
  );
}