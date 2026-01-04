export interface FormTemplate {
  id: string;
  name: string;
  type: import('../../../types/forms').FormType;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  structure: {
    pages: Array<{
      id: string;
      title: string;
      sections: any[]; 
    }>;
    rules: any[];
  }
}
