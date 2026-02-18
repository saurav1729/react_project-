import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, CategoryState } from '../../types';
import api from '../../api/axios';

const initialState: CategoryState = {
    categories: [],
    isLoading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/categories');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch categories');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default categorySlice.reducer;
