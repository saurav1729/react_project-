import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (inputValue: string) => void;
    title: string;
    description: string;
    inputLabel: string;
    inputPlaceholder: string;
    confirmButtonText: string;
    confirmButtonColor?: 'orange' | 'green' | 'red'; // Add more as needed
    initialValue?: string;
}

const ActionModal: React.FC<ActionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    inputLabel,
    inputPlaceholder,
    confirmButtonText,
    confirmButtonColor = 'orange',
    initialValue = ''
}) => {
    if (!isOpen) return null;

    const validationSchema = Yup.object({
        input: Yup.string().required(`${inputLabel} is required`),
    });

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500/20 text-white shadow-green-500/30';
            case 'red':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500/20 text-white shadow-red-500/30';
            default: // orange
                return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500/20 text-white shadow-orange-500/30';
        }
    };

    const getFocusBorderClass = (color: string) => {
        switch (color) {
            case 'green':
                return 'focus:border-green-500 focus:ring-green-500/20';
            case 'red':
                return 'focus:border-red-500 focus:ring-red-500/20';
            default: // orange
                return 'focus:border-orange-500 focus:ring-orange-500/20';
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        {description}
                    </p>

                    <Formik
                        initialValues={{ input: initialValue }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            onConfirm(values.input);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="mb-6">
                                    <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
                                        {inputLabel} <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="input"
                                        id="input"
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 outline-none transition-all resize-none ${getFocusBorderClass(confirmButtonColor)}`}
                                        placeholder={inputPlaceholder}
                                    />
                                    <ErrorMessage name="input" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="flex gap-3 justify-end">
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
                                        className={`px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg disabled:opacity-50 ${getColorClasses(confirmButtonColor)}`}
                                    >
                                        {isSubmitting ? 'Processing...' : confirmButtonText}
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

export default ActionModal;
