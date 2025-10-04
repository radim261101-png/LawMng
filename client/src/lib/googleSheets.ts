const SPREADSHEET_ID = '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4';

const getGoogleSheetsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
};

export interface SheetRecord {
  [key: string]: any;
}

export async function fetchSheetData(): Promise<any[][]> {
  const apiKey = getGoogleSheetsApiKey();
  
  if (!apiKey) {
    console.warn('No Google Sheets API key found. Using demo data.');
    return getDemoData();
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:CZ?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return getDemoData();
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
  // استخدم Google Apps Script للتحديثات
  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.error('Google Apps Script URL not configured');
    throw new Error('لم يتم تكوين رابط Google Apps Script');
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // مهم لـ Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rowIndex: rowIndex,
        values: values,
      }),
    });

    // no-cors mode لا يسمح بقراءة الـ response، لكن التحديث يحصل
    console.log('تم إرسال طلب التحديث');
  } catch (error) {
    console.error('Error updating sheet:', error);
    throw error;
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
