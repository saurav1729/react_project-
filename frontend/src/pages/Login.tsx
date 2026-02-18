import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import loginlogo from '../assets/loginlogo.png';

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'Agent') {
                navigate('/agent/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Incorrect Email ID').required('Required'),
            password: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            dispatch(loginStart());
            try {
                const response = await api.post('/auth/login', values);
                dispatch(loginSuccess(response.data.data));
                toast.success('Login successful');
                const role = response.data.data.user.role;
                if (role === 'Agent') {
                    navigate('/agent/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } catch (error: any) {
                const message = error.response?.data?.message || error.response?.data?.error?.message || 'Login failed';
                dispatch(loginFailure(message));

                // Map backend errors to form fields
                if (message.toLowerCase().includes('email') || message.toLowerCase().includes('user')) {
                    formik.setFieldError('email', message);
                } else if (message.toLowerCase().includes('password')) {
                    formik.setFieldError('password', message);
                } else {
                    // General error - show on password or toast
                    toast.error(message);
                }
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-5xl flex overflow-hidden min-h-[600px]">

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">IT</div>
                            <span className="font-bold text-gray-800">IT Helpdesk Portal</span>
                        </div>

                        <Link to="/" className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 mb-6 transition-colors">
                            <span>←</span> Go Back
                        </Link>

                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In to Access your Account</h2>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@company.com"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && formik.errors.email}
                        />

                        <Input
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password}
                        />

                        {error && (
                            <div className="text-red-500 text-sm font-semibold text-center animate-fadeIn">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>

                        <div className="text-center text-sm text-gray-600 mt-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 font-medium hover:underline">
                                Register here
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    <img src={loginlogo} alt="IT Support" className="w-full max-w-md" />
                </div>

            </GlassCard>
        </div>
    );
};

export default Login;
