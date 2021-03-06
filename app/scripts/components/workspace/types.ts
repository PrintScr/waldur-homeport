export interface User {
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
}

export interface UserDetails extends User {
  full_name: string;
  civil_number: string;
  phone_number: string;
  email: string;
  registration_method: string;
  preferred_language: string;
  competence: string;
  date_joined: string;
  job_title: string;
  is_support: boolean;
}

export interface Customer {
  uuid: string;
  url: string;
  owners: User[];
}

export interface Project {
  uuid: string;
  url: string;
}

export interface Workspace {
  user: User;
  customer?: Customer;
  project?: Project;
}

export interface OuterState {
  workspace: Workspace;
}
