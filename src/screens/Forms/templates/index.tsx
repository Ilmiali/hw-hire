import { FormTemplate } from './types';
import { DocumentPlusIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export const templates: FormTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Form',
    description: 'Start from scratch with an empty form.',
    icon: <DocumentPlusIcon className="w-6 h-6" />,
    tags: ['Basic'],
    structure: {
      pages: [{ id: 'page-1', title: 'Page 1', sections: [] }],
      rules: []
    }
  },
  {
    id: 'contact',
    name: 'Contact Us',
    description: 'A simple contact form with name, email, and message fields.',
    icon: <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />,
    tags: ['Business', 'Simple'],
    structure: {
      pages: [{ 
        id: 'page-1', 
        title: 'Contact Information', 
        sections: [
          {
            id: 'sec-1',
            title: 'General Details',
            rows: [
              {
                id: 'row-1',
                fields: [
                  {
                    id: 'f-1',
                    type: 'text',
                    label: 'Full Name',
                    required: true,
                    placeholder: 'John Doe'
                  }
                ]
              },
              {
                id: 'row-2',
                fields: [
                  {
                    id: 'f-2',
                    type: 'email',
                    label: 'Email Address',
                    required: true,
                    placeholder: 'john@example.com'
                  }
                ]
              },
              {
                id: 'row-3',
                fields: [
                  {
                    id: 'f-3',
                    type: 'textarea',
                    label: 'Message',
                    required: true,
                    placeholder: 'How can we help you?'
                  }
                ]
              }
            ]
          }
        ] 
      }],
      rules: []
    }
  },
  {
    id: 'feedback',
    name: 'Feedback Survey',
    description: 'Collect user feedback with rating and comment fields.',
    icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
    tags: ['Survey'],
    structure: {
      pages: [{ 
        id: 'page-1', 
        title: 'Feedback', 
        sections: [
          {
            id: 'sec-1',
            title: 'Your Experience',
            rows: [
              {
                id: 'row-1',
                fields: [
                  {
                    id: 'f-1',
                    type: 'radio',
                    label: 'Overall Satisfaction',
                    required: true,
                    options: [
                      { label: 'Very Satisfied', value: '5' },
                      { label: 'Satisfied', value: '4' },
                      { label: 'Neutral', value: '3' },
                      { label: 'Unsatisfied', value: '2' },
                      { label: 'Very Unsatisfied', value: '1' }
                    ]
                  }
                ]
              },
              {
                id: 'row-2',
                fields: [
                    {
                        id: 'f-2',
                        type: 'textarea',
                        label: 'What can we improve?',
                        required: false
                    }
                ]
              }
            ]
          }
        ] 
      }],
      rules: []
    }
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Standard job application form with resume upload.',
    icon: <UserGroupIcon className="w-6 h-6" />,
    tags: ['HR', 'Hiring'],
    structure: {
      pages: [{ 
        id: 'page-1', 
        title: 'Application Form', 
        sections: [
          {
            id: 'sec-1',
            title: 'Personal Information',
            rows: [
              {
                id: 'row-1',
                fields: [
                  {
                    id: 'f-1',
                    type: 'text',
                    label: 'Full Name',
                    required: true
                  },
                  {
                    id: 'f-2',
                    type: 'email',
                    label: 'Email',
                    required: true
                  }
                ]
              },
              {
                id: 'row-2',
                fields: [
                  {
                    id: 'f-4',
                    type: 'file',
                    label: 'Resume/CV',
                    required: true,
                    multiple: false
                  }
                ]
              },
              {
                id: 'row-3',
                fields: [
                  {
                    id: 'f-3',
                    type: 'text',
                    label: 'LinkedIn Profile',
                    required: false,
                    placeholder: 'https://linkedin.com/in/...'
                  }
                ]
              }
            ]
          }
        ] 
      }],
      rules: []
    }
  }
];
