import { PageableResponse } from './index';

export interface StoreBranch {
  branchId: number;
  branchName: string;
  location: string;
  address: string;
  contactNumber: string;
  workingHours: string;
  mapsUrl: string;
}

export type StoreBranchPage = PageableResponse<StoreBranch>;
