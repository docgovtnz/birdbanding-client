import { PersonCertificate } from '../services/certification.service';

export type Status = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'INACTIVE';
export type BandingLevel = 'UNCERTIFIED' | 'L1' | 'L2' | 'L3';

export interface PeopleData {
  id: string;
  personName: string;
  firstName: string;
  lastName: string;
  userName: string;
  company: string;
  banderNumber: string;
  maxBandingLevel: BandingLevel;
  jointDate: Date;
  lastLogin: Date;
  status: Status;
  hidden: boolean;
  display: string;
}

export interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  banderId: string;
  maxCertificationLevel: BandingLevel;
  banderStatus: Status;
  lastLogin: Date;
  lastUpdated: Date;
  phone: string;
  address: string;
  company: string;
  nznbb: boolean;
  projects: PersonProject[];
  certs: PersonCertificate[];
}

export interface PersonProject {
  projectId: string;
  banderId: string;
  projectName: string;
  isManager: boolean;
}
