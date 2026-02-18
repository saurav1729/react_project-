import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import ticketReducer from './features/tickets/ticketSlice';
import categoryReducer from './features/categories/categorySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tickets: ticketReducer,
        categories: categoryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
