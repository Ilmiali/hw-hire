import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import NProgress from 'nprogress';
import { ResourceListView } from '../../database-components/resource-list-view';
import { TemplateSelector } from './components/TemplateSelector';
import { FormTemplate } from './templates/types';
import { createResource } from '../../store/slices/resourceSlice';
import { AppDispatch } from '../../store';

export default function FormsList() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  if (!orgId) return null;

  const handleTemplateSelect = async (template: FormTemplate) => {
    if (!orgId) return;
    
    setIsCreating(true);
    NProgress.start();
    
    try {
      // Use the template's structure generator
      const initialDraftGenerator = (id: string) => ({
        id,
        title: template.name === 'Blank Form' ? 'New Form' : template.name,
        ...template.structure
      });

      const result = await dispatch(createResource({ 
        orgId, 
        moduleId: 'hire', 
        resourceType: 'forms',
        data: { 
          name: template.name === 'Blank Form' ? 'New Form' : template.name,
          description: template.description 
        },
        initialDraftData: initialDraftGenerator
      })).unwrap();
      
      if (result.resource.id) {
        navigate(`/orgs/${orgId}/forms/${result.resource.id}`);
      }
    } catch (error) {
       console.error(`Failed to create form`, error);
    } finally {
       setIsCreating(false);
       setShowTemplates(false);
       NProgress.done();
    }
  };

  return (
    <>
      <ResourceListView
        title="Forms"
        orgId={orgId}
        moduleId="hire"
        resourceType="forms"
        resourceName="Form"
        onCreate={() => setShowTemplates(true)}
        initialDraftGenerator={() => ({})} // Not used when onCreate is provided
        onRowClick={(resource: any) => navigate(`/orgs/${orgId}/forms/${resource.id}`)}
      />
      
      <TemplateSelector 
        open={showTemplates}
        onSelect={handleTemplateSelect}
        onCancel={() => !isCreating && setShowTemplates(false)}
      />
    </>
  );
}
