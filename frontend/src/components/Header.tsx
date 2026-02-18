import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../features/auth/authSlice';
import GlassCard from './ui/GlassCard';

interface HeaderProps {
    className?: string; // Allow additional styling from parent
}

const Header: React.FC<HeaderProps> = ({ className }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <GlassCard className={`mb-6 bg-white py-3 px-6 rounded-2xl shadow-sm ${className || ''}`}>
            <header className="flex justify-between items-center ">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">IT</div>
                    <span className="font-bold text-gray-800 text-lg">IT Helpdesk Portal</span>
                </div>

                <div className="flex items-center gap-4">
                    {user?.role === 'Agent' ? (
                        <>
                            <Link to="/agent/dashboard" className="text-gray-600 hover:text-orange-600 font-medium px-3 py-2 transition-colors flex items-center gap-2">
                                <span className="text-lg">🏠</span> Dashboard
                            </Link>
                            <Link to="/agent/tickets" className="text-gray-600 hover:text-orange-600 font-medium px-3 py-2 transition-colors flex items-center gap-2">
                                <span className="text-lg">🎫</span> My SupportTickets
                            </Link>
                            <Link to="/dashboard" className="text-gray-600 hover:text-orange-600 font-medium px-3 py-2 transition-colors flex items-center gap-2">
                                <span className="text-lg">👤</span> My Tickets
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange-200 transition-colors">
                                <span>🎫</span> My Tickets
                            </Link>
                            {/* <Link to="/create-ticket" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                <span>➕</span> New Ticket
                            </Link> */}
                        </>
                    )}

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800 leading-tight">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-500">{user?.role}</p>
                        </div>
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=1F2937&color=fff`}
                            alt="Profile"
                            className="w-9 h-9 rounded-full border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-orange-200"
                            onClick={handleLogout}
                            title="Click to logout"
                        />
                    </div>
                </div>
            </header>
        </GlassCard>
    );
};

export default Header;
