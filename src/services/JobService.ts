import { Job, JobPosting, PostingStatus } from '../types/jobs';

// In-memory storage
let jobs: Job[] = [];
let postingsByJobId: Record<string, Record<string, JobPosting>> = {};

// Initial seed data for testing
const seedData = () => {
    if (jobs.length > 0) return;
    
    jobs.push({
        id: 'job-1',
        title: 'Senior Frontend Engineer',
        location: 'Helsinki',
        employmentType: 'Full-time',
        description: 'We are looking for a React expert...',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    jobs.push({
        id: 'job-2',
        title: 'Marketing Specialist',
        location: 'Remote',
        employmentType: 'Contract',
        description: 'Help us grow our brand...',
        status: 'open',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    });
};

seedData();

export const JobService = {
    getAllJobs: (): Job[] => {
        return [...jobs];
    },

    getJob: (id: string): Job | undefined => {
        return jobs.find(j => j.id === id);
    },

    createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Job => {
        const newJob: Job = {
            id: `job-${Date.now()}`,
            ...jobData,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        jobs.push(newJob);
        return newJob;
    },

    updateJob: (id: string, updates: Partial<Job>): Job | undefined => {
        const index = jobs.findIndex(j => j.id === id);
        if (index === -1) return undefined;

        jobs[index] = {
            ...jobs[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return jobs[index];
    },

    deleteJob: (id: string): boolean => {
        const initialLength = jobs.length;
        jobs = jobs.filter(j => j.id !== id);
        return jobs.length < initialLength;
    },

    // Postings
    getPostingsForJob: (jobId: string): Record<string, JobPosting> => {
        return postingsByJobId[jobId] || {};
    },

    getPosting: (jobId: string, channelId: string): JobPosting | undefined => {
        return postingsByJobId[jobId]?.[channelId];
    },

    savePosting: (jobId: string, posting: JobPosting): JobPosting => {
        if (!postingsByJobId[jobId]) {
            postingsByJobId[jobId] = {};
        }
        postingsByJobId[jobId][posting.channelId] = {
            ...posting,
            lastUpdatedAt: new Date().toISOString(),
        };
        return postingsByJobId[jobId][posting.channelId];
    },

    updatePostingStatus: (jobId: string, channelId: string, status: PostingStatus, error?: string): void => {
        if (!postingsByJobId[jobId]?.[channelId]) return;
        
        postingsByJobId[jobId][channelId] = {
            ...postingsByJobId[jobId][channelId],
            status,
            error,
            lastUpdatedAt: new Date().toISOString(),
        };
    }
};
