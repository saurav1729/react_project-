import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUnassignedTickets, claimTicket, rejectTicket } from '../features/tickets/ticketSlice';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AgentUnassignedTickets: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        unassignedTickets,
        isLoading,
        unassignedTicketsPage,
        unassignedTicketsTotal,
        unassignedTicketsHasMore
    } = useSelector((state: RootState) => state.tickets);

    // Initial Fetch (reset to page 1)
    useEffect(() => {
        // We probably want to reset or just load first page if empty?
        // Actually best to always start fresh or ensure we have data.
        // Let's force fetch page 1 on mount to ensure freshness
        dispatch(fetchUnassignedTickets({ page: 1, limit: 10 }));
    }, [dispatch]);

    const handleClaim = async (ticketId: string) => {
        try {
            await dispatch(claimTicket(ticketId)).unwrap();
            toast.success('Ticket claimed successfully');
            // Refresh logic handled in slice (removes from list) but we might want to fetch more if list gets small?
            // For now rely on user scrolling or slice update.
        } catch (err: any) {
            toast.error(err);
        }
    };

    const handleReject = async (ticketId: string) => {
        if (window.confirm('Are you sure you want to reject this ticket?')) {
            try {
                await dispatch(rejectTicket({ ticketId })).unwrap();
                toast.success('Ticket rejected');
            } catch (err: any) {
                toast.error(err);
            }
        }
    };

    // Infinite Scroll Logic
    const observer = useRef<IntersectionObserver | null>(null);
    const lastTicketElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && unassignedTicketsHasMore) {
                dispatch(fetchUnassignedTickets({ page: unassignedTicketsPage + 1, limit: 10 }));
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, unassignedTicketsHasMore, unassignedTicketsPage, dispatch]);


    return (
        <div className="min-h-screen p-6 relative bg-gray-50/50">
            <Header className="mb-10" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/agent/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Unassigned Tickets</h2>
                    <div className="text-sm text-gray-500">
                        Showing {unassignedTickets.length} of {unassignedTicketsTotal}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                    {unassignedTickets.map((ticket, index) => {
                        if (unassignedTickets.length === index + 1) {
                            return (
                                <div ref={lastTicketElementRef} key={ticket._id}>
                                    <TicketCard
                                        ticket={ticket}
                                        onClaim={handleClaim}
                                        onReject={handleReject}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <div key={ticket._id}>
                                    <TicketCard
                                        ticket={ticket}
                                        onClaim={handleClaim}
                                        onReject={handleReject}
                                    />
                                </div>
                            );
                        }
                    })}
                </div>

                {isLoading && (
                    <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {!isLoading && unassignedTickets.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">No unassigned tickets found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentUnassignedTickets;
