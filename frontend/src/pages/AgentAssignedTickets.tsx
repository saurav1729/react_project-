import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchAgentAssignedTickets, fetchTicketStats } from '../features/tickets/ticketSlice'; // Stats for header context
import { fetchCategories } from '../features/categories/categorySlice';
import GlassCard from '../components/ui/GlassCard';
import Header from '../components/Header';
import TicketTable from '../components/TicketTable';
import { Link } from 'react-router-dom';

const AgentAssignedTickets: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        tickets,
        isLoading,
        total,
        page,
        stats,
        error
    } = useSelector((state: RootState) => state.tickets);
    const { categories } = useSelector((state: RootState) => state.categories);

    // Filters State for "My Support Tickets"
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        priority: '',
        status: '',
        categoryId: ''
    });

    // Initial Fetch
    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTicketStats());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchAgentAssignedTickets({
            // search: search || undefined, // REMOVED for frontend search
            status: filters.status || undefined,
            type: filters.type || undefined,
            priority: filters.priority || undefined,
            categoryId: filters.categoryId || undefined,
            page: 1,
            limit: 100,
        }));
    }, [dispatch, filters]); // Removed search dependency

    // Frontend Filtering
    const filteredTickets = React.useMemo(() => {
        if (!search.trim()) return tickets;
        const lowerSearch = search.toLowerCase();
        return tickets.filter(ticket =>
            (ticket.title && ticket.title.toLowerCase().includes(lowerSearch)) ||
            (ticket.description && ticket.description.toLowerCase().includes(lowerSearch)) ||
            (ticket.displayId && ticket.displayId.toLowerCase().includes(lowerSearch))
        );
    }, [tickets, search]);

    return (
        <div className="min-h-screen p-6 relative bg-gray-50/50">
            <Header className="mb-10" />

            <div className="max-w-7xl mx-auto space-y-10">
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🎫</span> My Support Tickets (Assigned to Me)
                        </h2>

                        {/* Search */}
                        <div className="w-full md:w-80 relative">
                            <input
                                type="text"
                                placeholder="Search my tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>

                    {/* Stats Summary for Agent (Optional context) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Assigned To Me</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.assigned}</p>
                        </div>
                        {/* We could show other stats but 'Assigned' is most relevant here unless we filter stats */}
                    </div>

                    {/* Table */}
                    <TicketTable
                        tickets={filteredTickets}
                        isLoading={isLoading}
                        filters={filters}
                        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                        onClearFilter={(key) => setFilters(prev => ({ ...prev, [key]: '' }))}
                        role="Agent"
                        categories={categories}
                        pagination={{
                            page: page,
                            total: total,
                            limit: 10,
                            onPageChange: (newPage) => {
                                // Implement pagination dispatch if needed
                                // Currently fetchAgentAssignedTickets doesn't take page in the thunk call in this component
                                // But the slice supports it. Ideally we pass page to the fetch effect or handler.
                                // For now, simple effect re-fetch is enough if we add page state.
                                console.log('Page change requested', newPage);
                            }
                        }}
                        error={error}
                    />
                </section>
            </div>
        </div>
    );
};

export default AgentAssignedTickets;
