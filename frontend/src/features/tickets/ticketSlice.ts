import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Ticket, TicketState } from '../../types';
import api from '../../api/axios';

interface FetchTicketsParams {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
    categoryId?: string;
}

interface CreateTicketPayload {
    title: string;
    description: string;
    categoryId: string;
    priority: string;
    type: string;
    // Defaulted fields
    deviceType: string;
    operatingSystem: string;
    location: string;
}

const initialState: TicketState = {
    tickets: [],
    unassignedTickets: [],
    ticket: null,
    comments: [],
    history: [],
    isLoading: false,
    error: null,
    total: 0,
    stats: {
        total: 0,
        unassigned: 0,
        assigned: 0,
        completed: 0,
    },
    page: 1,
    limit: 10,
    unassignedTicketsPage: 1,
    unassignedTicketsTotal: 0,
    unassignedTicketsHasMore: true,
};

export const fetchMyTickets = createAsyncThunk(
    'tickets/fetchMyTickets',
    async (params: FetchTicketsParams, { rejectWithValue }) => {
        try {
            // Map 'search' to 'q' for backend API
            const queryParams: any = { ...params };
            if (queryParams.search) {
                queryParams.q = queryParams.search;
                delete queryParams.search;
            }
            const response = await api.get('/tickets/my', { params: queryParams });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch tickets');
        }
    }
);

export const fetchAgentAssignedTickets = createAsyncThunk(
    'tickets/fetchAgentAssignedTickets',
    async (params: FetchTicketsParams, { rejectWithValue }) => {
        try {
            const queryParams: any = { ...params };
            if (queryParams.search) {
                queryParams.q = queryParams.search;
                delete queryParams.search;
            }
            const response = await api.get('/tickets/assigned', { params: queryParams });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch assigned tickets');
        }
    }
);

export const createTicket = createAsyncThunk(
    'tickets/createTicket',
    async (payload: any, { rejectWithValue }) => {
        try {
            // Check if payload is FormData (contains files)
            const isFormData = payload instanceof FormData;
            // Let Axios/Browser handle Content-Type for FormData to include boundary
            const config = isFormData ? {
                headers: {
                    'Content-Type': undefined,
                    'Accept': 'application/json'
                }
            } : {};

            const response = await api.post('/tickets', payload, config);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to create ticket');
        }
    }
);

export const getTicketDetail = createAsyncThunk(
    'tickets/getTicketDetail',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/tickets/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch ticket details');
        }
    }
);

export const fetchComments = createAsyncThunk(
    'tickets/fetchComments',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/tickets/${ticketId}/comments`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch comments');
        }
    }
);

export const addComment = createAsyncThunk(
    'tickets/addComment',
    async (payload: { ticketId: string, content: string, isInternal: boolean, files?: File[] }, { rejectWithValue }) => {
        try {
            const { ticketId, content, isInternal, files } = payload;
            let bodyToSend = content;
            if ((!bodyToSend || !bodyToSend.trim()) && files && files.length > 0) {
                bodyToSend = "Attachment uploaded";
            }

            let data: any;
            let config = {};

            console.log('addComment payload:', { ticketId, hasContent: !!content, filesCount: files?.length });

            if (files && files.length > 0) {
                const formData = new FormData();
                formData.append('body', bodyToSend);
                formData.append('visibility', isInternal ? 'Internal' : 'Public');

                files.forEach((file) => {
                    formData.append('attachments', file);
                    console.log('Appending file:', file.name, file.size);
                });

                data = formData;
                // Important: Set Content-Type to undefined so browser sets boundary
                config = {
                    headers: {
                        'Content-Type': undefined,
                        'Accept': 'application/json'
                    }
                };
            } else {
                data = { body: bodyToSend, visibility: isInternal ? 'Internal' : 'Public' };
            }

            console.log('Sending data:', data instanceof FormData ? 'FormData' : 'JSON');
            const response = await api.post(`/tickets/${ticketId}/comments`, data, config);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to add comment');
        }
    }
);

export const fetchHistory = createAsyncThunk(
    'tickets/fetchHistory',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/tickets/${ticketId}/history`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch history');
        }
    }
);
export const fetchTicketStats = createAsyncThunk(
    'tickets/fetchTicketStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/tickets/stats');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch stats');
        }
    }
);

export const fetchAllTickets = createAsyncThunk(
    'tickets/fetchAllTickets',
    async (params: FetchTicketsParams, { rejectWithValue }) => {
        try {
            const queryParams: any = { ...params };
            if (queryParams.search) {
                queryParams.q = queryParams.search;
                delete queryParams.search;
            }
            const response = await api.get('/tickets/all/tickets', { params: queryParams });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch all tickets');
        }
    }
);

export const fetchUnassignedTickets = createAsyncThunk(
    'tickets/fetchUnassignedTickets',
    async (params: { page?: number, limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const queryParams = params || {};
            const response = await api.get('/tickets/unassigned', { params: queryParams });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch unassigned tickets');
        }
    }
);

export const claimTicket = createAsyncThunk(
    'tickets/claimTicket',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${ticketId}/claim`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to claim ticket');
        }
    }
);

export const startTicket = createAsyncThunk(
    'tickets/startTicket',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${ticketId}/start`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to start ticket');
        }
    }
);

export const unassignTicket = createAsyncThunk(
    'tickets/unassignTicket',
    async (payload: { ticketId: string, reason?: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${payload.ticketId}/unassign`, { reason: payload.reason });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to unassign ticket');
        }
    }
);

export const completeTicket = createAsyncThunk(
    'tickets/completeTicket',
    async (payload: { ticketId: string, resolutionSummary: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${payload.ticketId}/complete`, { resolutionSummary: payload.resolutionSummary });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to complete ticket');
        }
    }
);

export const rejectTicket = createAsyncThunk(
    'tickets/rejectTicket',
    async (payload: { ticketId: string, reason?: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${payload.ticketId}/reject`, { reason: payload.reason });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to reject ticket');
        }
    }
);

export const reopenTicket = createAsyncThunk(
    'tickets/reopenTicket',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${ticketId}/reopen`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to reopen ticket');
        }
    }
);

const ticketSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        clearTicketError: (state) => {
            state.error = null;
        },
        resetTicketState: (state) => {
            state.ticket = null;
            state.error = null;
            state.tickets = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Tickets
            .addCase(fetchMyTickets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyTickets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tickets = action.payload.data;
                state.total = action.payload.meta?.total || 0;
                state.page = action.payload.meta?.page || 1;
            })
            .addCase(fetchMyTickets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Agent Assigned Tickets
            .addCase(fetchAgentAssignedTickets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAgentAssignedTickets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tickets = action.payload.data;
                state.total = action.payload.meta?.total || 0;
                state.page = action.payload.meta?.page || 1;
            })
            .addCase(fetchAgentAssignedTickets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Ticket
            .addCase(createTicket.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createTicket.fulfilled, (state, action) => {
                state.isLoading = false;
                // Optionally add to list or let caller handle refresh
                state.tickets.unshift(action.payload);
            })
            .addCase(createTicket.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Ticket Detail
            .addCase(getTicketDetail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.ticket = null;
            })
            .addCase(getTicketDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.ticket = action.payload;
            })
            .addCase(getTicketDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Comments
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.comments = action.payload;
            })
            // Add Comment
            .addCase(addComment.fulfilled, (state, action) => {
                state.comments.push(action.payload);
            })
            // Fetch History
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.history = action.payload;
            })
            // Fetch Stats
            .addCase(fetchTicketStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Fetch All Tickets (Agent/Admin)
            .addCase(fetchAllTickets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllTickets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tickets = action.payload.data;
                state.total = action.payload.meta?.total || 0;
                state.page = action.payload.meta?.page || 1;
            })
            .addCase(fetchAllTickets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Unassigned Tickets (Agent)
            .addCase(fetchUnassignedTickets.fulfilled, (state, action) => {
                const newTickets = action.payload.data;
                const page = action.payload.meta?.page || 1;

                if (page === 1) {
                    state.unassignedTickets = newTickets;
                } else {
                    // Filter out duplicates if any (though backend pagination shouldn't produce them if stable)
                    const existingIds = new Set(state.unassignedTickets.map(t => t._id));
                    const uniqueNewTickets = newTickets.filter((t: any) => !existingIds.has(t._id));
                    state.unassignedTickets = [...state.unassignedTickets, ...uniqueNewTickets];
                }

                state.unassignedTicketsTotal = action.payload.meta?.total || 0;
                state.unassignedTicketsPage = page;
                // Determine if has more
                state.unassignedTicketsHasMore = state.unassignedTickets.length < state.unassignedTicketsTotal;
            })
            // Agent Actions (updates specific ticket in list if present, or refreshes)
            .addCase(claimTicket.fulfilled, (state, action) => {
                // Remove from unassigned
                state.unassignedTickets = state.unassignedTickets.filter(t => t._id !== action.payload._id);
                // Add to tickets if viewing 'Assigned' or 'All'? 
                // Easier to just update the ticket if it's in the list
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                if (state.ticket?._id === action.payload._id) state.ticket = action.payload;
            })
            .addCase(startTicket.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                if (state.ticket?._id === action.payload._id) state.ticket = action.payload;
            })
            .addCase(unassignTicket.fulfilled, (state, action) => {
                // Add back to unassigned? Maybe.
                // Remove from assigned list if that's what we are viewing?
                // For now just update the ticket object
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                if (state.ticket?._id === action.payload._id) state.ticket = action.payload;
            })
            .addCase(completeTicket.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                if (state.ticket?._id === action.payload._id) state.ticket = action.payload;
            })
            .addCase(rejectTicket.fulfilled, (state, action) => {
                // logic for rejection (remove from unassigned)
                // Rejection might return a Decision object, not the Ticket.
                // So we might need to filter by ID if we passed it in meta, or if backend returns ticket info.
                // Backend 'reject' returns decision doc.
                // So we can't easily update ticket object unless we know the ID from action.meta.arg
                const ticketId = action.meta.arg.ticketId;
                state.unassignedTickets = state.unassignedTickets.filter(t => t._id !== ticketId);
            })
            .addCase(reopenTicket.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                if (state.ticket?._id === action.payload._id) state.ticket = action.payload;
            });
    },
});

export const { clearTicketError, resetTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
