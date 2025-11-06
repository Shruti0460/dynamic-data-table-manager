import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import themeReducer from './slices/themeSlice';
import columnsReducer from './slices/columnsSlice';
import dataReducer from './slices/dataSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  columns: columnsReducer,
  data: dataReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'columns'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;