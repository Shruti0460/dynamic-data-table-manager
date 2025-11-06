import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DataRow {
  id: number;
  [key: string]: any;
}

interface DataState {
  rows: DataRow[];
  nextId: number;
}

const sampleRows: DataRow[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 29, role: 'Engineer' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, role: 'Manager' },
  { id: 3, name: 'Charlie Lee', email: 'charlie@example.com', age: 22, role: 'Intern' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 31, role: 'Designer' },
  { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', age: 40, role: 'Lead' },
  { id: 6, name: 'Fiona Gallagher', email: 'fiona@example.com', age: 27, role: 'Engineer' },
  { id: 7, name: 'George Miller', email: 'george@example.com', age: 36, role: 'Manager' },
  { id: 8, name: 'Hannah Brown', email: 'hannah@example.com', age: 24, role: 'QA' },
  { id: 9, name: 'Ian Wright', email: 'ian@example.com', age: 33, role: 'Engineer' },
  { id: 10, name: 'Julia Roberts', email: 'julia@example.com', age: 28, role: 'Designer' },
  { id: 11, name: 'Kevin Hart', email: 'kevin@example.com', age: 38, role: 'Manager' },
  { id: 12, name: 'Laura Palmer', email: 'laura@example.com', age: 26, role: 'Engineer' },
  { id: 13, name: 'Mike Tyson', email: 'mike@example.com', age: 35, role: 'Lead' },
  { id: 14, name: 'Nina Dobrev', email: 'nina@example.com', age: 30, role: 'Designer' },
  { id: 15, name: 'Oscar Isaac', email: 'oscar@example.com', age: 37, role: 'Manager' },
  { id: 16, name: 'Pam Beesly', email: 'pam@example.com', age: 29, role: 'Admin' },
  { id: 17, name: 'Quentin Tarantino', email: 'quentin@example.com', age: 45, role: 'Director' },
  { id: 18, name: 'Rachel Green', email: 'rachel@example.com', age: 27, role: 'Support' },
  { id: 19, name: 'Sam Wilson', email: 'sam@example.com', age: 32, role: 'Engineer' },
  { id: 20, name: 'Tina Fey', email: 'tina@example.com', age: 39, role: 'Manager' },
];

const initialState: DataState = {
  rows: sampleRows,
  nextId: sampleRows.length + 1,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setRows(state, action: PayloadAction<DataRow[]>) {
      state.rows = action.payload.map((r) => ({ ...r, id: r.id ?? state.nextId++ }));
    },
    addRows(state, action: PayloadAction<DataRow[]>) {
      action.payload.forEach((r) => {
        const id = r.id ?? state.nextId++;
        state.rows.push({ ...r, id });
      });
    },
    updateCell(
      state,
      action: PayloadAction<{ id: number; field: string; value: any }>
    ) {
      const { id, field, value } = action.payload;
      const row = state.rows.find((r) => r.id === id);
      if (row) row[field] = value;
    },
    updateRow(state, action: PayloadAction<{ id: number; changes: Record<string, any> }>) {
      const { id, changes } = action.payload;
      const idx = state.rows.findIndex((r) => r.id === id);
      if (idx !== -1) state.rows[idx] = { ...state.rows[idx], ...changes };
    },
    deleteRow(state, action: PayloadAction<number>) {
      state.rows = state.rows.filter((r) => r.id !== action.payload);
    },
    clearRows(state) {
      state.rows = [];
      state.nextId = 1;
    },
  },
});

export const { setRows, addRows, updateCell, updateRow, deleteRow, clearRows } = dataSlice.actions;
export default dataSlice.reducer;