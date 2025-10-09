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

      // البحث عن الرقم القومي في الـ record
      let nationalId = '';
      
      // طريقة 1: البحث في كل الـ keys في الـ record مباشرة
      const recordKeys = Object.keys(record);
      const nationalIdKey = recordKeys.find(key => {
        const normalizedKey = key.trim().toLowerCase();
        return (
          normalizedKey.includes('رقم') && normalizedKey.includes('قومي') ||
          normalizedKey.includes('national') && normalizedKey.includes('id') ||
          normalizedKey === 'nationalid'
        );
      });

      if (nationalIdKey && record[nationalIdKey]) {
        nationalId = record[nationalIdKey].toString().trim();
      }

      // طريقة 2: لو مش لاقيه، دور في الـ headers
      if (!nationalId) {
        const nationalIdHeader = headers.find(h => {
          if (!h) return false;
          const normalized = h.trim().toLowerCase();
          return (
            normalized.includes('رقم') && normalized.includes('قومي') ||
            normalized.includes('national') && normalized.includes('id') ||
            normalized === 'nationalid'
          );
        });
        
        if (nationalIdHeader && record[nationalIdHeader]) {
          nationalId = record[nationalIdHeader].toString().trim();
        }
      }

      console.log('🔍 الـ record الكامل:', record);
      console.log('📋 الـ headers:', headers);
      console.log('🆔 الرقم القومي اللي اتلقى:', nationalId || 'مش موجود');

      const changePromises: Promise<void>[] = [];
      Object.keys(updates).forEach((key) => {
        const oldValue = record[key] || '';
        const newValue = updates[key] || '';
        
        if (oldValue !== newValue) {
          changePromises.push(
            logUpdateToSheet(activeSheet, {
              serial: record.serial,
              nationalId: nationalId || '',
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

      setRecords(prevRecords => 
        prevRecords.map(r => 
          r.id === record.id 
            ? { ...r, ...updates }
            : r
        )
      );

      await updateSheetRow(activeSheet, record.rowIndex, rowData);
      
      await Promise.all(changePromises);
      
      setTimeout(() => {
        fetchRecords();
      }, 1000);
      
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم حفظ التعديلات على السجل',
      });
    } catch (err: any) {
      await fetchRecords();
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
