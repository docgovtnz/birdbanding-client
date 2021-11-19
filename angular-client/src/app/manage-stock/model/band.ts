import { Time } from '@angular/common';
import { Pagination } from './band-transfer';

export interface Band {
  id: string;
  bandPrefix: string;
  noOfBands?: number;
  lastBandNo: string;
  state?: BandState;
  banderName?: string;
  banderId?: string;
  userId?: string;
  bandAssignDate?: string;
  isBandEdit?: boolean;
  isBandMarked?: boolean;
  nzbbsCertificationNumber?: string;
  checkBanderId?: string;
  checkMarkState?: BandState;
  checkMarkEventId?: string;
}


export enum BandState {
  'ATTACHED' = 'ATTACHED',
  'LOST' = 'LOST',
  'ALLOCATED' = 'ALLOCATED',
  'NEW' = 'NEW',
  'PRACTICE' = 'PRACTICE',
  'RETURNED_USED' = 'RETURNED_USED',
  'OTHER' = 'OTHER',
  'RETURNED' = 'RETURNED',
  'DETACHED' = 'DETACHED'
}

export const SelectableBandStates = Object.keys(BandState).filter(s => !['ATTACHED', 'DETACHED', 'ALLOCATED', 'NEW'].includes(s));

export interface History {
  markId: string;
  banderId?: string;
  eventId: string;
  eventDate: string;
  eventTime: string;
  eventDateObj?: Date;
  banderName?: string;
  state: BandState;
  distinctPrefixNumbers?: string;
  isMultipleBands: boolean;
  bandPrefixes: string[];
  markCount: number;
}

export interface HistoryView {
  history: History;
  originalHistory: History;
  isFocused: boolean;
  isSaving: boolean;
  errorMsg: string;
  isDelete: boolean;
  isEditable: boolean;
  isStateEditable: boolean;
  editAllEventMarks: boolean;
}

export interface BandHistoryResponse {
  band: Band;
  history: History[];
}

export interface BandResponse {
  bands: Band[];
  pagination: Pagination;
}
