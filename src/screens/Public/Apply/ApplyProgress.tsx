

interface ApplyProgressProps {
    currentStep: number;
    totalSteps: number;
}

export function ApplyProgress({ currentStep, totalSteps }: ApplyProgressProps) {
    const progress = Math.min(Math.max(((currentStep + 1) / totalSteps) * 100, 0), 100);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                <span>Application Progress</span>
                <span>Step {currentStep + 1} of {totalSteps}</span>
            </div>
            <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden transition-colors">
                <div 
                    className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
