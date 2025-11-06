import { createTheme } from '@mui/material/styles';
import { ThemeMode } from '@/store/slices/themeSlice';

export const getTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#9c27b0' : '#ce93d8',
      },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '8px 12px',
          },
        },
      },
    },
  });