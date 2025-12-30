import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { JobService } from '../../services/JobService';
import { useEffect, useState } from 'react';
import { Job } from '../../types/jobs';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/badge';

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Determine if we need to subscribe or just fetch once. 
    // Since it's in-memory and we might come back, fetching on mount is fine.
    setJobs(JobService.getAllJobs());
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Heading>Jobs</Heading>
        <Button onClick={() => navigate('/jobs/new')}>
          <PlusIcon />
          Create job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">No jobs found. Create your first job posting.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Location</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Updated At</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <Badge color={
                    job.status === 'open' ? 'green' : 
                    job.status === 'closed' ? 'red' : 'zinc'
                  }>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(job.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button outline onClick={() => navigate(`/jobs/${job.id}`)}>
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
