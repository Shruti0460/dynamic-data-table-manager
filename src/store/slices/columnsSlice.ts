import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ColumnType = 'string' | 'number' | 'email' | 'text';

export interface ColumnDef {
  id: string;
  field: string;
  label: string;
  type: ColumnType;
  visible: boolean;
  order: number;
}

interface ColumnsState {
  columns: ColumnDef[];
}

const defaultColumns: ColumnDef[] = [
  { id: 'name', field: 'name', label: 'Name', type: 'string', visible: true, order: 0 },
  { id: 'email', field: 'email', label: 'Email', type: 'email', visible: true, order: 1 },
  { id: 'age', field: 'age', label: 'Age', type: 'number', visible: true, order: 2 },
  { id: 'role', field: 'role', label: 'Role', type: 'string', visible: true, order: 3 },
];

const initialState: ColumnsState = {
  columns: defaultColumns,
};

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    addColumn: (
      state,
      action: PayloadAction<{ field: string; label: string; type?: ColumnType }>
    ) => {
      const { field, label, type = 'string' } = action.payload;
      const exists = state.columns.some((c) => c.field.toLowerCase() === field.toLowerCase());
      if (exists) return;
      const order = state.columns.length;
      state.columns.push({
        id: field,
        field,
        label,
        type,
        visible: true,
        order,
      });
    },
    toggleVisibility: (state, action: PayloadAction<{ field: string; visible?: boolean }>) => {
      const { field, visible } = action.payload;
      const col = state.columns.find((c) => c.field === field);
      if (!col) return;
      col.visible = visible ?? !col.visible;
    },
    setVisibilityBulk: (
      state,
      action: PayloadAction<{ visibility: Record<string, boolean> }>
    ) => {
      const { visibility } = action.payload;
      state.columns.forEach((c) => {
        if (visibility[c.field] !== undefined) c.visible = visibility[c.field];
      });
    },
    reorderColumns: (
      state,
      action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const cols = [...state.columns].sort((a, b) => a.order - b.order);
      const [moved] = cols.splice(sourceIndex, 1);
      cols.splice(destinationIndex, 0, moved);
      state.columns = cols.map((c, idx) => ({ ...c, order: idx }));
    },
  },
});

export const { addColumn, toggleVisibility, setVisibilityBulk, reorderColumns } = columnsSlice.actions;
export default columnsSlice.reducer;