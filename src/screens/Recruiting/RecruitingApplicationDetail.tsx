import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { RecruitingApplication } from '../../types/recruiting';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { DescriptionList, DescriptionDetails, DescriptionTerm } from '../../components/description-list';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';

interface RecruitingApplicationDetailProps {
    applicationId?: string;
    embedded?: boolean;
    onClose?: () => void;
}

export default function RecruitingApplicationDetail({ applicationId: propAppId, embedded = false, onClose }: RecruitingApplicationDetailProps) {
  const { orgId, applicationId: paramAppId } = useParams<{ orgId: string; applicationId: string }>();
  const applicationId = propAppId || paramAppId;
  const navigate = useNavigate();
  const db = getDatabaseService();

  const [application, setApplication] = useState<RecruitingApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId || !applicationId) return;

    const fetchApp = async () => {
      setLoading(true);
      try {
        const appsPath = `orgs/${orgId}/modules/hire/applications`;
        const appDoc = await db.getDocument<any>(appsPath, applicationId);
        
        if (appDoc) {
             setApplication({
                ...appDoc,
                id: appDoc.id,
                answers: appDoc.answers || appDoc.data?.answers || {}
             });
        }
      } catch (error) {
        console.error("Failed to fetch application", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [orgId, applicationId]);

  if (loading) return <div className="p-8">Loading application...</div>;
  if (!application) return <div className="p-8">Application not found.</div>;

  const getCandidateName = (app: RecruitingApplication) => {
      const { answers } = app;
      if (!answers) return 'Unknown Candidate';
      
      // 1. Try common full name keys
      const candidateName = answers.fullName || answers.name || answers['Full Name'] || answers['Name'];
      if (candidateName) return candidateName;

      // 2. Try joining first and last name
      const firstName = answers.firstName || answers.firstname || answers['First Name'];
      const lastName = answers.lastName || answers.lastname || answers['Last Name'];
      
      if (firstName || lastName) {
          return [firstName, lastName].filter(Boolean).join(' ');
      }

      // 3. Try email as last resort fallback
      if (answers.email || answers.Email) return answers.email || answers.Email;

      return 'Unknown Candidate';
  };

  const name = getCandidateName(application);

  return (
    <div className={`p-8 ${embedded ? 'p-4 max-w-none' : 'max-w-4xl mx-auto'} space-y-8`}>
       {!embedded && (
       <div className="flex items-center gap-4">
        <Button plain onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
        </Button>
      </div>
       )}
       {embedded && onClose && (
           <div className="flex justify-end mb-2">
               <Button plain onClick={onClose} className="text-zinc-500">
                   Close
               </Button>
           </div>
       )}

       <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
           {!embedded && (
           <div className="flex justify-between items-start mb-8">
                <div>
                    <Heading>{name}</Heading>
                    <div className="mt-2 flex gap-3 text-sm text-zinc-500">
                        <Text>Applied {new Date(application.createdAt).toLocaleString()}</Text>
                        <span>•</span>
                        <Text>via {application.source || 'Direct'}</Text>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge color="blue">{application.currentStageId || 'New'}</Badge>
                </div>
           </div>
           )}

           <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                <Heading level={2} className="mb-6">Application Details</Heading>
                
                <DescriptionList>
                    {Object.entries(application.answers).map(([key, value]) => {
                        // Skip if value is complex object/files for now, or JSON stringify
                        const displayValue = (typeof value === 'object') ? JSON.stringify(value) : String(value);
                        
                        // Clean up key name if it's a slug or ID
                        // Check if key is "fullName" -> "Full Name"
                        // Very basic formatter
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                        return (
                            <React.Fragment key={key}>
                                <DescriptionTerm>{label}</DescriptionTerm>
                                <DescriptionDetails>{displayValue}</DescriptionDetails>
                            </React.Fragment>
                        );
                    })}
                     
                     <DescriptionTerm>Application ID</DescriptionTerm>
                     <DescriptionDetails><span className="font-mono text-xs text-zinc-400">{application.id}</span></DescriptionDetails>
                </DescriptionList>
           </div>
      </div>
    </div>
  );
}
