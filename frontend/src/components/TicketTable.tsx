import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './ui/StatusBadge';
import FilterDropdown from './ui/FilterDropdown';
import { Ticket, Category } from '../types';
import emptyImage from '../assets/empty.png';
import errorImage from '../assets/Error.png';

interface FilterState {
    type: string;
    priority: string;
    status: string;
    categoryId: string;
}

interface TicketTableProps {
    tickets: Ticket[];
    isLoading: boolean;
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: string) => void;
    onClearFilter: (key: keyof FilterState) => void;
    role: 'Agent' | 'Requester';
    categories: Category[];
    pagination?: {
        page: number;
        total: number;
        limit: number;
        onPageChange: (page: number) => void;
    };
    error?: string | null;
}

const TicketTable: React.FC<TicketTableProps> = ({
    tickets,
    isLoading,
    filters,
    onFilterChange,
    onClearFilter,
    role,
    categories,
    pagination,
    error
}) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Ticket ID
                            </th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FilterDropdown
                                    label="Type"
                                    options={[
                                        { label: 'Incident', value: 'Incident' },
                                        { label: 'Service Request', value: 'Service Request' }
                                    ]}
                                    value={filters.type}
                                    onChange={(val) => onFilterChange('type', val)}
                                    onClear={() => onClearFilter('type')}
                                />
                            </th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FilterDropdown
                                    label="Category"
                                    options={categories.map(c => ({ label: c.name, value: c._id }))}
                                    value={filters.categoryId}
                                    onChange={(val) => onFilterChange('categoryId', val)}
                                    onClear={() => onClearFilter('categoryId')}
                                />
                            </th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FilterDropdown
                                    label="Priority"
                                    options={[
                                        { label: 'Low', value: 'Low' },
                                        { label: 'Medium', value: 'Medium' },
                                        { label: 'High', value: 'High' },
                                        { label: 'Critical', value: 'Critical' }
                                    ]}
                                    value={filters.priority}
                                    onChange={(val) => onFilterChange('priority', val)}
                                    onClear={() => onClearFilter('priority')}
                                />
                            </th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <FilterDropdown
                                    label="Status"
                                    options={[
                                        { label: 'Unassigned', value: 'Created' },
                                        { label: 'Assigned', value: 'Assigned' },
                                        { label: 'Started', value: 'Started' },
                                        { label: 'Completed', value: 'Completed' },
                                        { label: 'Rejected', value: 'Rejected' }
                                    ]}
                                    value={filters.status}
                                    onChange={(val) => onFilterChange('status', val)}
                                    onClear={() => onClearFilter('status')}
                                />
                            </th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Assigned To
                            </th>
                            {role === 'Agent' && (
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Requester
                                </th>
                            )}
                            {role === 'Requester' && (
                                <>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Created On
                                    </th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={role === 'Requester' ? 9 : 8} className="py-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={role === 'Requester' ? 9 : 8} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <img src={errorImage} alt="Error" className="max-w-[400px] mb-6 animate-fade-in" />
                                        <h3 className="text-gray-800 font-bold text-lg mb-2">Something went wrong!</h3>
                                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                                            We're having trouble loading this data right now.
                                        </p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 font-medium transition-all"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={role === 'Requester' ? 9 : 8} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <img src={emptyImage} alt="No Data" className="max-w-[200px] mb-6 opacity-80 animate-fade-in" />
                                        <h3 className="text-gray-800 font-bold text-lg mb-2">No data found</h3>
                                        <p className="text-gray-500">
                                            {role === 'Requester' ? "Create a new ticket to begin" : "No tickets assigned to you yet"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                                    <td className="py-4 px-6">
                                        <span className="text-orange-600 font-medium underline-offset-2 hover:underline">
                                            {ticket.displayId}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900">{ticket.title}</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">{ticket.type}</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">
                                        {typeof ticket.categoryId === 'object' && ticket.categoryId !== null
                                            ? (ticket.categoryId as any).name
                                            : categories.find(c => c._id === (ticket.categoryId as any))?.name || 'Unknown'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={ticket.priority} type="priority" />
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={ticket.status} type="status" />
                                    </td>
                                    <td className="py-4 px-6">
                                        {ticket.assigneeId ? (
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${ticket.assigneeId.firstName}+${ticket.assigneeId.lastName}&background=E5E7EB&color=374151&size=24`}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full"
                                                />
                                                <span className="text-sm text-gray-700">{ticket.assigneeId.firstName} {ticket.assigneeId.lastName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Not Assigned</span>
                                        )}
                                    </td>

                                    {role === 'Agent' && (
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white">
                                                    {ticket.requesterId?.firstName?.[0] || 'U'}
                                                </div>
                                                <span className="text-sm text-gray-700">{ticket.requesterId?.firstName} {ticket.requesterId?.lastName}</span>
                                            </div>
                                        </td>
                                    )}

                                    {role === 'Requester' && (
                                        <>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination (Visual only for now, but wired for future logic) */}
            {pagination && (
                <div className="py-3 px-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Showing {tickets.length} of {pagination.total} results</span>
                    <div className="flex gap-1">
                        <button
                            className="px-3 py-1 border rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            disabled={pagination.page <= 1}
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                        >
                            &lt;
                        </button>
                        <button className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded font-medium">
                            {pagination.page}
                        </button>
                        <button
                            className="px-3 py-1 border rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            disabled={tickets.length < pagination.limit} // Simple check provided we don't know exact total pages logic perfectly here without calc
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketTable;
