import { Entry } from "fast-glob";

export type FileInfo = {
  name: string;
  path: string;
  displayPath: string;
  fileSizeFormatted: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  searchScore?: number;
};

export type Preferences = {
  shouldShowHiddenFiles: boolean;
  shouldShowDirectories: boolean;
  excludePaths: string;
  googleDriveRootPath: string;
  autoReindexingInterval: string;
};

export type EntryWithRealPath = Entry & {
  realPath: string;
};
