import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Textarea } from '../../components/textarea';
import { JobService } from '../../services/JobService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmploymentType } from '../../types/jobs';

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    employmentType: 'Full-time' as EmploymentType,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return; // Simple validation

    const newJob = JobService.createJob(formData);
    navigate(`/jobs/${newJob.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Heading className="mb-8">Create New Job</Heading>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Fieldset>
          <Field>
            <Label>Job Title</Label>
            <Input 
              required
              name="title"
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </Field>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field>
              <Label>Location</Label>
              <Input 
                required
                name="location"
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
              />
            </Field>

            <Field>
              <Label>Employment Type</Label>
              <Select 
                name="employmentType"
                value={formData.employmentType}
                onChange={e => setFormData({...formData, employmentType: e.target.value as EmploymentType})}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </Select>
            </Field>
          </div>

          <Field>
            <Label>Description</Label>
            <Textarea 
              rows={6}
              name="description"
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </Field>
        </Fieldset>

        <div className="flex gap-4">
          <Button type="submit" color="indigo">Save Draft</Button>
          <Button plain onClick={() => navigate('/jobs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
