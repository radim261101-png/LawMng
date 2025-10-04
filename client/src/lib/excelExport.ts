import * as XLSX from 'xlsx';

export interface ExportData {
  headers: string[];
  records: any[];
  fileName?: string;
}

export function exportToExcel({ headers, records, fileName = 'records_export' }: ExportData) {
  const validHeaders = headers.filter(h => h && h.trim());
  
  if (validHeaders.length === 0) {
    throw new Error('لا توجد أعمدة صالحة للتصدير');
  }

  const exportData = records.map(record => {
    const row: any = {};
    validHeaders.forEach(header => {
      row[header] = record[header] || '';
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(exportData);

  const colWidths = validHeaders.map(header => {
    const maxLength = Math.max(
      header.length,
      ...exportData.map(row => String(row[header] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'السجلات');

  const timestamp = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileName}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, fullFileName);
}

export function exportFilteredToExcel({
  headers,
  records,
  visibleHeaders,
  fileName = 'filtered_export'
}: ExportData & { visibleHeaders?: string[] }) {
  const headersToExport = (visibleHeaders || headers).filter(h => h && h.trim());
  
  if (headersToExport.length === 0) {
    throw new Error('لا توجد أعمدة صالحة للتصدير');
  }
  
  const exportData = records.map(record => {
    const row: any = {};
    headersToExport.forEach(header => {
      row[header] = record[header] || '';
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(exportData);

  const colWidths = headersToExport.map(header => {
    const maxLength = Math.max(
      header.length,
      ...exportData.map(row => String(row[header] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'البيانات المصدرة');

  const timestamp = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileName}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, fullFileName);
}
