import type { SheetConfig } from '@/contexts/SheetsContext';

const getGoogleSheetsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
};

export interface SheetRecord {
  [key: string]: any;
}

export interface SpreadsheetSheet {
  title: string;
  sheetId: number;
  index: number;
}

function extractSpreadsheetId(input: string): string {
  if (!input || !input.trim()) {
    throw new Error('يرجى إدخال معرف الـ Spreadsheet أو الرابط');
  }

  const trimmedInput = input.trim();
  
  // Check if it's a full URL
  const urlPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = trimmedInput.match(urlPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If it's just an ID (no slashes or special characters)
  if (/^[a-zA-Z0-9-_]+$/.test(trimmedInput)) {
    return trimmedInput;
  }
  
  throw new Error('الرجاء إدخال معرف Spreadsheet صحيح أو رابط Google Sheets كامل');
}

export async function fetchSpreadsheetSheets(spreadsheetId: string): Promise<SpreadsheetSheet[]> {
  const apiKey = getGoogleSheetsApiKey();
  
  if (!apiKey) {
    throw new Error('لم يتم العثور على مفتاح Google Sheets API');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets(properties(title,sheetId,index))&key=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('الـ Spreadsheet غير موجود أو معرف خاطئ');
      }
      if (response.status === 403) {
        throw new Error('ليس لديك صلاحية الوصول لهذا الـ Spreadsheet');
      }
      throw new Error(`خطأ في جلب الشيتات: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.sheets || data.sheets.length === 0) {
      throw new Error('لا توجد شيتات في هذا الـ Spreadsheet');
    }

    return data.sheets
      .map((sheet: any) => ({
        title: sheet.properties.title,
        sheetId: sheet.properties.sheetId,
        index: sheet.properties.index,
      }))
      .sort((a: SpreadsheetSheet, b: SpreadsheetSheet) => a.index - b.index);
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    console.error('Error fetching spreadsheet sheets:', error);
    throw new Error('حدث خطأ أثناء جلب الشيتات من Google Sheets');
  }
}

export async function fetchSheetData(
  sheetConfig: SheetConfig,
  sheetType: 'main' | 'updates' = 'main'
): Promise<any[][]> {
  const apiKey = getGoogleSheetsApiKey();
  
  if (!apiKey) {
    console.warn('No Google Sheets API key found. Using demo data.');
    return sheetType === 'main' ? getDemoData() : [];
  }

  const sheetName = sheetType === 'updates' && sheetConfig.updatesSheetName 
    ? sheetConfig.updatesSheetName 
    : sheetConfig.sheetName;

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.spreadsheetId}/values/${sheetName}!A:CZ?key=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 400 && sheetType === 'updates') {
        console.warn(`Sheet "${sheetName}" not found. Please create it in Google Sheets with headers: serial, updatedBy, updatedAt, fieldName, oldValue, newValue`);
        return [];
      }
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return sheetType === 'main' ? getDemoData() : [];
  }
}

export async function getSheetHeaders(sheetConfig: SheetConfig): Promise<string[]> {
  const data = await fetchSheetData(sheetConfig, 'main');
  if (data.length === 0) return [];
  return data[0] || [];
}

export async function getSheetRecords(sheetConfig: SheetConfig): Promise<any[]> {
  const data = await fetchSheetData(sheetConfig, 'main');
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

export async function updateSheetRow(
  sheetConfig: SheetConfig,
  rowIndex: number,
  values: any[]
): Promise<void> {
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
        spreadsheetId: sheetConfig.spreadsheetId,
        sheetName: sheetConfig.sheetName,
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

export async function logUpdateToSheet(
  sheetConfig: SheetConfig,
  updateData: {
    serial: number;
    updatedBy: string;
    updatedAt: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
  }
): Promise<void> {
  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.warn('Google Apps Script URL not configured - update not logged');
    return;
  }

  if (!sheetConfig.updatesSheetName) {
    console.warn('Updates sheet not configured for this sheet');
    return;
  }

  const dataToSend = {
    action: 'logUpdate',
    spreadsheetId: sheetConfig.spreadsheetId,
    sheetName: sheetConfig.updatesSheetName,
    sourceSheet: sheetConfig.sheetName,
    updateData: {
      serial: updateData.serial,
      updatedBy: updateData.updatedBy,
      updatedAt: updateData.updatedAt,
      fieldName: updateData.fieldName,
      oldValue: updateData.oldValue,
      newValue: updateData.newValue,
    },
  };

  console.log('📝 الـ JSON الكامل اللي هيتبعت:', JSON.stringify(dataToSend, null, 2));

  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    console.log('✅ تم إرسال التعديل بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تسجيل التعديل:', error);
  }
}

export async function getUpdatesLog(sheetConfig: SheetConfig): Promise<any[]> {
  try {
    const data = await fetchSheetData(sheetConfig, 'updates');
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

    // فلترة التعديلات بناءً على الشيت المصدر
    const filteredUpdates = updates.filter(update => {
      const sourceSheet = update.sourceSheet || update['الشيت المصدر'] || update['sourceSheet'];
      return !sourceSheet || sourceSheet === sheetConfig.sheetName;
    });

    return filteredUpdates.reverse();
  } catch (error) {
    console.warn('UpdatesLog sheet not found or error fetching data:', error);
    return [];
  }
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
