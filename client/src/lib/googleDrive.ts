import { google } from 'googleapis';

// Removed DISCOVERY_DOCS and SCOPES as they are no longer used for client-side OAuth.
// Removed tokenClient, accessToken, initGoogleDrive, authenticateGoogleDrive, signOutGoogleDrive
// as the authentication will be handled by the backend service account.

/**
 * Creates a new folder in Google Drive.
 * @param folderName The name of the folder to create.
 * @param parentFolderId The ID of the parent folder. If not provided, it will be created in the root.
 * @returns A promise that resolves with the created folder's ID and webViewLink.
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<{ id: string; webViewLink: string }> {
  const response = await fetch('/api/drive/create-folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folderName, parentFolderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create folder');
  }

  return await response.json();
}

/**
 * Uploads a file to a specified folder in Google Drive.
 * @param file The file to upload.
 * @param folderId The ID of the folder to upload the file to.
 * @returns A promise that resolves with the uploaded file's ID, name, and webViewLink.
 */
export async function uploadFile(file: File, folderId: string): Promise<{ id: string; name: string; webViewLink: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderId', folderId);

  const response = await fetch('/api/drive/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload file');
  }

  return await response.json();
}

/**
 * Lists files in a specified folder in Google Drive.
 * @param folderId The ID of the folder to list files from.
 * @returns A promise that resolves with an array of files.
 */
export async function listFiles(folderId: string): Promise<any[]> {
  const response = await fetch(`/api/drive/list?folderId=${folderId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to list files');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive.
 * @param fileId The ID of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`/api/drive/delete/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete file');
  }
}

/**
 * Gets the ID of the root folder in Google Drive.
 * @returns A promise that resolves with the root folder ID.
 */
export async function getRootFolderId(): Promise<string> {
  const response = await fetch('/api/drive/root-folder');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get root folder');
  }

  const data = await response.json();
  return data.folderId;
}
```import { google } from 'googleapis';

// Removed DISCOVERY_DOCS and SCOPES as they are no longer used for client-side OAuth.
// Removed tokenClient, accessToken, initGoogleDrive, authenticateGoogleDrive, signOutGoogleDrive
// as the authentication will be handled by the backend service account.

/**
 * Creates a new folder in Google Drive.
 * @param folderName The name of the folder to create.
 * @param parentFolderId The ID of the parent folder. If not provided, it will be created in the root.
 * @returns A promise that resolves with the created folder's ID and webViewLink.
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<{ id: string; webViewLink: string }> {
  const response = await fetch('/api/drive/create-folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folderName, parentFolderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create folder');
  }

  return await response.json();
}

/**
 * Uploads a file to a specified folder in Google Drive.
 * @param file The file to upload.
 * @param folderId The ID of the folder to upload the file to.
 * @returns A promise that resolves with the uploaded file's ID, name, and webViewLink.
 */
export async function uploadFile(file: File, folderId: string): Promise<{ id: string; name: string; webViewLink: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderId', folderId);

  const response = await fetch('/api/drive/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload file');
  }

  return await response.json();
}

/**
 * Lists files in a specified folder in Google Drive.
 * @param folderId The ID of the folder to list files from.
 * @returns A promise that resolves with an array of files.
 */
export async function listFiles(folderId: string): Promise<any[]> {
  const response = await fetch(`/api/drive/list?folderId=${folderId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to list files');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive.
 * @param fileId The ID of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`/api/drive/delete/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete file');
  }
}

/**
 * Gets the ID of the root folder in Google Drive.
 * @returns A promise that resolves with the root folder ID.
 */
export async function getRootFolderId(): Promise<string> {
  const response = await fetch('/api/drive/root-folder');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get root folder');
  }

  const data = await response.json();
  return data.folderId;
}