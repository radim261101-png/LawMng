import { useState, useEffect } from 'react';
import { useSheets } from '@/contexts/SheetsContext';
import { fetchSpreadsheetSheets, type SpreadsheetSheet } from '@/lib/googleSheets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, Plus, Trash2, Check, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SPREADSHEET_ID = '1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4';

export default function SheetSelector() {
  const { sheets, activeSheet, setActiveSheet, addSheet, removeSheet } = useSheets();
  const [isOpen, setIsOpen] = useState(false);
  const [newSheet, setNewSheet] = useState({
    id: '',
    name: '',
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    sheetName: '',
    updatesSheetName: '',
  });
  const [availableSheets, setAvailableSheets] = useState<SpreadsheetSheet[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [hasLoadedSheets, setHasLoadedSheets] = useState(false);
  const { toast } = useToast();

  const handleLoadSheets = async () => {
    if (!newSheet.spreadsheetId || !newSheet.spreadsheetId.trim()) {
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
      const fetchedSheets = await fetchSpreadsheetSheets(newSheet.spreadsheetId);
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

  const handleAddSheet = () => {
    if (!newSheet.spreadsheetId || !newSheet.sheetName) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحميل السبريدشيت واختيار شيت',
        variant: 'destructive',
      });
      return;
    }

    const autoId = `sheet-${Date.now()}`;
    const autoName = newSheet.sheetName;

    addSheet({
      id: autoId,
      name: autoName,
      spreadsheetId: newSheet.spreadsheetId,
      sheetName: newSheet.sheetName,
      updatesSheetName: newSheet.updatesSheetName && newSheet.updatesSheetName !== '__none__' ? newSheet.updatesSheetName : undefined,
    });

    setNewSheet({
      id: '',
      name: '',
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      sheetName: '',
      updatesSheetName: '',
    });
    setAvailableSheets([]);
    setHasLoadedSheets(false);
    setIsOpen(false);

    toast({
      title: 'تم الإضافة بنجاح',
      description: `تم إضافة الشيت "${autoName}"`,
    });
  };

  const handleRemoveSheet = (id: string) => {
    if (sheets.length === 1) {
      toast({
        title: 'لا يمكن الحذف',
        description: 'يجب أن يكون هناك شيت واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    removeSheet(id);
    toast({
      title: 'تم الحذف',
      description: 'تم حذف الشيت',
    });
  };

  const handleSpreadsheetIdChange = (value: string) => {
    setNewSheet({ ...newSheet, spreadsheetId: value });
    setAvailableSheets([]);
    setHasLoadedSheets(false);
  };

  useEffect(() => {
    if (isOpen && DEFAULT_SPREADSHEET_ID) {
      setNewSheet({
        id: '',
        name: '',
        spreadsheetId: DEFAULT_SPREADSHEET_ID,
        sheetName: '',
        updatesSheetName: '',
      });
      setAvailableSheets([]);
      setHasLoadedSheets(false);
      
      const loadSheets = async () => {
        setIsLoadingSheets(true);
        try {
          const fetchedSheets = await fetchSpreadsheetSheets(DEFAULT_SPREADSHEET_ID);
          setAvailableSheets(fetchedSheets);
          setHasLoadedSheets(true);
        } catch (error: any) {
          toast({
            title: 'خطأ في تحميل الشيتات',
            description: error.message || 'تأكد من إضافة Google Sheets API Key',
            variant: 'destructive',
          });
          setHasLoadedSheets(false);
        } finally {
          setIsLoadingSheets(false);
        }
      };
      
      loadSheets();
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
          <DialogTitle>إدارة الشيتات</DialogTitle>
          <DialogDescription>
            اختر شيت أو أضف شيت جديد للعمل عليه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>الشيت النشط</Label>
            <div className="grid gap-2">
              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeSheet.id === sheet.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setActiveSheet(sheet)}
                  data-testid={`sheet-item-${sheet.id}`}
                >
                  <div className="flex items-center gap-3">
                    {activeSheet.id === sheet.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    <div>
                      <div className="font-medium">{sheet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {sheet.sheetName} - {sheet.spreadsheetId.slice(0, 15)}...
                      </div>
                    </div>
                  </div>
                  {sheets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSheet(sheet.id);
                      }}
                      data-testid={`button-remove-${sheet.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4" />
              <h3 className="font-medium">اختر شيت من السبريدشيت</h3>
            </div>
            
            <div className="space-y-4">
              {isLoadingSheets && (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">جاري تحميل الشيتات...</span>
                </div>
              )}

              {!isLoadingSheets && hasLoadedSheets && availableSheets.length > 0 && (
                <div>
                  <Label htmlFor="sheetSelect" className="text-base">اختر الشيت</Label>
                  <Select 
                    value={newSheet.sheetName} 
                    onValueChange={(value) => setNewSheet({ ...newSheet, sheetName: value })}
                  >
                    <SelectTrigger id="sheetSelect" data-testid="select-available-sheet" className="mt-2">
                      <SelectValue placeholder="اختر شيت من القائمة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSheets.map((sheet) => (
                        <SelectItem key={sheet.sheetId} value={sheet.title}>
                          {sheet.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    تم العثور على {availableSheets.length} شيت في السبريدشيت
                  </p>
                </div>
              )}

              {!isLoadingSheets && hasLoadedSheets && availableSheets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>لم يتم العثور على شيتات</p>
                  <p className="text-xs mt-2">تأكد من صحة Google Sheets API Key</p>
                </div>
              )}

              {hasLoadedSheets && availableSheets.length > 0 && (
                <div>
                  <Label htmlFor="updatesSheetName" className="text-sm">شيت سجل التعديلات (اختياري)</Label>
                  <Select 
                    value={newSheet.updatesSheetName || ''} 
                    onValueChange={(value) => setNewSheet({ ...newSheet, updatesSheetName: value })}
                  >
                    <SelectTrigger id="updatesSheetName" data-testid="select-updates-sheet" className="mt-2">
                      <SelectValue placeholder="لا يوجد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">لا يوجد</SelectItem>
                      {availableSheets.map((sheet) => (
                        <SelectItem key={`updates-${sheet.sheetId}`} value={sheet.title}>
                          {sheet.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {hasLoadedSheets && availableSheets.length > 0 && (
                <Button 
                  onClick={handleAddSheet} 
                  className="w-full"
                  data-testid="button-add-sheet"
                  disabled={!newSheet.sheetName}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة الشيت
                </Button>
              )}

              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                <p>السبريدشيت: {DEFAULT_SPREADSHEET_ID}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
