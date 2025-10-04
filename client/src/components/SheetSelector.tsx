import { useState, useEffect } from 'react';
import { useSheets } from '@/contexts/SheetsContext';
import { fetchSpreadsheetSheets, type SpreadsheetSheet } from '@/lib/googleSheets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SPREADSHEET_ID = '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4';

export default function SheetSelector() {
  const { sheets, activeSheet, setActiveSheet, addSheet } = useSheets();
  const [isOpen, setIsOpen] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SPREADSHEET_ID);
  const [availableSheets, setAvailableSheets] = useState<SpreadsheetSheet[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [hasLoadedSheets, setHasLoadedSheets] = useState(false);
  const { toast } = useToast();

  const handleLoadSheets = async (loadSpreadsheetId: string) => {
    if (!loadSpreadsheetId || !loadSpreadsheetId.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال معرف الـ Spreadsheet أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingSheets(true);
    setHasLoadedSheets(false);
    setAvailableSheets([]);

    try {
      const fetchedSheets = await fetchSpreadsheetSheets(loadSpreadsheetId);
      setAvailableSheets(fetchedSheets);
      setHasLoadedSheets(true);
      
      toast({
        title: 'تم التحميل بنجاح',
        description: `تم العثور على ${fetchedSheets.length} شيت`,
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في تحميل الشيتات',
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      setHasLoadedSheets(false);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSelectSheet = (sheetTitle: string) => {
    const existingSheet = sheets.find(
      s => s.spreadsheetId === spreadsheetId && s.sheetName === sheetTitle
    );

    if (existingSheet) {
      setActiveSheet(existingSheet);
      toast({
        title: 'تم التبديل',
        description: `تم التبديل إلى "${sheetTitle}"`,
      });
    } else {
      const newSheetConfig = {
        id: `sheet-${Date.now()}`,
        name: sheetTitle,
        spreadsheetId: spreadsheetId,
        sheetName: sheetTitle,
        updatesSheetName: 'UpdatesLog',
      };

      addSheet(newSheetConfig);
      setActiveSheet(newSheetConfig);
      
      toast({
        title: 'تم الإضافة والتبديل',
        description: `تم إضافة والتبديل إلى "${sheetTitle}"`,
      });
    }
  };

  useEffect(() => {
    if (isOpen && DEFAULT_SPREADSHEET_ID) {
      setSpreadsheetId(DEFAULT_SPREADSHEET_ID);
      handleLoadSheets(DEFAULT_SPREADSHEET_ID);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-sheet-selector">
          <Sheet className="w-4 h-4" />
          <span className="hidden sm:inline">{activeSheet.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>اختيار الشيت النشط</DialogTitle>
          <DialogDescription>
            اختر شيت من القائمة للتبديل إليه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">الشيت النشط</Label>
            
            {isLoadingSheets && (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">جاري تحميل الشيتات...</span>
              </div>
            )}

            {!isLoadingSheets && hasLoadedSheets && availableSheets.length > 0 && (
              <div className="grid gap-2">
                {availableSheets.map((sheet) => {
                  const isActive = activeSheet.spreadsheetId === spreadsheetId && 
                                   activeSheet.sheetName === sheet.title;
                  
                  return (
                    <div
                      key={sheet.sheetId}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSelectSheet(sheet.title)}
                      data-testid={`sheet-item-${sheet.title}`}
                    >
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                        <div>
                          <div className="font-medium">{sheet.title}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoadingSheets && hasLoadedSheets && availableSheets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>لم يتم العثور على شيتات</p>
                <p className="text-xs mt-2">تأكد من صحة Google Sheets API Key</p>
              </div>
            )}
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}
