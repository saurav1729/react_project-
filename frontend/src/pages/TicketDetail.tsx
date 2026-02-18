import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { getTicketDetail, fetchComments, fetchHistory, addComment, claimTicket, startTicket, unassignTicket, completeTicket, reopenTicket } from '../features/tickets/ticketSlice';
import StatusStepper from '../components/StatusStepper';
import Header from '../components/Header';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

import CompleteModal from '../components/CompleteModal';
import UnassignModal from '../components/UnassignModal';
import { toast } from 'react-toastify';

const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { ticket, comments, history, isLoading, error } = useSelector((state: RootState) => state.tickets);
    const { user } = useSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
    const [commentText, setCommentText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isInternal, setIsInternal] = useState(false); // Internal Note State

    // Modal States
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: 'unassign' | 'complete' | null;
    }>({ isOpen: false, type: null });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            dispatch(getTicketDetail(id));
            dispatch(fetchComments(id));
            dispatch(fetchHistory(id));
        }
    }, [dispatch, id]);


    // Agent Actions Handlers
    const handleClaim = async () => {
        if (!id) return;
        try {
            await dispatch(claimTicket(id)).unwrap();
            toast.success('Ticket claimed successfully');
            dispatch(fetchHistory(id)); // Refresh history
        } catch (err: any) {
            toast.error(err);
        }
    };

    const handleStart = async () => {
        if (!id) return;
        try {
            await dispatch(startTicket(id)).unwrap();
            toast.success('Ticket started');
            dispatch(fetchHistory(id));
        } catch (err: any) {
            toast.error(err);
        }
    };

    const handleReopen = async () => {
        if (!id) return;
        try {
            await dispatch(reopenTicket(id)).unwrap();
            toast.success('Ticket reopened');
            dispatch(fetchHistory(id));
        } catch (err: any) {
            toast.error(err);
        }
    };

    const handleActionConfirm = async (inputValue: string) => {
        if (!id || !actionModal.type) return;

        try {
            if (actionModal.type === 'unassign') {
                await dispatch(unassignTicket({ ticketId: id, reason: inputValue })).unwrap();
                toast.success('Ticket unassigned');
            } else if (actionModal.type === 'complete') {
                await dispatch(completeTicket({ ticketId: id, resolutionSummary: inputValue })).unwrap();
                toast.success('Ticket completed');
            }
            setActionModal({ isOpen: false, type: null });
            dispatch(fetchHistory(id));
        } catch (err: any) {
            toast.error(err);
        }
    };

    const openActionModal = (type: 'unassign' | 'complete') => {
        setActionModal({ isOpen: true, type });
    };


    const handlePostComment = async () => {
        if (!id || (!commentText.trim() && selectedFiles.length === 0)) return;

        await dispatch(addComment({
            ticketId: id,
            content: commentText,
            isInternal: isInternal, // Use state
            files: selectedFiles
        }));
        setCommentText('');
        setSelectedFiles([]);
        setIsInternal(false); // Reset internal flag
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (isLoading && !ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] gap-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {error || 'Ticket not found'}
                </h2>
                <Link to="/dashboard" className="text-orange-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        );
    }

    // Determine category name safely
    const categoryName = typeof ticket.category === 'object' ? ticket.category.name : 'General';
    // Format dates
    const createdDate = new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const updatedDate = new Date(ticket.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Permissions Helper
    const isAgent = user?.role === 'Agent';
    const isAssignee = ticket.assigneeId && (typeof ticket.assigneeId === 'object' ? ticket.assigneeId._id === user?._id : ticket.assigneeId === user?._id);
    const isCreator = ticket.requesterId && (typeof ticket.requesterId === 'object' ? ticket.requesterId._id === user?._id : ticket.requesterId === user?._id);
    const isUnassigned = ticket.status === 'Created'; // or check assigneeId is null

    return (
        <div className="min-h-screen p-6 relative bg-gray-50/50">
            {/* Top Navigation Bar */}
            <Header />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto mb-6 flex items-center text-sm text-gray-500">
                <Link to={isAgent ? "/agent/dashboard" : "/dashboard"} className="hover:text-orange-600 transition-colors">Dashboard</Link>
                {/* Optional: Add 'Unassigned Tickets' breadcrumb if referer was Unassigned */}
                <span className="mx-2">&gt;</span>
                <span className="font-semibold text-orange-600">{ticket.displayId}</span>
            </div>

            <GlassCard className='p-8'>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Section with Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Ticket ID - {ticket.displayId}</h1>
                            </div>

                            {/* Agent Actions */}
                            {isAgent && (
                                <div className="flex gap-3">
                                    {isUnassigned && !isCreator && (
                                        <Button onClick={handleClaim} className="bg-orange-600 hover:bg-orange-700 text-white">
                                            Assign to Myself
                                        </Button>
                                    )}

                                    {isAssignee && (
                                        <>
                                            {ticket.status !== 'Completed' && ticket.status !== 'Rejected' && (
                                                <>
                                                    <button
                                                        onClick={() => openActionModal('unassign')}
                                                        className="px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 font-medium transition-colors"
                                                    >
                                                        Unassign Ticket
                                                    </button>

                                                    {ticket.status === 'Assigned' && (
                                                        <Button onClick={handleStart} className="bg-orange-600 hover:bg-orange-700 text-white">
                                                            Start
                                                        </Button>
                                                    )}

                                                    {ticket.status === 'Started' && (
                                                        <Button onClick={() => openActionModal('complete')} className="bg-green-600 hover:bg-green-700 text-white">
                                                            Mark Complete
                                                        </Button>
                                                    )}
                                                </>
                                            )}

                                            {ticket.status === 'Completed' && (
                                                <Button onClick={handleReopen} className="bg-orange-600 hover:bg-orange-700 text-white">
                                                    Reopen Ticket
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stepper Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <StatusStepper currentStatus={ticket.status} />
                        </div>

                        {/* Ticket Details Box */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">{ticket.title}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {ticket.description}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                            {/* Tabs */}
                            <div className="px-6 pt-6 pb-2">
                                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                                    <button
                                        className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'comments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setActiveTab('comments')}
                                    >
                                        All Comments ({comments?.length || 0})
                                    </button>
                                    <button
                                        className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setActiveTab('history')}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
                                {activeTab === 'comments' ? (
                                    comments && comments.length > 0 ? (
                                        <div className="space-y-6">
                                            {comments.map((comment) => {
                                                // Check populated fields defensively
                                                const isPopulated = typeof comment.authorId === 'object' && comment.authorId !== null;
                                                const currentAuthorId = isPopulated ? (comment.authorId as any)._id : comment.authorId;
                                                const isMe = currentAuthorId === user?._id;

                                                const firstName = isPopulated && (comment.authorId as any).firstName
                                                    ? (comment.authorId as any).firstName
                                                    : (isMe ? user?.firstName : 'Unknown');

                                                const lastName = isPopulated && (comment.authorId as any).lastName
                                                    ? (comment.authorId as any).lastName
                                                    : (isMe ? user?.lastName : '');

                                                const role = isPopulated && (comment.authorId as any).role
                                                    ? (comment.authorId as any).role
                                                    : (isMe ? user?.role : '');

                                                const isInternalNote = comment.visibility === 'Internal';

                                                // If Internal Note and I am NOT an Agent, DO NOT SHOW
                                                if (isInternalNote && user?.role !== 'Agent') return null;

                                                return (
                                                    <div key={comment._id} className="flex gap-4 group">
                                                        {/* Vertical Bar */}
                                                        <div className={`w-1 rounded-full flex-shrink-0 ${isInternalNote ? 'bg-purple-500' : (isMe ? 'bg-orange-500' : 'bg-gray-300')}`}></div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-bold text-gray-900 text-sm">
                                                                        {firstName} {lastName}
                                                                    </h4>
                                                                    {role === 'Agent' && (
                                                                        <span className="text-xs text-gray-500 font-medium">(Agent)</span>
                                                                    )}
                                                                    {isMe && (
                                                                        <span className="text-xs text-orange-600 font-medium">(You)</span>
                                                                    )}
                                                                    {isInternalNote && (
                                                                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                                                            🔒 Internal Note - Agent Only
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-400 font-medium">
                                                                    {new Date(comment.createdAt).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: 'numeric',
                                                                        minute: 'numeric',
                                                                        hour12: true
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${isInternalNote ? 'bg-purple-50 p-3 rounded-lg border border-purple-100' : ''}`}>
                                                                {comment.body}
                                                            </div>

                                                            {/* Attachments Section */}
                                                            {comment.attachments && comment.attachments.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-3">
                                                                    {comment.attachments.map((file: any, idx: number) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={`http://localhost:5000/uploads/${file.storageKey}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group/file"
                                                                        >
                                                                            <span className="text-lg">📄</span>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs font-medium text-blue-600 group-hover/file:underline truncate max-w-[150px]">
                                                                                    {file.originalFilename}
                                                                                </span>
                                                                                {file.sizeBytes && (
                                                                                    <span className="text-[10px] text-gray-400">
                                                                                        {(file.sizeBytes / 1024).toFixed(1)} KB
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center mt-12 mb-12">
                                            {/* Empty State */}
                                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-orange-200 rounded-full absolute -top-2 -left-2 opacity-50"></div>
                                                    <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-white relative z-10">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">No Conversation found</p>
                                        </div>
                                    )
                                ) : (
                                    // History Tab
                                    <div className="space-y-6 relative border-l-2 border-gray-100 ml-3 pl-6 py-2">
                                        {history && history.length > 0 ? (
                                            history
                                                .filter(item => item.eventType !== 'CommentAdded')
                                                .map((item) => {
                                                    const actionLabel = item.eventType
                                                        .replace(/_/g, ' ')
                                                        .replace(/([A-Z])/g, ' $1')
                                                        .trim();

                                                    let actorName = 'System';
                                                    if (item.actorId) {
                                                        if (typeof item.actorId === 'object' && 'firstName' in item.actorId) {
                                                            actorName = `${(item.actorId as any).firstName} ${(item.actorId as any).lastName}`;
                                                        } else if (typeof item.actorId === 'string') {
                                                            const id = item.actorId as string;
                                                            if (user && user._id === id) {
                                                                actorName = `${user.firstName} ${user.lastName}`;
                                                            } else {
                                                                actorName = `User (${id.substring(0, 6)}...)`;
                                                            }
                                                        }
                                                    }

                                                    return (
                                                        <div key={item._id} className="relative">
                                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gray-200 border-2 border-white"></div>
                                                            <p className="text-sm text-gray-800">
                                                                <span className="font-semibold">{actionLabel}</span> by {actorName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">{new Date(item.occurredAt || item.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">No history available</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                                {/* Selected Files Preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 shadow-sm">
                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                <button
                                                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                                                    className="text-gray-400 hover:text-red-500 font-bold"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Internal Note Toggle for Agent */}
                                {isAgent && (
                                    <div className="mb-3 flex items-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value=""
                                                className="sr-only peer"
                                                checked={isInternal}
                                                onChange={(e) => setIsInternal(e.target.checked)}
                                                disabled={isAgent && !isAssignee && !isUnassigned && !isCreator}
                                            />
                                            <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${isAgent && !isAssignee && !isUnassigned && !isCreator ? 'opacity-50 cursor-not-allowed' : 'peer-checked:bg-purple-600'}`}></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700 flex items-center gap-1">
                                                Internal Note <span className="text-gray-400 text-xs font-normal">(Visible only to agents )</span>
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <div className="relative">
                                    <textarea
                                        className={`w-full pl-4 pr-12 py-3 rounded-xl border ${isInternal ? 'border-purple-200 bg-purple-50 focus:ring-purple-500/20' : 'border-gray-200 bg-white focus:ring-orange-500/20'} focus:outline-none focus:ring-2 resize-none text-sm text-gray-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                                        rows={3}
                                        placeholder={isAgent && !isAssignee && !isUnassigned && !isCreator ? "Only the assigned agent can add comments." : (isInternal ? "Add an internal note visible only to other agents..." : "Add a comment visible to the requester...")}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={isAgent && !isAssignee && !isUnassigned && !isCreator}
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            disabled={isAgent && !isAssignee && !isUnassigned && !isCreator}
                                        />
                                        <button
                                            className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={triggerFileInput}
                                            title="Attach files"
                                            disabled={isAgent && !isAssignee && !isUnassigned && !isCreator}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                        </button>
                                        <button
                                            className={`${isInternal ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30'} text-white p-2 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                                            onClick={handlePostComment}
                                            disabled={(!commentText.trim() && selectedFiles.length === 0) || (isAgent && !isAssignee && !isUnassigned && !isCreator)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 text-sm">Ticket Information</h3>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 w-5 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </span>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Type: </span>
                                            <span className="text-gray-900 font-medium">{ticket.type}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 w-5 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </span>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Category: </span>
                                            <span className="text-gray-900 font-medium">{categoryName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 w-5 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Created: </span>
                                            <span className="text-gray-900 font-medium">{createdDate}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 w-5 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </span>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Updated: </span>
                                            <span className="text-gray-900 font-medium">{updatedDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100"></div>

                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-gray-400 w-5 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-500 text-sm">Requester</span>
                                    </div>
                                    <div className="pl-8">
                                        <p className="text-sm font-medium text-gray-900">{ticket.requesterId?.firstName} {ticket.requesterId?.lastName}</p>
                                        <p className="text-sm text-gray-500">{ticket.requesterId?.email}</p>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100"></div>

                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-gray-400 w-5 flex justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-500 text-sm">Assigned To</span>
                                    </div>
                                    <div className="pl-8">
                                        {ticket.assigneeId ? (
                                            <>
                                                <p className="text-sm font-medium text-gray-900">{ticket.assigneeId.firstName} {ticket.assigneeId.lastName}</p>
                                                <p className="text-sm text-gray-500">{ticket.assigneeId.email}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Not Assigned Yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resolution Summary for Completed Tickets */}
                        {ticket.status === 'Completed' && ticket.resolutionSummary && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 bg-green-50/30">
                                <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Resolution Summary
                                </h3>
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {ticket.resolutionSummary}
                                </p>
                                {ticket.completedAt && (
                                    <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-green-200">
                                        Resolved on {new Date(ticket.completedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Modals */}
            {ticket && (
                <>
                    <UnassignModal
                        isOpen={actionModal.isOpen && actionModal.type === 'unassign'}
                        onClose={() => setActionModal({ isOpen: false, type: null })}
                        onConfirm={(reason) => handleActionConfirm(reason)}
                        ticketId={ticket.displayId}
                    />

                    <CompleteModal
                        isOpen={actionModal.isOpen && actionModal.type === 'complete'}
                        onClose={() => setActionModal({ isOpen: false, type: null })}
                        onConfirm={handleActionConfirm}
                        ticketId={ticket.displayId}
                    />
                </>
            )}
        </div>
    );
};

export default TicketDetail;