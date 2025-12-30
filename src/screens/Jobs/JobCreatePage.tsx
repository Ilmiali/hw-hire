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
import { CoverPicker } from './components/CoverPicker';

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    employmentType: 'Full-time' as EmploymentType,
    description: '',
    coverImage: undefined as string | undefined,
  });

  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return; // Simple validation

    const newJob = JobService.createJob(formData);
    navigate(`/jobs/${newJob.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl p-0 md:p-8">
      <div className="bg-white dark:bg-zinc-950 md:rounded-xl border md:border-zinc-200 md:dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Cover Image Section */}
        <div className="relative group h-48 md:h-64 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          {formData.coverImage ? (
            <img 
              src={formData.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">No cover image</span>
            </div>
          )}
          
          <div className="absolute bottom-4 left-8 md:bottom-6 md:left-12 flex items-center gap-2">
            <div className="relative">
              <Button 
                plain 
                className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm transition-opacity"
                onClick={() => setShowPicker(!showPicker)}
              >
                {formData.coverImage ? 'Change cover' : 'Add cover'}
              </Button>
              {showPicker && (
                <CoverPicker
                  currentCover={formData.coverImage}
                  onSelect={(url) => setFormData({ ...formData, coverImage: url })}
                  onRemove={() => setFormData({ ...formData, coverImage: undefined })}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </div>
            {formData.coverImage && (
              <Button 
                plain 
                className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm"
                onClick={() => setFormData({ ...formData, coverImage: undefined })}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <Heading className="mb-8">Create New Job</Heading>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <Fieldset>
              <Field>
                <Label>Job Title</Label>
                <Input 
                  required
                  name="title"
                  placeholder="e.g. Senior Product Designer"
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
                    placeholder="e.g. Helsinki (Hybrid)"
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
                  rows={8}
                  name="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </Field>
            </Fieldset>

            <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <Button type="submit" color="indigo" className="px-8">Create Job</Button>
              <Button plain onClick={() => navigate('/jobs')}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
