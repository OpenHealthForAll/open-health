interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({currentStep, totalSteps}: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-gray-600 transition-all duration-300 ease-in-out"
                style={{width: `${progress}%`}}
            />
        </div>
    );
} 