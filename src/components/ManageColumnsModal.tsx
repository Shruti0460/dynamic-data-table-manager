"use client";
import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Checkbox,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addColumn, reorderColumns, toggleVisibility } from '@/store/slices/columnsSlice';
import type { RootState } from '@/store/store';
import { useForm, Controller } from 'react-hook-form';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type FormValues = {
  label: string;
  field: string;
  type: 'string' | 'number' | 'email' | 'text';
};

export default function ManageColumnsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useDispatch();
  const columns = useSelector((state: RootState) =>
    [...state.columns.columns].sort((a, b) => a.order - b.order)
  );

  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: { label: '', field: '', type: 'string' },
  });

  const onSubmit = (data: FormValues) => {
    if (!data.field || !data.label) return;
    dispatch(addColumn({ field: data.field.trim(), label: data.label.trim(), type: data.type }));
    reset();
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= columns.length) return;
    dispatch(reorderColumns({ sourceIndex: from, destinationIndex: to }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Columns</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={2}>
              <Controller
                name="label"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Label" fullWidth />}
              />
              <Controller
                name="field"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <TextField {...field} label="Field" fullWidth />}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Type" select fullWidth>
                    <MenuItem value="string">String</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                  </TextField>
                )}
              />
            </Stack>
            <Box mt={1}>
              <Button variant="contained" onClick={handleSubmit(onSubmit)}>Add Column</Button>
            </Box>
          </Box>
          <Divider />
          <Stack spacing={1}>
            {columns.map((col, idx) => (
              <Stack key={col.id} direction="row" alignItems="center" spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={col.visible}
                      onChange={() => dispatch(toggleVisibility({ field: col.field }))}
                    />
                  }
                  label={`${col.label} (${col.field})`}
                />
                <Tooltip title="Move up">
                  <span>
                    <IconButton size="small" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>
                      <ArrowUpwardIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton size="small" onClick={() => move(idx, idx + 1)} disabled={idx === columns.length - 1}>
                      <ArrowDownwardIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}