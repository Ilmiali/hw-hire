import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ApplyFooterActionsProps {
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    submitting: boolean;
    isSaving?: boolean;
    lastSavedAt?: Date | null;
}

export function ApplyFooterActions({
    onNext,
    onBack,
    isFirstStep,
    isLastStep,
    submitting,
    isSaving,
    lastSavedAt
}: ApplyFooterActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <div className="order-2 sm:order-1">
                {!isFirstStep && (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        disabled={submitting}
                        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                    >
                        Back
                    </Button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
                {/* Saving Indicator */}
                {(isSaving || lastSavedAt) && (
                    <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 sm:mr-2">
                        {isSaving ? (
                            <>
                                <Spinner className="w-3 h-3 border-zinc-300 dark:border-zinc-600" />
                                <span>Saving...</span>
                            </>
                        ) : lastSavedAt ? (
                            <span>Saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}</span>
                        ) : null}
                    </div>
                )}

                <Button
                    onClick={onNext}
                    disabled={submitting}
                    className={cn(
                        "w-full sm:w-32 h-11 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-semibold rounded-xl",
                        submitting && "opacity-80"
                    )}
                >
                    {submitting ? (
                        <Spinner className="w-4 h-4 mr-2" />
                    ) : isLastStep ? (
                        'Submit'
                    ) : (
                        'Next'
                    )}
                </Button>
            </div>
        </div>
    );
}
