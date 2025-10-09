import { useState, useEffect } from 'react';
import { getSheetRecords, getSheetHeaders, updateSheetRow, logUpdateToSheet } from '@/lib/googleSheets';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSheets } from '@/contexts/SheetsContext';

export interface SheetRecord {
  id: string;
  serial: number;
  rowIndex: number;
  [key: string]: any;
}

export function useSheetRecords() {
  const [records, setRecords] = useState<SheetRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSheet } = useSheets();

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [recordsData, headersData] = await Promise.all([
        getSheetRecords(activeSheet),
        getSheetHeaders(activeSheet),
      ]);
      setRecords(recordsData);
      setHeaders(headersData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeSheet]);

  const updateRecord = async (record: SheetRecord, updates: Record<string, any>) => {
    try {
      const headerIndices: Record<string, number> = {};
      headers.forEach((header, index) => {
        headerIndices[header] = index;
      });

      const rowData = new Array(headers.length).fill('');
      
      headers.forEach((header, index) => {
        if (header && record[header] !== undefined && record[header] !== null) {
          rowData[index] = record[header];
        }
      });

      const nationalIdField = headers.find(h => 
        h === 'الرقم القومي' || h === 'nationalId' || h.toLowerCase().includes('national')
      );
      const nationalId = nationalIdField ? record[nationalIdField] : '';

      const changePromises: Promise<void>[] = [];
      Object.keys(updates).forEach((key) => {
        const oldValue = record[key] || '';
        const newValue = updates[key] || '';
        
        if (oldValue !== newValue) {
          changePromises.push(
            logUpdateToSheet(activeSheet, {
              serial: record.serial,
              nationalId: nationalId,
              updatedBy: user?.username || 'unknown',
              updatedAt: new Date().toISOString(),
              fieldName: key,
              oldValue: oldValue.toString(),
              newValue: newValue.toString(),
            })
          );
        }
      });

      Object.keys(updates).forEach((key) => {
        const index = headerIndices[key];
        if (index !== undefined) {
          rowData[index] = updates[key] || '';
        }
      });

      if (rowData[0] === '' || rowData[0] === null) {
        rowData[0] = record.serial.toString();
      }

      await updateSheetRow(activeSheet, record.rowIndex, rowData);
      
      await Promise.all(changePromises);
      
      await fetchRecords();
      
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم حفظ التعديلات على السجل وتسجيلها في سجل التعديلات',
      });
    } catch (err: any) {
      toast({
        title: 'خطأ في التحديث',
        description: err.message || 'حدث خطأ أثناء تحديث السجل',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    records,
    headers,
    isLoading,
    error,
    refetch: fetchRecords,
    updateRecord,
  };
}
