const SPREADSHEET_ID = '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4';
const MAIN_SHEET_NAME = 'Sheet1';
const UPDATES_SHEET_NAME = 'UpdatesLog';

const getGoogleSheetsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
};

export interface SheetRecord {
  [key: string]: any;
}

export async function fetchSheetData(sheetName: string = MAIN_SHEET_NAME): Promise<any[][]> {
  const apiKey = getGoogleSheetsApiKey();
  
  if (!apiKey) {
    console.warn('No Google Sheets API key found. Using demo data.');
    return sheetName === MAIN_SHEET_NAME ? getDemoData() : [];
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A:CZ?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return sheetName === MAIN_SHEET_NAME ? getDemoData() : [];
  }
}

export async function getSheetHeaders(): Promise<string[]> {
  const data = await fetchSheetData();
  if (data.length === 0) return [];
  return data[0] || [];
}

export async function getSheetRecords(): Promise<any[]> {
  const data = await fetchSheetData();
  if (data.length === 0) return [];
  
  const headers = data[0];
  const records = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const serial = parseInt(row[0]?.toString().trim() || '0');
    if (isNaN(serial) || serial === 0) continue;

    const record: any = {
      id: `row-${i + 1}`,
      serial: serial,
      rowIndex: i + 1,
    };

    headers.forEach((header: string, index: number) => {
      if (header) {
        record[header] = row[index] || null;
      }
    });

    records.push(record);
  }

  return records;
}

export async function updateSheetRow(rowIndex: number, values: any[]): Promise<void> {
  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.error('Google Apps Script URL not configured');
    throw new Error('لم يتم تكوين رابط Google Apps Script');
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateRow',
        sheetName: MAIN_SHEET_NAME,
        rowIndex: rowIndex,
        values: values,
      }),
    });

    console.log('تم إرسال طلب التحديث');
  } catch (error) {
    console.error('Error updating sheet:', error);
    throw error;
  }
}

export async function logUpdateToSheet(updateData: {
  serial: number;
  updatedBy: string;
  updatedAt: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
}): Promise<void> {
  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.warn('Google Apps Script URL not configured - update not logged');
    return;
  }

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'logUpdate',
        sheetName: UPDATES_SHEET_NAME,
        updateData: updateData,
      }),
    });

    console.log('تم تسجيل التعديل في شيت UpdatesLog');
  } catch (error) {
    console.error('Error logging update:', error);
  }
}

export async function getUpdatesLog(): Promise<any[]> {
  const data = await fetchSheetData(UPDATES_SHEET_NAME);
  if (data.length === 0) return [];
  
  const headers = data[0];
  const updates = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const update: any = {
      id: `update-${i}`,
    };

    headers.forEach((header: string, index: number) => {
      if (header) {
        update[header] = row[index] || null;
      }
    });

    updates.push(update);
  }

  return updates.reverse();
}

function getDemoData(): any[][] {
  return [
    ['م', 'الشركة', 'رقم الحساب', 'اسم العميل', 'الرقم القومي', '', 'الوكيل القانوني', 'مستوى التقاضي', 'تاريخ الاستلام من الشركة'],
    [
      '1',
      'فاليو',
      'M00200078606',
      'احمد مختار العراقي احمد',
      '29311252103591',
      '',
      'qima',
      'احكام',
      '2024-11-25'
    ],
    [
      '2',
      'فاليو',
      'M00200067466',
      'حازم حسن إبراهيم حسن',
      '28607090101592',
      '',
      'qima',
      'احكام',
      '2024-11-25'
    ]
  ];
}
