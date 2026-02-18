import React from 'react';

interface StatusStepperProps {
    currentStatus: string;
}

const steps = [
    { label: 'Created', value: 'created', id: 1 },
    { label: 'Assigned', value: 'assigned', id: 2 },
    { label: 'Started', value: 'started', id: 3 },
    { label: 'Completed', value: 'completed', id: 4 },
];

const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
    const normalizedStatus = currentStatus.toLowerCase();
    const currentIndex = steps.findIndex(step => step.value === normalizedStatus);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="w-full py-8 px-4">
            <div className="flex items-center w-full">
                {steps.map((step, index) => {
                    // 1. It's "Done" if it's behind the current step 
                    // OR if it IS the current step and the status is 'completed'
                    const isDone = index < activeIndex || (index === activeIndex && normalizedStatus === 'completed');

                    // 2. It's "Current" only if it's the active index and NOT completed yet
                    const isCurrent = index === activeIndex && normalizedStatus !== 'completed';

                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="relative flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 z-10
                                        ${isDone ? 'bg-green-600 border-green-600 text-white' : ''}
                                        ${isCurrent ? 'bg-[#FFF7ED] border-orange-200 text-orange-600 ring-4 ring-orange-50' : ''}
                                        ${!isDone && !isCurrent ? 'bg-white border-gray-200 text-gray-400' : ''}
                                    `}
                                >
                                    {isDone ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <span className={`absolute top-12 text-xs font-semibold whitespace-nowrap 
                                    ${isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                                `}>
                                    {step.label}
                                </span>
                            </div>

                            {!isLast && (
                                <div className="flex-1 h-[2px] mx-2 bg-gray-200">
                                    <div
                                        className={`h-full bg-green-500 transition-all duration-500 ease-out origin-left`}
                                        style={{
                                            // The line should fill if the step to the left is done
                                            width: isDone && index < activeIndex ? '100%' :
                                                (index < activeIndex ? '100%' : '0%')
                                        }}
                                    ></div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusStepper;
