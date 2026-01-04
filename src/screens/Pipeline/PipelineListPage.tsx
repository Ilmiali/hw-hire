import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResourceListView } from '../../database-components/resource-list-view';
import { CreatePipelineFullFlow } from './components/CreatePipelineFullFlow';

export default function PipelineListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);

  if (!orgId) return null;

  return (
    <>
      <ResourceListView
          title="Pipelines"
          description="Manage your recruitment workflows."
          orgId={orgId}
          moduleId="hire"
          resourceType="pipelines"
          resourceName="Pipeline"
          onCreate={() => setIsCreationFlowOpen(true)}
          onRowClick={(resource: any) => navigate(`/orgs/${orgId}/pipelines/${resource.id}`)}
      />
      
      {isCreationFlowOpen && (
        <CreatePipelineFullFlow 
          orgId={orgId}
          isOpen={isCreationFlowOpen}
          onClose={() => setIsCreationFlowOpen(false)}
        />
      )}
    </>
  );
}
