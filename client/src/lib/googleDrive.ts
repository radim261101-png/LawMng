
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any = null;
let accessToken: string | null = null;

export function initGoogleDrive() {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('VITE_GOOGLE_DRIVE_CLIENT_ID غير موجود');
  }

  // Load Google Identity Services
  if (typeof google !== 'undefined' && google.accounts) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: '', // Will be set later
    });
  }
}

export function authenticateGoogleDrive(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Drive client not initialized'));
      return;
    }

    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }
      accessToken = response.access_token;
      localStorage.setItem('google_drive_token', accessToken);
      resolve(accessToken);
    };

    // Check if we have a stored token
    const storedToken = localStorage.getItem('google_drive_token');
    if (storedToken) {
      accessToken = storedToken;
      resolve(storedToken);
    } else {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  });
}

export async function createFolder(folderName: string): Promise<{ id: string; webViewLink: string }> {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
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
    throw new Error('Failed to create folder');
  }

  return await response.json();
}

export async function uploadFile(file: File, folderId: string): Promise<{ id: string; name: string; webViewLink: string }> {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }

  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return await response.json();
}

export async function listFiles(folderId: string): Promise<any[]> {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,webViewLink,mimeType,createdTime)`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to list files');
  }

  const data = await response.json();
  return data.files || [];
}

export async function deleteFile(fileId: string): Promise<void> {
  if (!accessToken) {
    await authenticateGoogleDrive();
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
}

export function signOutGoogleDrive() {
  accessToken = null;
  localStorage.removeItem('google_drive_token');
}
