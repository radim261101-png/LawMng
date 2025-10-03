import { createContext, useContext, useState, ReactNode } from 'react';

export interface LegalRecord {
  id: string;
  createdBy: string;
  recordType?: string;
  postponementDate?: string;
  postponementReason?: string;
  ruling?: string;
  registrationNumber?: string;
  notes?: string;
  firstInstanceCourt?: string;
  oppositionSessionDate?: string;
  oppositionRuling?: string;
  oppositionRegistrationNumber?: string;
  appealFirstSessionDate?: string;
  courtLocation?: string;
  clientAppealNumber?: string;
  appealRulingText?: string;
  appealRegistrationNumber?: string;
  appealOppositionDate?: string;
  appealOppositionRuling?: string;
  appealOppositionRegistrationNumber?: string;
  settlementRequestDate?: string;
  settlementConfirmationDate?: string;
  depositReceiptStatus?: string;
  updateDate?: string;
  lastUpdateLawyer?: string;
  extract?: string;
  sessionUpdateNotes?: string;
  required?: string;
  report?: string;
  archivedCases?: string;
  recordPreparationLawyer?: string;
  sessionAttendanceLawyer?: string;
  extractionLawyer?: string;
  settlementLawyer?: string;
  claimSent?: string;
  branchesReceived?: string;
  receivingDate?: string;
  debtBondReturnDate?: string;
  debtBondReturnReason?: string;
  invoice?: string;
}

interface RecordsContextType {
  records: LegalRecord[];
  addRecord: (record: Omit<LegalRecord, 'id'>, username: string) => void;
  updateRecord: (id: string, record: Partial<LegalRecord>) => void;
  deleteRecord: (id: string) => void;
}

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<LegalRecord[]>([
    {
      id: '1',
      createdBy: 'admin',
      recordType: 'محضر تكليف بالوفاء',
      registrationNumber: '2024/12345',
      postponementDate: '2024-01-15',
      postponementReason: 'تأجيل لحضور الخصم',
      ruling: 'قيد النظر',
      firstInstanceCourt: 'محكمة القاهرة الابتدائية',
      lastUpdateLawyer: 'أحمد محمد',
      updateDate: '2024-01-10',
    },
    {
      id: '2',
      createdBy: 'admin',
      recordType: 'محضر إعلان حكم',
      registrationNumber: '2024/67890',
      postponementDate: '2024-02-20',
      ruling: 'صدور حكم',
      firstInstanceCourt: 'محكمة الجيزة الابتدائية',
      lastUpdateLawyer: 'فاطمة أحمد',
      updateDate: '2024-02-15',
    },
  ]);

  const addRecord = (record: Omit<LegalRecord, 'id'>, username: string) => {
    const newRecord: LegalRecord = {
      ...record,
      id: Date.now().toString(),
      createdBy: username,
    };
    setRecords(prev => [...prev, newRecord]);
  };

  const updateRecord = (id: string, updatedData: Partial<LegalRecord>) => {
    setRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updatedData } : record))
    );
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <RecordsContext.Provider value={{ records, addRecord, updateRecord, deleteRecord }}>
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
}
