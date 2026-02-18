import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchMyTickets, fetchTicketStats } from '../features/tickets/ticketSlice';
import { fetchCategories } from '../features/categories/categorySlice';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import CreateTicketModal from '../components/CreateTicketModal';
import Header from '../components/Header';
import FilterDropdown from '../components/ui/FilterDropdown';
import TicketTable from '../components/TicketTable';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { tickets, isLoading, total, stats } = useSelector((state: RootState) => state.tickets);
    const { categories } = useSelector((state: RootState) => state.categories);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'All' | 'Unassigned' | 'Assigned' | 'Completed'>('All');
    const [search, setSearch] = useState('');

    // Filters State
    const [filters, setFilters] = useState({
        type: '',
        priority: '',
        status: '',
        categoryId: ''
    });

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTicketStats());
    }, [dispatch]);

    useEffect(() => {
        // Map Tabs to API filters (Tabs override status filter if activeTab is not 'All')
        let statusParam: string | undefined = filters.status || undefined;

        if (activeTab === 'Unassigned') {
            statusParam = 'Created'; // or logic for unassigned
        } else if (activeTab === 'Assigned') {
            statusParam = 'Assigned'; // Note: backend might need to handle 'Started' too if strict
        } else if (activeTab === 'Completed') {
            statusParam = 'Completed';
        }

        dispatch(fetchMyTickets({
            // search: search || undefined, // REMOVED for frontend search
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


    // Tabs configuration
    const tabs = [
        { name: 'All', count: stats?.total || 0, icon: '🎫' },
        { name: 'Unassigned', count: stats?.unassigned || 0, icon: '⚠️' },
        { name: 'Assigned', count: stats?.assigned || 0, icon: '👤' },
        { name: 'Completed', count: stats?.completed || 0, icon: '✅' },
    ];

    // console.log(stats);
    // console.log(tickets);

    return (
        <div className="min-h-screen p-6 relative ">
            {/* Top Navigation Bar */}
            <Header className="mb-10" />

            {/* Main Content Area */}
            <GlassCard className="max-w-7xl mx-auto p-12">
                {/* Welcome & Action Area */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {user?.firstName}!</h1>
                        <p className="text-gray-500">Here's an overview of your support tickets</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 px-6 py-2.5">
                        Create Ticket
                    </Button>
                </div>

                {/* Filters & Search Row */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name as any)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                                    ${activeTab === tab.name
                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}
                                `}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="w-full md:w-80 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-400 text-gray-700 shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <TicketTable
                    tickets={filteredTickets}
                    isLoading={isLoading}
                    filters={filters}
                    onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                    onClearFilter={(key) => setFilters(prev => ({ ...prev, [key]: '' }))}
                    role="Requester"
                    categories={categories}
                    pagination={{
                        page: 1, // You might want to wire this up to Redux state later
                        total: total,
                        limit: 10,
                        onPageChange: (page) => console.log('Page change', page) // Implement real pagination later
                    }}
                    error={useSelector((state: RootState) => state.tickets.error)}
                />
            </GlassCard>

            {/* Create Ticket Modal */}
            <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
};

export default Dashboard;
