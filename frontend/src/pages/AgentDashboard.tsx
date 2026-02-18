import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchMyTickets, fetchUnassignedTickets, claimTicket, rejectTicket, fetchTicketStats, fetchAllTickets } from '../features/tickets/ticketSlice';
import { fetchCategories } from '../features/categories/categorySlice';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import FilterDropdown from '../components/ui/FilterDropdown';
import TicketTable from '../components/TicketTable';
import { Ticket } from '../types';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import TicketCard from '../components/TicketCard';

const AgentDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const {
        tickets,
        unassignedTickets,
        isLoading,
        total,
        unassignedTicketsPage,
        unassignedTicketsTotal,
        unassignedTicketsHasMore
    } = useSelector((state: RootState) => state.tickets);
    const { categories } = useSelector((state: RootState) => state.categories);

    // Filters State for "All Support Tickets"
    const [activeTab, setActiveTab] = useState<'All' | 'Assigned' | 'Started' | 'Completed'>('All');
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
        // Fetch first 2 unassigned tickets
        dispatch(fetchUnassignedTickets({ page: 1, limit: 2 }));
    }, [dispatch]);

    useEffect(() => {
        let statusParam: string | undefined = filters.status || undefined;
        if (activeTab === 'Assigned') statusParam = 'Assigned';
        if (activeTab === 'Started') statusParam = 'Started';
        if (activeTab === 'Completed') statusParam = 'Completed';

        dispatch(fetchAllTickets({
            // search: search || undefined, // REMOVED for local search
            status: statusParam,
            type: filters.type || undefined,
            priority: filters.priority || undefined,
            categoryId: filters.categoryId || undefined,
            limit: 100,
        }));
    }, [dispatch, activeTab, filters]); // Removed search dependency

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

    const handleClaim = async (ticketId: string) => {
        try {
            await dispatch(claimTicket(ticketId)).unwrap();
            toast.success('Ticket claimed successfully');
            // Refresh unassigned - reset to page 1
            dispatch(fetchUnassignedTickets({ page: 1, limit: 2 }));
            dispatch(fetchAllTickets({}));
        } catch (err: any) {
            toast.error(err);
        }
    };

    const handleReject = async (ticketId: string) => {
        if (window.confirm('Are you sure you want to reject this ticket?')) {
            try {
                await dispatch(rejectTicket({ ticketId })).unwrap();
                toast.success('Ticket rejected');
                // Refresh unassigned
                dispatch(fetchUnassignedTickets({ page: 1, limit: 2 }));
            } catch (err: any) {
                toast.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen p-6 relative bg-gray-50/50">
            <Header className="mb-10" />

            <div className="max-w-7xl mx-auto space-y-10">
                {/* Section 1: Claim Unassigned Tickets (Vertical Infinite Scroll) */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Claim unassigned tickets</h2>
                            {unassignedTicketsTotal > 2 && (
                                <Link
                                    to="/agent/unassigned-tickets"
                                    className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline"
                                >
                                    View All
                                </Link>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {unassignedTickets.length} of {unassignedTicketsTotal}
                        </div>
                    </div>

                    {unassignedTickets.length === 0 && !isLoading ? (
                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500">No unassigned tickets found. Great job! 🎉</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                            {unassignedTickets.map(ticket => (
                                <TicketCard
                                    key={ticket._id}
                                    ticket={ticket}
                                    onClaim={handleClaim}
                                    onReject={handleReject}
                                    currentUserId={user?._id}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Section 2: All Support Tickets */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">All Support Tickets</h2>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        {/* Tabs */}
                        <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-sm">
                            {['All', 'Assigned', 'Started', 'Completed'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {tab === 'Completed' && <span className="text-green-500">✓</span>}
                                        {tab === 'Started' && <span className="text-blue-500">▶</span>}
                                        <span>{tab}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="w-full md:w-80 relative">
                            <input
                                type="text"
                                placeholder="Type to search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
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
                            page: 1, // Wire up real pagination later if needed for All Tickets
                            total: total,
                            limit: 10,
                            onPageChange: (page) => console.log('Page change', page)
                        }}
                    />
                </section>
            </div>
        </div>
    );
};

export default AgentDashboard;
