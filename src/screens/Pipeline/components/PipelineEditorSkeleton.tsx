import ContentLoader from 'react-content-loader';
import { useEffect, useState } from 'react';

const PipelineEditorSkeleton = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const bgColor = isDark ? '#27272a' : '#e4e4e7';
    const fgColor = isDark ? '#3f3f46' : '#f4f4f5';

    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Header Skeleton */}
            <div className="shrink-0 border-b border-zinc-200 dark:border-white/10 px-4 py-2 h-[53px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ContentLoader
                        speed={2}
                        width={250}
                        height={32}
                        viewBox="0 0 250 32"
                        backgroundColor={bgColor}
                        foregroundColor={fgColor}
                    >
                        <rect x="0" y="4" rx="4" ry="4" width="24" height="24" />
                        <rect x="36" y="4" rx="4" ry="4" width="180" height="24" />
                    </ContentLoader>
                </div>

                <div className="flex items-center gap-2">
                    <ContentLoader
                         speed={2}
                         width={320}
                         height={36}
                         viewBox="0 0 320 36"
                         backgroundColor={bgColor}
                         foregroundColor={fgColor}
                     >
                         <rect x="0" y="0" rx="4" ry="4" width="36" height="36" />
                         <rect x="44" y="0" rx="8" ry="8" width="110" height="36" />
                         <rect x="162" y="0" rx="8" ry="8" width="110" height="36" />
                     </ContentLoader>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Skeleton */}
                <div className="w-80 shrink-0 border-r border-zinc-200 dark:border-white/10 p-4 space-y-8">
                     <ContentLoader
                        speed={2}
                        width={288}
                        height={600}
                        viewBox="0 0 288 600"
                        backgroundColor={bgColor}
                        foregroundColor={fgColor}
                    >
                        {/* Navigation Tabs */}
                        <rect x="0" y="0" rx="10" ry="10" width="140" height="36" />
                        <rect x="148" y="0" rx="10" ry="10" width="140" height="36" />

                        {/* Search / Tree Header */}
                        <rect x="0" y="60" rx="4" ry="4" width="120" height="12" />
                        
                        {/* Tree Items */}
                        <rect x="0" y="86" rx="6" ry="6" width="288" height="32" />
                        <rect x="0" y="126" rx="6" ry="6" width="288" height="32" />
                        <rect x="0" y="166" rx="6" ry="6" width="288" height="32" />
                        <rect x="0" y="206" rx="6" ry="6" width="288" height="32" />
                        <rect x="0" y="246" rx="6" ry="6" width="288" height="32" />
                        
                        {/* Bottom Actions Label */}
                        <rect x="0" y="320" rx="4" ry="4" width="80" height="10" />
                        <rect x="0" y="340" rx="8" ry="8" width="288" height="40" />
                    </ContentLoader>
                </div>

                {/* Main Content Area Skeleton */}
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <ContentLoader
                            speed={2}
                            width={896} // max-w-4xl
                            height={800}
                            viewBox="0 0 896 800"
                            backgroundColor={bgColor}
                            foregroundColor={fgColor}
                            className="w-full h-auto"
                        >
                            {/* Workflow Stages Header Card */}
                            <rect x="0" y="0" rx="16" ry="16" width="896" height="100" />
                            
                            {/* Stages List */}
                            <rect x="0" y="130" rx="12" ry="12" width="896" height="72" />
                            <rect x="0" y="214" rx="12" ry="12" width="896" height="72" />
                            <rect x="0" y="298" rx="12" ry="12" width="896" height="72" />
                            <rect x="0" y="382" rx="12" ry="12" width="896" height="72" />
                            <rect x="0" y="466" rx="12" ry="12" width="896" height="72" />
                        </ContentLoader>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PipelineEditorSkeleton;
