

export type FileType =
  | "pdf"
  | "image"
  | "document"
  | "video"
  | "audio"
  | "other";

export interface Folder {

  id: string;

  name: string;

  parentId?: string;

  path: string;

  level: number;

  storeId: string;

  createdAt: Date;

  updatedAt: Date;

  createdBy: string;

  isDeleted: boolean;

  childrenCount: number;

  filesCount: number;
}

export interface FileItem {

  id: string;

  name: string;

  originalName: string;

  type: FileType;

  mimeType: string;

  size: number;

  folderId: string;

  folderPath?: string;

  storeId: string;

  storageUrl: string;

  downloadUrl?: string;

  thumbnailUrl?: string;

  metadata: FileMetadata;

  createdAt: Date;

  updatedAt: Date;

  createdBy: string;

  isDeleted: boolean;

  downloadCount: number;

  lastAccessedAt?: Date;
}

export interface FileMetadata {

  width?: number;

  height?: number;

  duration?: number;

  pageCount?: number;

  description?: string;

  tags?: string[];

  subject?: string;

  grade?: string;

  category?: string;
}

export interface FolderTreeItem {

  folder: Folder;

  children: FolderTreeItem[];

  isExpanded: boolean;

  isSelected: boolean;
}

export interface FileUploadProgress {

  fileId: string;

  fileName: string;

  progress: number;

  status: "uploading" | "processing" | "completed" | "error";

  error?: string;
}

export interface BreadcrumbItem {

  id: string;

  name: string;

  path: string;
}

export interface FileSearchParams {

  query?: string;

  type?: FileType[];

  folderId?: string;

  createdBy?: string;

  dateFrom?: Date;

  dateTo?: Date;

  tags?: string[];

  subject?: string;

  grade?: string;
}

export interface FileSortOptions {

  field: "name" | "createdAt" | "updatedAt" | "size" | "downloadCount";

  direction: "asc" | "desc";
}

export interface FileSystemStats {

  totalFolders: number;

  totalFiles: number;

  totalSize: number;

  filesByType: Record<FileType, number>;

  recentUploads: FileItem[];

  popularFiles: FileItem[];
}
