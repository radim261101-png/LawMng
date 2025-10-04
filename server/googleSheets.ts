import { google } from 'googleapis';

const SPREADSHEET_ID = '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4';

// Service Account credentials from environment variable
function getServiceAccountCredentials() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!credentialsJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
  }

  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON format');
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