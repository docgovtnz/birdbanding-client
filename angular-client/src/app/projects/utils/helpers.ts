import { ProjectStatus } from '../services/project-types';

export const statusEnumToFormattedString = (projectStatus: ProjectStatus): string => {
  const projectStatusName = ProjectStatus[projectStatus];
  const splitLowercaseName = projectStatusName
    .split('_')
    .join(' ')
    .toLowerCase();
  return splitLowercaseName[0].toUpperCase() + splitLowercaseName.slice(1);
};
