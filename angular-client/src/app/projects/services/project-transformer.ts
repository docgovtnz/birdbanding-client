import {
  ApiCreateProject,
  ApiMember,
  ApiProject,
  ApiProjectDetails,
  CreateUpdateProject,
  Member,
  Project,
  ProjectDetails,
  ProjectStatus
} from './project-types';
import { isEmpty, isNil, not } from 'ramda';
import { format, getYear, isAfter, isBefore, parseISO, set } from 'date-fns';

export const apiProjectToProject = (apiProject: ApiProject): Project => {
  const moratoriumExpiry = isNil(apiProject.default_moratorium_expiry) ? null : parseISO(apiProject.default_moratorium_expiry);
  return {
    id: apiProject.id,
    description: apiProject.description,
    status: ProjectStatus[apiProject.project_state],
    state: apiProject.project_state,
    name: isNil(apiProject.name) || isEmpty(apiProject.name.trim()) ? '-' : apiProject.name,
    projectManager: {
      name: apiProject.project_manager_person_name,
      id: apiProject.coordinator_id
    },
    dateCreated: parseISO(apiProject.row_creation_timestamp_),
    numberOfRecords: apiProject.project_event_count,
    numberOfMembers: apiProject.project_membership_count,
    moratorium: isNil(moratoriumExpiry) ? false : isAfter(moratoriumExpiry, new Date()),
    moratoriumExpiry,
    location: apiProject.location,
    isDocProject: apiProject.is_doc_project,
    organisation: apiProject.organisation

  };
};

export const projectDetailsToCreateUpdateProject = (projectDetails: ProjectDetails): CreateUpdateProject => {
  return {
    description: projectDetails.description,
    isDocProject: projectDetails.isDocProject,
    isMoratorium: projectDetails.moratorium,
    location: projectDetails.location,
    name: projectDetails.name,
    organisation: projectDetails.organisation,
    permitExpiryDate: projectDetails.permitExpiry,
    permitNumber: projectDetails.permitId,
    projectManagerId: projectDetails.projectManager.id,
    projectManagerName: projectDetails.projectManager.name,
    moratoriumEndDate: projectDetails.moratoriumExpiry,
    projectState: projectDetails.state
  };
};

export const apiProjectDetailsToProjectDetails = (apiProject: ApiProjectDetails): ProjectDetails => {
  const moratoriumExpiry = isNil(apiProject.default_moratorium_expiry) ? null : parseISO(apiProject.default_moratorium_expiry);
  const projectMembers = apiProject.project_bander_membership ? apiProject.project_bander_membership.map(apiMemberToMember) : [];
  const permitExpiry = apiProject.permit_expiry ? parseISO(apiProject.permit_expiry) : null;
  return {
    id: apiProject.id,
    description: apiProject.description,
    status: ProjectStatus[apiProject.project_state],
    state: apiProject.project_state,
    isDocProject: apiProject.is_doc_project,
    name: apiProject.name,
    projectManager: {
      name: apiProject.project_manager_person_name,
      id: apiProject.coordinator_id
    },
    dateCreated: parseISO(apiProject.row_creation_timestamp_),
    numberOfRecords: apiProject.project_event_count,
    numberOfMembers: apiProject.project_membership_count,
    moratorium: isNil(moratoriumExpiry) ? false : isAfter(moratoriumExpiry, new Date()),
    moratoriumExpiry,
    location: apiProject.location,
    organisation: apiProject.organisation,
    permitExpiry,
    permitId: apiProject.permit_id,
    projectMembers
  };
};

export const apiMemberToMember = (member: ApiMember): Member => {
  const hasJoined = not(isNil(member.row_creation_timestamp_));
  const joined = hasJoined ? parseISO(member.row_creation_timestamp_) : null;
  return {
    id: member.bander_id,
    membershipState: member.bander.bander_state,
    certificationNumber: member.bander.nznbbs_certification_number,
    name: member.bander.person_name,
    hasJoined,
    joined
  };
};

export const createProjectToApiCreateProject = (project: CreateUpdateProject): ApiCreateProject => {
  const permitExpiry = project.permitExpiryDate ? format(project.permitExpiryDate, `yyyy-MM-dd'T'HH:mm:ss.SSSxxx`) : null;
  const defaultMoratoriumExpiry = project.moratoriumEndDate ? format(project.moratoriumEndDate, `yyyy-MM-dd'T'HH:mm:ss.SSSxxx`) : null;

  return {
    project_state: project.projectState,
    coordinator_id: project.projectManagerId,
    description: project.description,
    location: project.location,
    is_doc_project: project.isDocProject,
    permit_id: project.permitNumber,
    permit_expiry: permitExpiry,
    name: project.name,
    organisation: project.organisation,
    default_moratorium_expiry: defaultMoratoriumExpiry
  };
};

export const firstOfAprilNextDate = (): Date => {
  const currentYear = getYear(new Date());
  return set(new Date(), {
    date: 1,
    month: 3,
    year: currentYear + 1,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
};
