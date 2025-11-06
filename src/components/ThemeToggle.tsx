"use client";
import { Switch, FormControlLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/slices/themeSlice';
import type { RootState } from '@/store/store';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  return (
    <FormControlLabel
      control={
        <Switch
          checked={mode === 'dark'}
          onChange={() => dispatch(toggleTheme())}
          color="primary"
        />
      }
      label={mode === 'dark' ? 'Dark' : 'Light'}
    />
  );
}