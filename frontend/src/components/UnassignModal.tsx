import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface UnassignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    ticketId: string;
}

const UnassignModal: React.FC<UnassignModalProps> = ({ isOpen, onClose, onConfirm, ticketId }) => {
    if (!isOpen) return null;

    const validationSchema = Yup.object({
        reason: Yup.string().required('Reason is required'),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Unassign the Ticket {ticketId}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to unassign this ticket? If yes, please provide a reason below.
                    </p>

                    <Formik
                        initialValues={{ reason: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            onConfirm(values.reason);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="mb-6">
                                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="reason"
                                        id="reason"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                                        placeholder="Please provide detailed information about your issue or request..."
                                    />
                                    <ErrorMessage name="reason" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl border border-orange-200 text-orange-600 font-medium hover:bg-orange-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Unassigning...' : 'Confirm Unassign'}
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

export default UnassignModal;
