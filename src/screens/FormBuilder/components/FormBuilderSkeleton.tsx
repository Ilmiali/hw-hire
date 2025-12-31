import ContentLoader from 'react-content-loader';
import { useEffect, useState } from 'react';

const FormBuilderSkeleton = () => {
    // Basic theme detection
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial state
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();

        // Observer for class changes on html element
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Zinc-200 / Zinc-300 for Light
    // Zinc-800 / Zinc-700 for Dark (approximate matches to UI)
    const bgColor = isDark ? '#27272a' : '#e4e4e7';
    const fgColor = isDark ? '#3f3f46' : '#f4f4f5';

    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Header Skeleton */}
            <div className="shrink-0 border-b border-zinc-200 dark:border-white/10 px-4 py-3 h-[57px] flex items-center justify-between">
                <ContentLoader
                    speed={2}
                    width={300}
                    height={32}
                    viewBox="0 0 300 32"
                    backgroundColor={bgColor}
                    foregroundColor={fgColor}
                    className="w-full max-w-[300px]"
                >
                     {/* Back button + Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="32" height="32" />
                    <rect x="48" y="4" rx="4" ry="4" width="200" height="24" />
                </ContentLoader>

                <ContentLoader
                     speed={2}
                     width={400}
                     height={32}
                     viewBox="0 0 400 32"
                     backgroundColor={bgColor}
                     foregroundColor={fgColor}
                     className="w-full max-w-[400px]"
                 >
                     {/* Buttons right */}
                     <rect x="100" y="0" rx="6" ry="6" width="90" height="32" />
                     <rect x="200" y="0" rx="6" ry="6" width="90" height="32" />
                     <rect x="300" y="0" rx="6" ry="6" width="90" height="32" />
                 </ContentLoader>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Skeleton - Fixed 320px (w-80) */}
                <div className="w-80 shrink-0 border-r border-zinc-200 dark:border-white/10 p-4">
                     <ContentLoader
                        speed={2}
                        width={288}
                        height={600}
                        viewBox="0 0 288 600"
                        backgroundColor={bgColor}
                        foregroundColor={fgColor}
                    >
                        {/* Tabs */}
                        <rect x="0" y="0" rx="0" ry="0" width="288" height="40" />

                        {/* Search */}
                        <rect x="0" y="60" rx="8" ry="8" width="288" height="36" />
                        
                        {/* Items */}
                        <rect x="0" y="120" rx="4" ry="4" width="288" height="48" />
                        <rect x="0" y="180" rx="4" ry="4" width="288" height="48" />
                        <rect x="0" y="240" rx="4" ry="4" width="288" height="48" />
                        <rect x="0" y="300" rx="4" ry="4" width="288" height="48" />
                        <rect x="0" y="360" rx="4" ry="4" width="288" height="48" />
                    </ContentLoader>
                </div>

                {/* Main Canvas Skeleton - Fluid */}
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-8">
                     <ContentLoader
                        speed={2}
                        width="100%"
                        height="100%"
                        backgroundColor={bgColor}
                        foregroundColor={fgColor}
                        preserveAspectRatio="none"
                    >
                         {/* Centered Page Paper Effect - approx width 800px or responsive */}
                        <rect x="10%" y="20" rx="8" ry="8" width="80%" height="800" />
                    </ContentLoader>
                </div>

                {/* Right Sidebar Skeleton - Fixed 320px (w-80) */}
                <div className="w-80 shrink-0 border-l border-zinc-200 dark:border-white/10 p-4">
                     <ContentLoader
                        speed={2}
                        width={288}
                        height={600}
                        viewBox="0 0 288 600"
                        backgroundColor={bgColor}
                        foregroundColor={fgColor}
                    >
                        {/* Header */}
                        <rect x="0" y="0" rx="4" ry="4" width="180" height="24" />
                        
                        {/* Props inputs */}
                        <rect x="0" y="50" rx="4" ry="4" width="80" height="16" />
                        <rect x="0" y="74" rx="6" ry="6" width="288" height="36" />

                        <rect x="0" y="130" rx="4" ry="4" width="80" height="16" />
                        <rect x="0" y="154" rx="6" ry="6" width="288" height="36" />

                        <rect x="0" y="210" rx="4" ry="4" width="80" height="16" />
                        <rect x="0" y="234" rx="6" ry="6" width="288" height="100" />
                    </ContentLoader>
                </div>
            </div>
        </div>
    );
};

export default FormBuilderSkeleton;
