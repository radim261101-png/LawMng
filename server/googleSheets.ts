
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

const SPREADSHEET_ID = '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4';

// قراءة Service Account credentials من ملف JSON أو متغيرات البيئة
function getServiceAccountCredentials() {
  // أولاً: حاول قراءة متغيرات البيئة
  if (process.env.GOOGLE_CREDENTIALS) {
    try {
      return JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } catch (error) {
      console.error('خطأ في تحليل GOOGLE_CREDENTIALS من متغيرات البيئة');
    }
  }

  // ثانياً: حاول قراءة ملف credentials.json
  try {
    const credentialsPath = join(process.cwd(), 'credentials.json');
    const credentialsJson = readFileSync(credentialsPath, 'utf-8');
    return JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error('لا يمكن العثور على بيانات الاعتماد. أضف ملف credentials.json أو متغير البيئة GOOGLE_CREDENTIALS');
  }
}

export async function getGoogleSheetClient() {
  const credentials = getServiceAccountCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();

  return google.sheets({ version: 'v4', auth: authClient });
}

export async function getSheetData() {
  const sheets = await getGoogleSheetClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:BZ',
  });

  return response.data.values || [];
}

export async function appendRowToSheet(values: any[]) {
  const sheets = await getGoogleSheetClient();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:BZ',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });

  return response.data;
}

export async function updateRowInSheet(rowIndex: number, values: any[]) {
  const sheets = await getGoogleSheetClient();

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${rowIndex}:BZ${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });

  return response.data;
}
