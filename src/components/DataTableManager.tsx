"use client";
import React from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { addRows, deleteRow, updateRow } from '@/store/slices/dataSlice';
import { addColumn } from '@/store/slices/columnsSlice';
import ManageColumnsModal from './ManageColumnsModal';
import ThemeToggle from './ThemeToggle';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

type Order = 'asc' | 'desc';

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getComparator(order: Order, orderBy: string) {
  return order === 'desc'
    ? (a: any, b: any) => (b[orderBy] ?? '').toString().localeCompare((a[orderBy] ?? '').toString(), undefined, { numeric: true })
    : (a: any, b: any) => (a[orderBy] ?? '').toString().localeCompare((b[orderBy] ?? '').toString(), undefined, { numeric: true });
}

export default function DataTableManager() {
  const dispatch = useDispatch();
  const columns = useSelector((state: RootState) => [...state.columns.columns].sort((a, b) => a.order - b.order));
  const rows = useSelector((state: RootState) => state.data.rows);
  const visibleColumns = columns.filter((c) => c.visible);
  const [search, setSearch] = React.useState('');
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(visibleColumns[0]?.field ?? 'name');
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;
  const [manageOpen, setManageOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '' });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [pendingEdits, setPendingEdits] = React.useState<Record<number, Record<string, any>>>({});
  const [confirmDelete, setConfirmDelete] = React.useState<{ open: boolean; id?: number }>({ open: false });

  const filteredRows = React.useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      visibleColumns.some((c) => (r[c.field] ?? '').toString().toLowerCase().includes(q))
    );
  }, [rows, search, visibleColumns]);

  const sortedRows = React.useMemo(() => {
    return stableSort(filteredRows, getComparator(order, orderBy));
  }, [filteredRows, order, orderBy]);

  const pagedRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page]);

  const handleRequestSort = (field: string) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  const onDoubleClickCell = (id: number, field: string, value: any) => {
    if (!editMode) return;
    setPendingEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const onChangeEdit = (id: number, field: string, value: any) => {
    setPendingEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const saveAll = () => {
    Object.entries(pendingEdits).forEach(([idStr, changes]) => {
      const id = Number(idStr);
      if ('age' in changes) {
        const n = Number(changes['age']);
        if (Number.isNaN(n)) {
          setSnackbar({ open: true, message: 'Age must be a number', severity: 'error' });
          return;
        }
        changes['age'] = n;
      }
      dispatch(updateRow({ id, changes }));
    });
    setPendingEdits({});
    setSnackbar({ open: true, message: 'All changes saved', severity: 'success' });
  };

  const cancelAll = () => {
    setPendingEdits({});
  };

  const startImport = () => fileInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const { data, errors, meta } = results as any;
        if (errors && errors.length) {
          setSnackbar({ open: true, message: `Import errors: ${errors[0].message}`, severity: 'error' });
          return;
        }
        const rowsToAdd = (data as any[])
          .filter((r) => Object.keys(r).length > 0)
          .map((r) => {
            const row: any = { ...r };
            if (row.age !== undefined) row.age = Number(row.age);
            return row;
          });

        // Add any new columns discovered in CSV header
        const csvFields: string[] = meta?.fields || [];
        csvFields.forEach((f: string) => {
          if (!columns.find((c) => c.field === f)) {
            const sample = rowsToAdd[0]?.[f];
            const type = typeof sample === 'number' ? 'number' : f.toLowerCase().includes('email') ? 'email' : 'string';
            const label = f[0]?.toUpperCase() + f.slice(1);
            dispatch(addColumn({ field: f, label, type }));
          }
        });

        dispatch(addRows(rowsToAdd));
        setSnackbar({ open: true, message: `Imported ${rowsToAdd.length} rows`, severity: 'success' });
        e.target.value = '';
      },
      error: (err) => {
        setSnackbar({ open: true, message: `Import failed: ${err.message}`, severity: 'error' });
      },
    });
  };

  const exportCsv = () => {
    const fields = visibleColumns.map((c) => c.field);
    const data = rows.map((r) => {
      const obj: Record<string, any> = {};
      fields.forEach((f) => (obj[f] = r[f] ?? ''));
      return obj;
    });
    const csv = Papa.unparse(data, { columns: fields });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'table_export.csv');
  };

  const confirmDeleteRow = (id: number) => setConfirmDelete({ open: true, id });
  const performDelete = () => {
    if (confirmDelete.id != null) {
      dispatch(deleteRow(confirmDelete.id));
      setSnackbar({ open: true, message: 'Row deleted', severity: 'success' });
    }
    setConfirmDelete({ open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Dynamic Data Table Manager</Typography>
        <ThemeToggle />
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <SearchIcon />
            <TextField size="small" placeholder="Search all fields" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
          </Box>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button startIcon={<SettingsIcon />} variant="outlined" onClick={() => setManageOpen(true)}>Manage Columns</Button>
            <Button startIcon={<UploadIcon />} variant="outlined" onClick={startImport}>Import CSV</Button>
            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportFile} />
            <Button startIcon={<DownloadIcon />} variant="outlined" onClick={exportCsv}>Export CSV</Button>
            <Button startIcon={<SortIcon />} variant="outlined" onClick={() => handleRequestSort(orderBy)}>
              Sort: {orderBy} ({order})
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<EditIcon />} variant={editMode ? 'contained' : 'outlined'} onClick={() => setEditMode((v) => !v)}>
              {editMode ? 'Editing' : 'Edit Mode'}
            </Button>
            {editMode && (
              <>
                <Button startIcon={<SaveIcon />} color="success" variant="contained" onClick={saveAll}>Save All</Button>
                <Button startIcon={<CancelIcon />} color="inherit" variant="outlined" onClick={cancelAll}>Cancel All</Button>
              </>
            )}
          </Stack>
          <TablePagination
            component="div"
            count={sortedRows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {visibleColumns.map((c) => (
                  <TableCell key={c.field} onClick={() => handleRequestSort(c.field)} sx={{ cursor: 'pointer' }}>
                    <strong>{c.label}</strong>{orderBy === c.field ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.map((row) => (
                <TableRow key={row.id} hover>
                  {visibleColumns.map((c) => {
                    const displayValue = pendingEdits[row.id]?.[c.field] ?? row[c.field] ?? '';
                    const isEditing = editMode;
                    return (
                      <TableCell key={`${row.id}-${c.field}`} onDoubleClick={() => onDoubleClickCell(row.id, c.field, row[c.field])}>
                        {isEditing ? (
                          <TextField
                            value={displayValue}
                            onChange={(e) => onChangeEdit(row.id, c.field, c.type === 'number' ? e.target.value.replace(/[^0-9.-]/g, '') : e.target.value)}
                            size="small"
                            fullWidth
                          />
                        ) : (
                          <span>{displayValue}</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Tooltip title="Delete row">
                      <IconButton onClick={() => confirmDeleteRow(row.id)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ManageColumnsModal open={manageOpen} onClose={() => setManageOpen(false)} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />

      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })}>
        <DialogTitle>Delete row?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this row?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={performDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}