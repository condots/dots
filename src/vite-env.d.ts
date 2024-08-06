/// <reference types="vite/client" />

interface Window {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: {
      description: string;
      accept: { [key: string]: string[] };
    }[];
  }) => Promise<FileSystemFileHandle>;
}
