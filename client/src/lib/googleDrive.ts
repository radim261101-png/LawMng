import { google } from 'googleapis';

// Removed DISCOVERY_DOCS and SCOPES as they are no longer used for client-side OAuth.
// Removed tokenClient, accessToken, initGoogleDrive, authenticateGoogleDrive, signOutGoogleDrive
// as the authentication will be handled by the backend service account.

// Mocking accessToken and authenticateGoogleDrive for demonstration purposes
// In a real application, these would be properly imported and managed.
let accessToken: string | null = null;
async function authenticateGoogleDrive() {
  // This is a placeholder. In a real scenario, this would handle the OAuth flow.
  console.log("Authenticating Google Drive...");
  accessToken = "mock_access_token"; // Replace with actual token acquisition
}


// إنشاء أو الحصول على المجلد الرئيسي "Legal Records"
async function getOrCreateMainFolder(): Promise<string> {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }

  // البحث عن المجلد الرئيسي
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='Legal Records' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  // Check if the fetch was successful before parsing JSON
  if (!searchResponse.ok) {
    const error = await searchResponse.json();
    throw new Error(error.message || 'Failed to search for main folder');
  }

  const searchData = await searchResponse.json();

  // إذا المجلد موجود، ارجع id الخاص به
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // إذا مش موجود، أنشئه
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Legal Records',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  // Check if the fetch was successful before parsing JSON
  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(error.message || 'Failed to create main folder');
  }

  const createData = await createResponse.json();
  return createData.id;
}

/**
 * Creates a new folder in Google Drive.
 * @param folderName The name of the folder to create.
 * @returns A promise that resolves with the created folder's ID and webViewLink.
 */
export async function createFolder(folderName: string): Promise<{ id: string; webViewLink: string }> {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }

  // الحصول على id المجلد الرئيسي
  const mainFolderId = await getOrCreateMainFolder();

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [mainFolderId], // حفظ المجلد الجديد داخل المجلد الرئيسي
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
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