import { FormTemplate } from './types';
import { DocumentPlusIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentCheckIcon, UserGroupIcon, BriefcaseIcon, AcademicCapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
  },
  {
    id: 'job-application-full',
    name: 'Advanced Job Application',
    description: 'Comprehensive application with experience, education, and screening questions.',
    icon: <BriefcaseIcon className="w-6 h-6" />,
    tags: ['HR', 'Hiring', 'Multi-page'],
    structure: {
      pages: [
        { 
          id: 'page-1', 
          title: 'Personal Details', 
          sections: [
            {
              id: 'sec-1',
              title: 'Contact Information',
              rows: [
                {
                  id: 'row-1',
                  fields: [
                    { id: 'f-1', type: 'text', label: 'First Name', required: true, width: 'basis-1/2' },
                    { id: 'f-2', type: 'text', label: 'Last Name', required: true, width: 'basis-1/2' }
                  ]
                },
                {
                  id: 'row-2',
                  fields: [
                    { id: 'f-3', type: 'email', label: 'Email Address', required: true, width: 'basis-1/2' },
                    { id: 'f-4', type: 'text', label: 'Phone Number', required: true, width: 'basis-1/2' }
                  ]
                },
                {
                  id: 'row-3',
                  fields: [
                    { id: 'f-5', type: 'text', label: 'Portfolio / Website', required: false },
                    { id: 'f-6', type: 'text', label: 'LinkedIn Profile', required: false }
                  ]
                }
              ]
            }
          ] 
        },
        {
          id: 'page-2',
          title: 'Experience & Documents',
          sections: [
            {
              id: 'sec-2',
              title: 'Documents',
              rows: [
                {
                  id: 'row-4',
                  fields: [
                    { id: 'f-7', type: 'file', label: 'Resume / CV', required: true },
                    { id: 'f-8', type: 'file', label: 'Cover Letter', required: false }
                  ]
                }
              ]
            },
            {
              id: 'sec-3',
              title: 'Work Authorization',
              rows: [
                {
                  id: 'row-5',
                  fields: [
                    { 
                      id: 'f-9', 
                      type: 'radio', 
                      label: 'Are you legally authorized to work in this country?', 
                      required: true,
                      options: [
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'page-3',
          title: 'Final Details',
          sections: [
            {
              id: 'sec-4',
              title: 'Additional Questions',
              rows: [
                {
                  id: 'row-6',
                  fields: [
                    { id: 'f-10', type: 'date', label: 'Earliest Start Date', required: true },
                    { id: 'f-11', type: 'text', label: 'Desired Salary', required: false }
                  ]
                },
                {
                  id: 'row-7',
                  fields: [
                    { id: 'f-12', type: 'textarea', label: 'Why do you want to work here?', required: true }
                  ]
                }
              ]
            }
          ]
        }
      ],
      rules: []
    }
  },
  {
    id: 'interview-questionnaire',
    name: 'Interview Pre-Screen',
    description: 'Collect preliminary information from candidates before scheduling.',
    icon: <DocumentTextIcon className="w-6 h-6" />,
    tags: ['HR', 'Recruiting', 'Multi-page'],
    structure: {
      pages: [
        { 
          id: 'page-1', 
          title: 'Candidate Information', 
          sections: [
            {
              id: 'sec-1',
              title: 'Basic Info',
              rows: [
                {
                  id: 'row-1',
                  fields: [
                    { id: 'f-1', type: 'text', label: 'Full Name', required: true },
                    { id: 'f-2', type: 'text', label: 'Position Applied For', required: true }
                  ]
                }
              ]
            }
          ] 
        },
        {
          id: 'page-2',
          title: 'Screening Questions',
          sections: [
            {
              id: 'sec-2',
              title: 'Logistics',
              rows: [
                {
                  id: 'row-2',
                  fields: [
                    { id: 'f-3', type: 'text', label: 'Current Notice Period', required: true },
                    { id: 'f-4', type: 'text', label: 'Salary Expectations', required: true }
                  ]
                },
                {
                  id: 'row-3',
                  fields: [
                    { 
                      id: 'f-5', 
                      type: 'checkbox', 
                      label: 'Preferred Work Arrangements', 
                      options: [
                        { label: 'Remote', value: 'remote' },
                        { label: 'Hybrid', value: 'hybrid' },
                        { label: 'On-site', value: 'onsite' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'sec-3',
              title: 'Background',
              rows: [
                {
                  id: 'row-4',
                  fields: [
                    { id: 'f-6', type: 'textarea', label: 'Briefly describe your relevant experience', required: true }
                  ]
                }
              ]
            }
          ]
        }
      ],
      rules: []
    }
  },
  {
    id: 'general-questionnaire',
    name: 'General Questionnaire',
    description: 'A structural survey for deep data collection.',
    icon: <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />,
    tags: ['Survey', 'Research', 'Multi-page'],
    structure: {
      pages: [
        { 
          id: 'page-1', 
          title: 'Participant Details', 
          sections: [
            {
              id: 'sec-1',
              title: 'About You',
              rows: [
                {
                  id: 'row-1',
                  fields: [
                    { id: 'f-1', type: 'text', label: 'Name (Optional)', required: false },
                    { 
                      id: 'f-2', 
                      type: 'select', 
                      label: 'Age Group', 
                      options: [
                        { label: '18-24', value: '18-24' },
                        { label: '25-34', value: '25-34' },
                        { label: '35-44', value: '35-44' },
                        { label: '45+', value: '45+' }
                      ]
                    }
                  ]
                }
              ]
            }
          ] 
        },
        {
          id: 'page-2',
          title: 'Questions',
          sections: [
            {
              id: 'sec-2',
              title: 'Preferences',
              rows: [
                {
                  id: 'row-2',
                  fields: [
                    { 
                      id: 'f-3', 
                      type: 'radio', 
                      label: 'How often do you use our products?', 
                      options: [
                        { label: 'Daily', value: 'daily' },
                        { label: 'Weekly', value: 'weekly' },
                        { label: 'Rarely', value: 'rarely' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'sec-3',
              title: 'Detailed Feedback',
              rows: [
                {
                  id: 'row-3',
                  fields: [
                    { id: 'f-4', type: 'textarea', label: 'Please describe your typical workflow', required: true }
                  ]
                }
              ]
            }
          ]
        }
      ],
      rules: []
    }
  },
  {
    id: 'skill-assessment',
    name: 'Skill Assessment',
    description: 'Evaluate technical or general skills with a multi-part quiz.',
    icon: <AcademicCapIcon className="w-6 h-6" />,
    tags: ['Education', 'HR', 'Exam'],
    structure: {
      pages: [
        { 
          id: 'page-1', 
          title: 'Instructions', 
          sections: [
            {
              id: 'sec-1',
              title: 'Welcome',
              rows: [
                {
                  id: 'row-1',
                  fields: [
                    { id: 'f-1', type: 'text', label: 'Candidate Name', required: true },
                    { id: 'f-2', type: 'text', label: 'Access Code', required: true }
                  ]
                }
              ]
            }
          ] 
        },
        {
          id: 'page-2',
          title: 'Section 1: General Knowledge',
          sections: [
            {
              id: 'sec-2',
              title: 'Logical Reasoning',
              rows: [
                {
                  id: 'row-2',
                  fields: [
                    { 
                      id: 'f-3', 
                      type: 'radio', 
                      label: 'Question 1: Select the next number in the sequence: 2, 4, 8, 16...', 
                      options: [
                        { label: '24', value: '24' },
                        { label: '32', value: '32' },
                        { label: '64', value: '64' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'page-3',
          title: 'Section 2: Technical Skills',
          sections: [
            {
              id: 'sec-3',
              title: 'Coding Proficiency',
              rows: [
                {
                  id: 'row-3',
                  fields: [
                    { 
                      id: 'f-4', 
                      type: 'textarea', 
                      label: 'Explain the difference between interface and type in TypeScript.', 
                      required: true 
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      rules: []
    }
  }
];
