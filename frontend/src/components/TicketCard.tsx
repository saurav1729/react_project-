import React from 'react';
import { Ticket } from '../types';

interface TicketCardProps {
    ticket: Ticket;
    onClaim: (ticketId: string) => void;
    onReject: (ticketId: string) => void;
    currentUserId?: string;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClaim, onReject, currentUserId }) => {
    const isCreator = currentUserId && ticket.requesterId && (typeof ticket.requesterId === 'object' ? ticket.requesterId._id === currentUserId : ticket.requesterId === currentUserId);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between gap-6 relative overflow-hidden group hover:border-orange-200 transition-colors">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{ticket.displayId}</span>
                    {ticket.priority === 'Critical' && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">• CRITICAL</span>
                    )}
                    {ticket.priority === 'High' && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-wider">• HIGH</span>
                    )}
                    {ticket.priority === 'Medium' && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">• MEDIUM</span>
                    )}
                    {ticket.priority === 'Low' && (
                        <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-wider">• LOW</span>
                    )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{ticket.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                <div className="flex gap-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">{ticket.type}</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        {typeof ticket.category === 'object' ? ticket.category?.name || 'General' : 'General'}
                    </span>
                </div>
            </div>
            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-50">
                {!isCreator && (
                    <button
                        onClick={() => onReject(ticket._id)}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        Reject
                    </button>
                )}
                {!isCreator && (
                    <button
                        onClick={() => onClaim(ticket._id)}
                        className="px-4 py-2 text-sm bg-orange-50 border border-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-100 hover:border-orange-200 transition-all flex-1 text-center"
                    >
                        Assign to Myself
                    </button>
                )}
            </div>
        </div>
    );
};

export default TicketCard;
