import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
    return (
        <div className={`backdrop-blur-sm bg-white/10 border border-white/50 shadow-xl rounded-2xl ${className}`}>
            {children}
        </div>
    );
};

export default GlassCard;
