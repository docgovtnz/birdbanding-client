import { Status } from '../../people/people-data';

export interface CreateUpdateProject {
  name: string;
  projectManagerName: string;
  projectManagerId: string;
  organisation: string;
  isDocProject: boolean;
  permitNumber: string;
  permitExpiryDate: Date;
  description: string;
  isMoratorium: boolean;
  location: string;
  moratoriumEndDate: Date;
  projectState: string;
}

export interface ApiCreateProject {
  project_state: string;
  name: string;
  description: string;
  default_moratorium_expiry: string;
  organisation: string;
  coordinator_id: string;
  is_doc_project: boolean;
  location: string;
  permit_id: string;
  permit_expiry: string;
}

export interface ApiProject {
  id: string;
  description: string;
  project_state: string;
  name: string;
  coordinator_id: string;
  row_creation_timestamp_: string;
  location: string;
  count: number;
  project_manager_person_name: string;
  default_moratorium_expiry: string;
  is_doc_project: boolean;
  project_event_count: number;
  project_membership_count: number;
  organisation: string;
}

export interface ApiProjectDetails extends ApiProject {
  permit_id: string;
  permit_expiry: string;
  project_bander_membership: ApiMember[];
}

export interface ApiMember {
  row_creation_timestamp_: string;
  bander_id: string;
  bander: ApiBander;
}
export interface ApiBander {
  bander_state: Status;
  nznbbs_certification_number: string;
  person_name: string;
}

export interface Project {
  id: string;
  description: string;
  status: ProjectStatus;
  state: string;
  name: string;
  projectManager: {
    name: string;
    id: string;
  };
  dateCreated: Date;
  numberOfRecords: number;
  numberOfMembers: number;
  moratorium: boolean;
  moratoriumExpiry: Date;
  location: string;
  isDocProject: boolean;
  organisation: string;
}

export interface Member {
  membershipState: Status;
  id: string;
  joined: Date;
  certificationNumber: string;
  name: string;
  hasJoined: boolean;
}

export interface ProjectDetails extends Project {
  permitId: string;
  permitExpiry: Date;
  projectMembers: Member[];
}

export enum ProjectStatus {
  ALL,
  ACTIVE,
  AWAITING_APPROVAL,
  INACTIVE
}

export enum ProjectMembershipUpdateType {
  ADD = 'add',
  REMOVE = 'remove'
}
