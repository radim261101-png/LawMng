import { useState } from 'react';
import { useSheets } from '@/contexts/SheetsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, Plus, Trash2, Check } from 'lucide-react';
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
  const { toast } = useToast();

  const handleAddSheet = () => {
    if (!newSheet.id || !newSheet.name || !newSheet.spreadsheetId || !newSheet.sheetName) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    addSheet({
      ...newSheet,
      updatesSheetName: newSheet.updatesSheetName || undefined,
    });

    setNewSheet({
      id: '',
      name: '',
      spreadsheetId: '',
      sheetName: '',
      updatesSheetName: '',
    });

    toast({
      title: 'تم الإضافة بنجاح',
      description: 'تم إضافة الشيت الجديد',
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
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="id">معرف الشيت (ID) *</Label>
                <Input
                  id="id"
                  placeholder="مثال: valu-sheet"
                  value={newSheet.id}
                  onChange={(e) => setNewSheet({ ...newSheet, id: e.target.value })}
                  data-testid="input-new-sheet-id"
                />
              </div>

              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  placeholder="مثال: سجلات فاليو"
                  value={newSheet.name}
                  onChange={(e) => setNewSheet({ ...newSheet, name: e.target.value })}
                  data-testid="input-new-sheet-name"
                />
              </div>

              <div>
                <Label htmlFor="spreadsheetId">Spreadsheet ID *</Label>
                <Input
                  id="spreadsheetId"
                  placeholder="من رابط Google Sheets"
                  value={newSheet.spreadsheetId}
                  onChange={(e) => setNewSheet({ ...newSheet, spreadsheetId: e.target.value })}
                  data-testid="input-new-sheet-spreadsheet-id"
                />
              </div>

              <div>
                <Label htmlFor="sheetName">اسم الشيت في Google Sheets *</Label>
                <Input
                  id="sheetName"
                  placeholder="مثال: Sheet1"
                  value={newSheet.sheetName}
                  onChange={(e) => setNewSheet({ ...newSheet, sheetName: e.target.value })}
                  data-testid="input-new-sheet-sheet-name"
                />
              </div>

              <div>
                <Label htmlFor="updatesSheetName">شيت سجل التعديلات (اختياري)</Label>
                <Input
                  id="updatesSheetName"
                  placeholder="مثال: UpdatesLog"
                  value={newSheet.updatesSheetName}
                  onChange={(e) => setNewSheet({ ...newSheet, updatesSheetName: e.target.value })}
                  data-testid="input-new-sheet-updates-name"
                />
              </div>

              <Button 
                onClick={handleAddSheet} 
                className="w-full"
                data-testid="button-add-sheet"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة الشيت
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
