export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Requester' | 'Agent' | 'Admin';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface Category {
    _id: string;
    name: string;
    isActive: boolean;
}

export interface Ticket {
    _id: string;
    displayId: string;
    title: string;
    description: string;
    type: 'Incident' | 'Service Request';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Created' | 'Assigned' | 'Started' | 'Completed' | 'Rejected';
    category: Category; // Populated
    categoryId?: string | Category; // For creation or populated
    requesterId: User; // Populated
    assigneeId?: User | null; // Populated
    createdAt: string;
    updatedAt: string;
    resolutionSummary?: string;
    completedAt?: string;
}

export interface Comment {
    _id: string;
    body: string;
    authorId: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    ticketId: string;
    isInternal: boolean;
    visibility: 'Public' | 'Internal';
    createdAt: string;
    attachments?: any[];
}

export interface TicketHistory {
    _id: string;
    ticketId: string;
    eventType: string; // Was action
    actorId: {         // Was performedBy
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    metadata?: any;    // Was details
    createdAt: string; // mapped from occurredAt? Backend sends occurredAt.
    occurredAt: string;
}

export interface TicketState {
    tickets: Ticket[];
    unassignedTickets: Ticket[];
    ticket: Ticket | null;
    comments: Comment[];
    history: TicketHistory[];
    isLoading: boolean;
    error: string | null;
    total: number;
    stats: {
        total: number;
        unassigned: number;
        assigned: number;
        completed: number;
    };
    page: number;
    limit: number;
    unassignedTicketsPage: number;
    unassignedTicketsTotal: number;
    unassignedTicketsHasMore: boolean;
}

export interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
}
