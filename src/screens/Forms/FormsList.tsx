import { useNavigate, useParams } from 'react-router-dom';
import { ResourceListView } from '../../database-components/resource-list-view';

export default function FormsList() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  
  if (!orgId) return null;

  const initialDraftGenerator = (id: string) => ({
    id,
    title: 'New Form',
    pages: [{ id: 'page-1', title: 'Page 1', sections: [] }],
    rules: []
  });

  return (
    <ResourceListView
      title="Forms"
      orgId={orgId}
      moduleId="hire"
      resourceType="forms"
      resourceName="Form"
      initialDraftGenerator={initialDraftGenerator}
      onRowClick={(resource: any) => navigate(`/orgs/${orgId}/forms/${resource.id}`)}
    />
  );
}
