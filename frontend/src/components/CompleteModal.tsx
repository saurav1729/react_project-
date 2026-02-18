import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface CompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (resolution: string) => void;
    ticketId: string;
}

const CompleteModal: React.FC<CompleteModalProps> = ({ isOpen, onClose, onConfirm, ticketId }) => {
    if (!isOpen) return null;

    const validationSchema = Yup.object({
        resolution: Yup.string().required('Resolution Summary is required. Please fill it in to mark the ticket as complete.'),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Mark Complete Ticket {ticketId}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-6 font-medium">
                        Are you sure you want to mark this ticket as complete? If yes, please provide a resolution summary below.
                    </p>

                    <Formik
                        initialValues={{ resolution: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            onConfirm(values.resolution);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="mb-6">
                                    <label htmlFor="resolution" className="block text-sm font-bold text-gray-700 mb-2">
                                        Resolution Summary
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="resolution"
                                        id="resolution"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none placeholder:text-gray-400"
                                        placeholder="Please provide detailed information about your issue or request..."
                                    />
                                    <ErrorMessage name="resolution" component="div" className="text-red-500 text-sm mt-1 font-medium" />
                                </div>

                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Completing...' : 'Mark Complete'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default CompleteModal;
