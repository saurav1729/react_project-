import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import heroImage from '../assets/hero.png';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-6xl p-8 flex flex-col md:flex-row items-center gap-12 min-h-[600px]">

                {/* Left Content */}
                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {/* TODO: Replace with Logo Icon from Figma */}
                                IT
                            </div>
                            <span className="text-xl font-bold text-gray-800">IT Helpdesk Portal</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-bold tracking-widest text-gray-500 uppercase">
                                Made It Simple
                            </p>
                            <h1 className="text-5xl font-extrabold text-gray-800 leading-tight">
                                Modern <span className="text-orange-600">IT Support</span>
                            </h1>
                            <p className="text-gray-600 text-lg max-w-md pt-4">
                                Streamline your IT support operations with our powerful ticketing system.
                                Track issues, manage requests, and deliver exceptional support.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link to="/login">
                            <Button className="w-full sm:w-auto min-w-[140px]">Sign In</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="secondary" className="w-full sm:w-auto min-w-[140px]">Signup</Button>
                        </Link>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex items-center justify-center relative">
                    <img src={heroImage} alt="IT Support" className="w-full max-w-md" />
                </div>

            </GlassCard>
        </div>
    );
};

export default Landing;
