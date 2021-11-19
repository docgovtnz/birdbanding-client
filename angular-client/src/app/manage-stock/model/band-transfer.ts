export interface BandTransfer {
  transferId: string;
  transferFromUserId: string;
  transferFromUserName: string;
  transferFromMaxCert: string;
  amount: number;
  transferToUserId: string;
  transferToUserName: string;
  transferToMaxCert: string;
  transferDate: Date;
  isTransferView?: boolean;
  transferred?: TransferBand[];
}

export interface TransferBand {
  prefix: string;
  amount: number;
  minShortNumber: number;
  maxShortNumber: number;
}

export interface Pagination {
  self: string;
  prev: string;
  next: string;
  pageCount: number;
  count: number;
  countFromPageToEnd: boolean;
  isLastPage: boolean;
}

export interface BandTransferResponse {
  transfers: BandTransfer[];
  pagination: Pagination;
}
