import { PipelineTemplate } from './types';
import { QueueListIcon, UserGroupIcon, CodeBracketIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { DEFAULT_STAGES } from '../../../types/pipeline';

export const templates: PipelineTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Recruitment',
    description: 'The classic hiring pipeline suitable for most roles.',
    icon: <QueueListIcon className="w-6 h-6" />,
    tags: ['General', 'Default'],
    stages: DEFAULT_STAGES
  },
  {
    id: 'high-volume',
    name: 'High Volume Hiring',
    description: 'A simplified pipeline designed for processing many candidates quickly.',
    icon: <UserGroupIcon className="w-6 h-6" />,
    tags: ['Retail', 'Support'],
    stages: [
      { id: '1', name: 'Applied', order: 0, type: 'normal', color: '#3B82F6' },
      { id: '2', name: 'Review', order: 1, type: 'normal', color: '#F59E0B' },
      { id: '3', name: 'Hired', order: 2, type: 'terminal', color: '#059669' },
      { id: '4', name: 'Rejected', order: 3, type: 'terminal', color: '#EF4444' }
    ]
  },
  {
    id: 'tech-hiring',
    name: 'Tech Hiring',
    description: 'Specialized workflow with technical assessment stages.',
    icon: <CodeBracketIcon className="w-6 h-6" />,
    tags: ['Engineering', 'IT'],
    stages: [
      { id: '1', name: 'Applied', order: 0, type: 'normal', color: '#3B82F6' },
      { id: '2', name: 'Screening', order: 1, type: 'normal', color: '#8B5CF6' },
      { id: '3', name: 'Code Challenge', order: 2, type: 'normal', color: '#6366F1' },
      { id: '4', name: 'System Design', order: 3, type: 'normal', color: '#EC4899' },
      { id: '5', name: 'Culture Fit', order: 4, type: 'normal', color: '#F59E0B' },
      { id: '6', name: 'Offer', order: 5, type: 'normal', color: '#10B981' },
      { id: '7', name: 'Hired', order: 6, type: 'terminal', color: '#059669' },
      { id: '8', name: 'Rejected', order: 7, type: 'terminal', color: '#EF4444' }
    ]
  },
  {
    id: 'executive-search',
    name: 'Executive Search',
    description: 'Rigorous process for leadership roles with deep vetting.',
    icon: <BriefcaseIcon className="w-6 h-6" />,
    tags: ['Leadership', 'C-Level'],
    stages: [
      { id: '1', name: 'Sourced', order: 0, type: 'normal', color: '#3B82F6' },
      { id: '2', name: 'Initial Contact', order: 1, type: 'normal', color: '#8B5CF6' },
      { id: '3', name: 'Panel Interview', order: 2, type: 'normal', color: '#F59E0B' },
      { id: '4', name: 'Board Review', order: 3, type: 'normal', color: '#7C3AED' },
      { id: '5', name: 'Reference Check', order: 4, type: 'normal', color: '#DB2777' },
      { id: '6', name: 'Negotiation', order: 5, type: 'normal', color: '#10B981' },
      { id: '7', name: 'Hired', order: 6, type: 'terminal', color: '#059669' },
      { id: '8', name: 'Rejected', order: 7, type: 'terminal', color: '#EF4444' }
    ]
  }
];
