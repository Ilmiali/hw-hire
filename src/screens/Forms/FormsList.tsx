import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/badge';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchForms, createForm } from '../../store/slices/formsSlice';
import NProgress from 'nprogress';

export default function FormsList() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { forms, loading } = useSelector((state: RootState) => state.forms);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (orgId) {
      dispatch(fetchForms(orgId));
    }
  }, [dispatch, orgId]);

  const handleCreateForm = async () => {
    if (!orgId) return;
    
    setIsCreating(true);
    NProgress.start();
    
    try {
      const result = await dispatch(createForm({ 
        orgId, 
        name: 'New Form', 
        description: '' 
      })).unwrap();
      
      if (result.id) {
        navigate(`/orgs/${orgId}/forms/${result.id}`);
      }
    } catch (error) {
       console.error("Failed to create form", error);
    } finally {
       setIsCreating(false);
       NProgress.done();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Heading>Forms</Heading>
        <Button onClick={handleCreateForm} disabled={isCreating}>
          <PlusIcon />
          {isCreating ? 'Creating...' : 'Create Form'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">Loading forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">No forms found. Create your first form.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Published Version</TableHeader>
              <TableHeader>Updated At</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.name}</TableCell>
                <TableCell>
                  <Badge color={form.status === 'active' ? 'green' : 'zinc'}>
                    {form.status}
                  </Badge>
                </TableCell>
                <TableCell>{form.publishedVersionId || 'None'}</TableCell>
                <TableCell>{new Date(form.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button outline onClick={() => navigate(`/orgs/${orgId}/forms/${form.id}`)}>
                    Edit
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
