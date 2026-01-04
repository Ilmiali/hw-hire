
import React from 'react';

interface ApplyLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function ApplyLayout({ children, className = '' }: ApplyLayoutProps) {
    return (
        <div className={`min-h-screen bg-[#f8f9fb] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors selection:bg-zinc-200 dark:selection:bg-zinc-800 ${className}`}>
             {/* Subtle top gradient line */}
             <div className="h-1 w-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
             
            <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 md:py-16 min-h-[calc(100vh-4px)] flex flex-col">
                 <div className="flex-1 flex flex-col">
                    {children}
                 </div>
                 
                 <footer className="mt-12 text-center">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium pb-4">
                        Powered by HW Hire &bull; Privacy & Terms
                    </p>
                 </footer>
            </main>
        </div>
    );
}
