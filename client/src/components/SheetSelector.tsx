import { useState } from 'react';
import { useSheets } from '@/contexts/SheetsContext';
import { fetchSpreadsheetSheets, type SpreadsheetSheet } from '@/lib/googleSheets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, Plus, Trash2, Check, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SheetSelector() {
  const { sheets, activeSheet, setActiveSheet, addSheet, removeSheet } = useSheets();
  const [isOpen, setIsOpen] = useState(false);
  const [newSheet, setNewSheet] = useState({
    id: '',
    name: '',
    spreadsheetId: '',
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
      spreadsheetId: '',
      sheetName: '',
      updatesSheetName: '',
    });
    setAvailableSheets([]);
    setHasLoadedSheets(false);

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
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4" />
              <h3 className="font-medium">إضافة شيت جديد</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="spreadsheetId" className="text-base">رابط أو معرف السبريدشيت</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="spreadsheetId"
                    placeholder="الصق هنا الرابط الكامل أو الـ ID فقط"
                    value={newSheet.spreadsheetId}
                    onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
                    data-testid="input-new-sheet-spreadsheet-id"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleLoadSheets}
                    disabled={isLoadingSheets || !newSheet.spreadsheetId}
                    data-testid="button-load-sheets"
                  >
                    {isLoadingSheets ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="mr-2">تحميل</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  مثال: 1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4
                </p>
              </div>

              {hasLoadedSheets && availableSheets.length > 0 && (
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
                  <p className="text-xs text-muted-foreground mt-1.5">
                    ✓ تم العثور على {availableSheets.length} شيت
                  </p>
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
