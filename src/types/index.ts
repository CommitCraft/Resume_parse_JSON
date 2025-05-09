export interface PersonData {
  name?: string;
  email?: string;
  phone?: string;
  education?: EducationItem[];
  skills?: string[];
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
}

export interface EducationItem {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ProjectItem {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
}