export interface JobFormValues {
  title: string;
  skills: string; // ID of selected skill
  type: string; // ID of selected job type
  locations: string; // ID of selected location
  description: string;
  recruiters?: string;
  salary?: string;
  salaryType?: string;
  maxApplicants?: string;
}
