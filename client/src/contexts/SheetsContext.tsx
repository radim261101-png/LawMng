import { createContext, useContext, useState, useEffect } from 'react';

export interface SheetConfig {
  id: string;
  name: string;
  spreadsheetId: string;
  sheetName: string;
  updatesSheetName?: string;
}

const defaultSheets: SheetConfig[] = [
  {
    id: 'main',
    name: 'الشيت الرئيسي',
    spreadsheetId: '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4',
    sheetName: 'Sheet1',
    updatesSheetName: 'UpdatesLog'
  }
];

interface SheetsContextType {
  sheets: SheetConfig[];
  activeSheet: SheetConfig;
  setActiveSheet: (sheet: SheetConfig) => void;
  addSheet: (sheet: SheetConfig) => void;
  removeSheet: (id: string) => void;
}

const SheetsContext = createContext<SheetsContextType | undefined>(undefined);

export function SheetsProvider({ children }: { children: React.ReactNode }) {
  const [sheets, setSheets] = useState<SheetConfig[]>(() => {
    const saved = localStorage.getItem('sheets');
    return saved ? JSON.parse(saved) : defaultSheets;
  });

  const [activeSheet, setActiveSheetState] = useState<SheetConfig>(() => {
    const savedId = localStorage.getItem('activeSheetId');
    const saved = sheets.find(s => s.id === savedId);
    return saved || sheets[0];
  });

  useEffect(() => {
    localStorage.setItem('sheets', JSON.stringify(sheets));
  }, [sheets]);

  useEffect(() => {
    localStorage.setItem('activeSheetId', activeSheet.id);
  }, [activeSheet]);

  const setActiveSheet = (sheet: SheetConfig) => {
    setActiveSheetState(sheet);
  };

  const addSheet = (sheet: SheetConfig) => {
    if (!sheets.find(s => s.id === sheet.id)) {
      setSheets([...sheets, sheet]);
    }
  };

  const removeSheet = (id: string) => {
    if (sheets.length > 1) {
      const newSheets = sheets.filter(s => s.id !== id);
      setSheets(newSheets);
      if (activeSheet.id === id) {
        setActiveSheet(newSheets[0]);
      }
    }
  };

  return (
    <SheetsContext.Provider value={{ sheets, activeSheet, setActiveSheet, addSheet, removeSheet }}>
      {children}
    </SheetsContext.Provider>
  );
}

export function useSheets() {
  const context = useContext(SheetsContext);
  if (!context) {
    throw new Error('useSheets must be used within a SheetsProvider');
  }
  return context;
}
