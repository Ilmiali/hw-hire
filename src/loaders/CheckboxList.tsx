import React, { useEffect, useState } from 'react'
import ContentLoader, { IContentLoaderProps } from 'react-content-loader'

interface CheckboxListProps extends IContentLoaderProps {
  metadata?: {
    name: string;
    github: string;
    description: string;
    filename: string;
  };
}

const LINE_HEIGHT = 35; // Height of each line including spacing
const LINE_SPACING = 10; // Spacing between lines

const CheckboxList: React.FC<CheckboxListProps> = props => {
  const [containerHeight, setContainerHeight] = useState(150);
  const [containerWidth, setContainerWidth] = useState(400);
  const [lines, setLines] = useState<number[]>([]);

  useEffect(() => {
    const calculateDimensions = () => {
      const container = document.getElementById('checkbox-list-container');
      if (container) {
        const height = container.clientHeight;
        const width = container.clientWidth;
        setContainerHeight(height);
        setContainerWidth(width);
        const numberOfLines = Math.floor(height / LINE_HEIGHT);
        setLines(Array.from({ length: numberOfLines }, (_, i) => i));
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  return (
    <div id="checkbox-list-container" className="w-full h-full">
      <ContentLoader
        speed={2}
        width="100%"
        height={containerHeight}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        className="animate-pulse"
        backgroundColor="#e5e7eb"
        foregroundColor="#d1d5db"
        {...props}
      >
        {lines.map((index) => (
          <React.Fragment key={index}>
            <rect 
              x="8%" 
              y={index * LINE_HEIGHT + LINE_SPACING} 
              rx="5" 
              ry="5" 
              width="90%" 
              height="10" 
              className="dark:bg-gray-700 bg-gray-200" 
            />
            <rect 
              x="1%" 
              y={index * LINE_HEIGHT} 
              rx="4" 
              ry="4" 
              width="5%" 
              height="20" 
              className="dark:bg-gray-700 bg-gray-200" 
            />
          </React.Fragment>
        ))}
      </ContentLoader>
    </div>
  );
}

export const CheckboxListMetadata = {
  name: 'Manuela Garcia',
  github: 'ManuelaGar',
  description: 'This is a checkbox list loader.',
  filename: 'CheckboxList',
}

export default CheckboxList