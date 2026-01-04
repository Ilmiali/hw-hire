import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { ApplyLayout } from './ApplyLayout';

interface SuccessScreenProps {
    jobTitle: string;
}

export function SuccessScreen({ jobTitle }: SuccessScreenProps) {
    return (
        <ApplyLayout>
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center mb-8">
                    <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-500" />
                </div>
                
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
                    Application Sent!
                </h1>
                
                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed">
                    Thank you for applying to the <span className="font-semibold text-zinc-900 dark:text-zinc-100">{jobTitle}</span> position. We've received your application and will be in touch soon.
                </p>
                
                <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-8 h-12 font-medium"
                >
                    Back to careers
                </Button>
            </div>
        </ApplyLayout>
    );
}
