import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createTicket } from '../features/tickets/ticketSlice';
import Button from './ui/Button';
import Input from './ui/Input';
import { toast } from 'react-toastify';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.tickets);

    // Hardcoded categories as per user request
    const categories = [
        "Policy Request",
        "Software Development Request",
        "Knowledge Base Request",
        "General Question"
    ];

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            categoryName: 'General Question',
            priority: 'Low',
            type: 'Incident',
            deviceType: 'Laptop',
            operatingSystem: 'Windows',
            location: 'Office',
            files: null as FileList | null
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required').max(50, 'Title too long'),
            description: Yup.string().required('Description is required').max(300, 'Description too long'),
            categoryName: Yup.string().required('Category is required'),
            priority: Yup.string().required('Priority is required'),
            type: Yup.string().required('Type is required'),
            deviceType: Yup.string().required('Device Type is required'),
            operatingSystem: Yup.string().required('OS is required'),
            location: Yup.string().required('Location is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('categoryName', values.categoryName);
            formData.append('priority', values.priority);
            formData.append('type', values.type);
            formData.append('deviceType', values.deviceType);
            formData.append('operatingSystem', values.operatingSystem);
            formData.append('location', values.location);

            if (values.files) {
                for (let i = 0; i < values.files.length; i++) {
                    formData.append('attachments', values.files[i]);
                }
            }

            const resultAction = await dispatch(createTicket(formData));
            if (createTicket.fulfilled.match(resultAction)) {
                toast.success('Support Ticket Created Successfully', {
                    className: 'bg-orange-500 text-white font-medium rounded-lg shadow-lg',
                    progressClassName: 'bg-white',
                    icon: false
                });
                resetForm();
                onClose();
            } else {
                toast.error(resultAction.payload as string || 'Failed to create ticket');
            }
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.currentTarget.files) {
            formik.setFieldValue('files', event.currentTarget.files);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Increased width to max-w-3xl */}
            <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl p-8 overflow-y-auto transform transition-transform duration-300 ease-in-out slide-in-from-right">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Create New Ticket</h2>
                        <p className="text-gray-500 mt-1">Submit an incident or service request to the IT support team</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <Input
                        label="Title *"
                        name="title"
                        type="text"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title ? formik.errors.title : undefined}
                        placeholder="Brief summary of your issue or request"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                            name="description"
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl bg-white border ${formik.touched.description && formik.errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-800 placeholder-gray-400 transition-all resize-none shadow-sm`}
                            placeholder="Please provide detailed information about your issue or request..."
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.description}</div>
                        )}
                        <p className="text-xs text-gray-400 mt-1 text-right">{formik.values.description.length}/300</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Request Type *</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all ${formik.values.type === 'Incident' ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="Incident"
                                    checked={formik.values.type === 'Incident'}
                                    onChange={formik.handleChange}
                                    className="mt-1 text-orange-600 focus:ring-orange-500"
                                />
                                <div>
                                    <span className="block font-medium text-gray-900">Incident</span>
                                    <span className="block text-xs text-gray-500">Something is broken or not working</span>
                                </div>
                            </label>

                            <label className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all ${formik.values.type === 'Service Request' ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="Service Request"
                                    checked={formik.values.type === 'Service Request'}
                                    onChange={formik.handleChange}
                                    className="mt-1 text-orange-600 focus:ring-orange-500"
                                />
                                <div>
                                    <span className="block font-medium text-gray-900">Service Request</span>
                                    <span className="block text-xs text-gray-500">Request access or new service</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Row 1: Category, Priority, Device Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                name="categoryName"
                                value={formik.values.categoryName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full px-3 py-2.5 rounded-xl bg-white border ${formik.touched.categoryName && formik.errors.categoryName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-800 text-sm shadow-sm`}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                            <select
                                name="priority"
                                value={formik.values.priority}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-800 text-sm shadow-sm"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                            <select
                                name="deviceType"
                                value={formik.values.deviceType}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-800 text-sm shadow-sm"
                            >
                                <option value="Laptop">Laptop</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Tablet">Tablet</option>
                                <option value="Desktop">Desktop</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Operating System (Updated), Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operating System *</label>
                            <select
                                name="operatingSystem"
                                value={formik.values.operatingSystem}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-800 text-sm shadow-sm"
                            >
                                <option value="Windows">Windows</option>
                                <option value="MacOS">MacOS</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <div className="flex gap-4 items-center h-[42px]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="location"
                                        value="Office"
                                        checked={formik.values.location === 'Office'}
                                        onChange={formik.handleChange}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-gray-700">Office</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="location"
                                        value="Remote"
                                        checked={formik.values.location === 'Remote'}
                                        onChange={formik.handleChange}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-gray-700">Remote</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <label className="cursor-pointer">
                                <span className="text-orange-600 font-medium hover:text-orange-700 text-lg">Click to Upload files</span>
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <p className="text-sm text-gray-400 mt-1">PNG, JPG, PDF up to 10MB each</p>
                            {formik.values.files && (
                                <div className="mt-4 w-full text-left">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Files</p>
                                    <div className="space-y-2">
                                        {Array.from(formik.values.files).map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">📄</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button type="button" className="text-gray-400 hover:text-red-500">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-3 text-gray-600">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20">
                            Submit Ticket
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
