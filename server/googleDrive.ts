
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// المجلد الرئيسي اللي هيتحفظ فيه كل الملفات
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || 'root';

function getServiceAccountCredentials() {
  if (process.env.GOOGLE_CREDENTIALS) {
    try {
      return JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } catch (error) {
      console.error('خطأ في تحليل GOOGLE_CREDENTIALS من متغيرات البيئة');
    }
  }

  try {
    const credentialsPath = join(process.cwd(), 'credentials.json');
    const credentialsJson = readFileSync(credentialsPath, 'utf-8');
    return JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error('لا يمكن العثور على بيانات الاعتماد');
  }
}

export async function getDriveClient() {
  const credentials = getServiceAccountCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const authClient = await auth.getClient();
  return google.drive({ version: 'v3', auth: authClient });
}

export async function createFolder(folderName: string, parentFolderId?: string) {
  const drive = await getDriveClient();

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId || ROOT_FOLDER_ID],
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  return {
    id: response.data.id!,
    webViewLink: response.data.webViewLink!,
  };
}

export async function uploadFile(file: Express.Multer.File, folderId: string) {
  const drive = await getDriveClient();

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: file.buffer,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    webViewLink: response.data.webViewLink!,
  };
}

export async function listFiles(folderId: string) {
  const drive = await getDriveClient();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, webViewLink, mimeType, createdTime)',
    orderBy: 'createdTime desc',
  });

  return response.data.files || [];
}

export async function deleteFile(fileId: string) {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
}

export async function getRootFolderId() {
  return ROOT_FOLDER_ID;
}
