import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { RecruitingJob } from '../../types/recruiting';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Text } from '../../components/text';
import { Heading } from '../../components/heading';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';

export default function RecruitingJobsList() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const db = getDatabaseService();

  const [jobs, setJobs] = useState<RecruitingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!orgId) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsPath = `orgs/${orgId}/modules/hire/jobs`;
        // Fetch jobs sorted by updatedAt desc
        const jobsData = await db.getDocuments<any>(jobsPath, {
            sortBy: { field: 'updatedAt', order: 'desc' }
        });
        
        // Map to RecruitingJob
        const mappedJobs: RecruitingJob[] = jobsData.map((doc: any) => ({
            id: doc.id,
            title: doc.data?.name || doc.name || 'Untitled Job', // Fallback
            location: doc.data?.location || 'Remote', // Fallback
            status: doc.status || 'draft',
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt
        }));

        // Fetch counts for each job (Approach B)
        // Optimization: limit to top 20 or similar if needed, but for now fetch all
        const jobsWithCounts = await Promise.all(mappedJobs.map(async (job) => {
            try {
                // Postings (jobPostings where jobId == job.id)
                // Assuming path: orgs/:orgId/modules/hire/jobPostings
                // Note: user instructions said "query /jobPostings", assuming under module based on context
                const postingsPath = `orgs/${orgId}/modules/hire/jobPostings`;
                // Just need count. Firestore typically doesn't give count easily without reading.
                // WE might need to just read IDs or use limit if strict.
                // Assuming small scale for "internal UI".
                const postings = await db.getDocuments(postingsPath, {
                    constraints: [{ field: 'jobId', operator: '==', value: job.id }]
                });

                // Applicants (applications where jobId == job.id)
                const applicationsPath = `orgs/${orgId}/modules/hire/applications`;
                const applications = await db.getDocuments(applicationsPath, {
                     constraints: [{ field: 'jobId', operator: '==', value: job.id }]
                });

                return {
                    ...job,
                    postingsCount: postings.length,
                    applicantsCount: applications.length
                };
            } catch (e) {
                console.error(`Failed to fetch counts for job ${job.id}`, e);
                return { ...job, postingsCount: 0, applicantsCount: 0 };
            }
        }));

        setJobs(jobsWithCounts);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [orgId]);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <Heading>Recruiting</Heading>
            <Text>Manage jobs and applicants</Text>
        </div>
        <div className="w-64">
             <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input 
                    className="pl-9" 
                    placeholder="Search jobs..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeader>Job Title</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Postings</TableHeader>
                    <TableHeader>Applicants</TableHeader>
                    <TableHeader>Updated</TableHeader>
                    <TableHeader>Actions</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {loading ? (
                    // Skeleton rows
                    [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-20 bg-zinc-100 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-16 bg-zinc-100 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-8 bg-zinc-100 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-8 bg-zinc-100 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-8 w-16 bg-zinc-100 rounded animate-pulse" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredJobs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                            No jobs found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredJobs.map(job => (
                        <TableRow key={job.id} href={`/orgs/${orgId}/recruiting/${job.id}`} className="cursor-pointer">
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell className="text-zinc-500">{job.location}</TableCell>
                            <TableCell>
                                <Badge color={job.status === 'open' ? 'green' : job.status === 'closed' ? 'red' : 'zinc'}>
                                    {job.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{job.postingsCount || 0}</TableCell>
                            <TableCell>{job.applicantsCount || 0}</TableCell>
                            <TableCell className="text-zinc-500 text-sm">
                                {new Date(job.updatedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button plain onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation(); // Link on row handles it, but just in case
                                    navigate(`/orgs/${orgId}/recruiting/${job.id}`)
                                }}>
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
