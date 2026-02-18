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

const Register: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

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
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Required'),
            lastName: Yup.string().required('Required'),
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'Passwords must match')
                .required('Required'),
        }),
        onSubmit: async (values) => {
            dispatch(loginStart());
            try {
                const response = await api.post('/auth/register', {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    password: values.password
                });
                dispatch(loginSuccess(response.data.data));
                toast.success('Registration successful');
                const role = response.data.data.user.role;
                if (role === 'Agent') {
                    navigate('/agent/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } catch (error: any) {
                const message = error.response?.data?.error?.message || 'Registration failed';
                dispatch(loginFailure(message));

                if (message.toLowerCase().includes('email')) {
                    formik.setFieldError('email', message);
                } else {
                    toast.error(message);
                }
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-6xl flex overflow-hidden min-h-[700px]">

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/40">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">IT</div>
                            <span className="font-bold text-gray-800">IT Helpdesk Portal</span>
                        </div>

                        <Link to="/" className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 mb-4 transition-colors">
                            <span>←</span> Go Back
                        </Link>

                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In to Access your Account</h2>
                        {/* Note: Title in Image 3 says "Sign In to Access..." but context implies "Register". Adapting for Register. */}
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                id="firstName"
                                name="firstName"
                                placeholder="Enter first name"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.firstName && formik.errors.firstName}
                            />
                            <Input
                                label="Last Name"
                                id="lastName"
                                name="lastName"
                                placeholder="Enter last name"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.lastName && formik.errors.lastName}
                            />
                        </div>

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
                            placeholder="Enter password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password}
                        />
                        <Input
                            label="Confirm Password"
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        />

                        <Button
                            type="submit"
                            className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                            isLoading={isLoading}
                        >
                            Signup
                        </Button>

                        {/* Note: Image 3 shows "Signup" button */}

                        <div className="text-center text-sm text-gray-600 mt-2">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-medium hover:underline">
                                Login here
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Right Side - Same Illustration as Image 2/3 */}
                <div className="flex-1 flex items-center justify-center relative">
                    <img src={loginlogo} alt="IT Support" className="w-full max-w-md" />
                </div>

            </GlassCard>
        </div>
    );
};

export default Register;
