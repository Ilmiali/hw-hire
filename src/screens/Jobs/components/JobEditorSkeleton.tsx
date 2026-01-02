import ContentLoader from 'react-content-loader';
import { useEffect, useState } from 'react';

const JobEditorSkeleton = () => {
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
            <div className="shrink-0 border-b border-zinc-200 dark:border-white/10 px-4 py-2 h-[57px] flex items-center justify-between">
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
                    <rect x="44" y="4" rx="4" ry="4" width="100" height="12" />
                    <rect x="44" y="20" rx="4" ry="4" width="150" height="12" />
                </ContentLoader>

                <ContentLoader
                     speed={2}
                     width={300}
                     height={32}
                     viewBox="0 0 300 32"
                     backgroundColor={bgColor}
                     foregroundColor={fgColor}
                     className="w-full max-w-[300px]"
                 >
                     {/* Buttons right */}
                     <rect x="0" y="0" rx="6" ry="6" width="80" height="32" />
                     <rect x="90" y="0" rx="6" ry="6" width="100" height="32" />
                     <rect x="200" y="0" rx="6" ry="6" width="100" height="32" />
                 </ContentLoader>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Skeleton - Fixed 256px (w-64) */}
                <div className="w-64 shrink-0 border-r border-zinc-200 dark:border-white/10 p-4 bg-zinc-50/50 dark:bg-black/20">
                     <ContentLoader
                        speed={2}
                        width={224}
                        height={600}
                        viewBox="0 0 224 600"
                        backgroundColor={bgColor}
                        foregroundColor={fgColor}
                    >
                        {/* Config Header */}
                        <rect x="8" y="0" rx="2" ry="2" width="60" height="8" />
                        
                        {/* Config Items */}
                        <rect x="0" y="24" rx="8" ry="8" width="224" height="36" />
                        <rect x="0" y="68" rx="8" ry="8" width="224" height="36" />

                        {/* Distribution Header */}
                        <rect x="8" y="128" rx="2" ry="2" width="80" height="8" />
                        
                        {/* Distribution Items */}
                        <rect x="0" y="152" rx="8" ry="8" width="224" height="36" />
                        <rect x="0" y="196" rx="8" ry="8" width="224" height="36" />
                        <rect x="0" y="240" rx="8" ry="8" width="224" height="36" />
                    </ContentLoader>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 bg-zinc-50/30 dark:bg-zinc-900/10 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <ContentLoader
                            speed={2}
                            width={832}
                            height={800}
                            viewBox="0 0 832 800"
                            backgroundColor={bgColor}
                            foregroundColor={fgColor}
                            className="w-full h-auto"
                        >
                            {/* Main Card */}
                            <rect x="0" y="0" rx="12" ry="12" width="832" height="600" />
                        </ContentLoader>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobEditorSkeleton;
