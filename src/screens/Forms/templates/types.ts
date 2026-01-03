export interface FormTemplate {
  id: string;
  name: string;
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
