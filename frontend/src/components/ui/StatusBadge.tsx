import React from 'react';

interface StatusBadgeProps {
    status?: string;
    type?: 'status' | 'priority' | 'type';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = '', type = 'status' }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'created': return 'bg-gray-100 text-gray-800 border-gray-200'; // Gray for Unassigned
            case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200'; // Figma shows purple/pinkish for Assigned? Adjusting to purple based on "Assigned" chips often being distinct.
            case 'started': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-red-700 font-bold'; // Figma shows just text for priority usually? Or badge. Let's use text with dot if Figma style. The user said "Priority (as shown in design)". The design often has a dot.
            case 'high': return 'text-orange-600 font-bold';
            case 'medium': return 'text-yellow-600 font-bold';
            case 'low': return 'text-green-600 font-bold';
            default: return 'text-gray-600';
        }
    };

    if (type === 'priority') {
        return (
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status.toLowerCase() === 'critical' ? 'bg-red-500' : status.toLowerCase() === 'high' ? 'bg-orange-500' : status.toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className={`text-xs uppercase tracking-wider ${getPriorityColor(status)}`}>{status}</span>
            </div>
        );
    }

    if (type === 'status') {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                {status === 'Created' ? 'Unassigned' : status}
            </span>
        );
    }

    return <span>{status}</span>;
};

export default StatusBadge;
