import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSheetRecords } from "@/hooks/useSheetRecords";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Search } from "lucide-react";
import type { SheetRecord } from "@/hooks/useSheetRecords";

export default function RecordsPage() {
  const { user } = useAuth();
  const { records, headers, isLoading, updateRecord } = useSheetRecords();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<SheetRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Skip first column (usually serial number) for editing
  const editableHeaders = useMemo(() => {
    return headers.slice(1).filter(h => h && h.trim());
  }, [headers]);

  const filteredRecords = records?.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(record).some(value => 
      value?.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (record: SheetRecord) => {
    setEditingRecord(record);
    // Initialize form data with all record data
    const initialData: Record<string, any> = {};
    headers.forEach(header => {
      if (header && record[header] !== undefined) {
        initialData[header] = record[header];
      }
    });
    setFormData(initialData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsUpdating(true);
    try {
      // Prepare updates based on user role
      const updates: Record<string, any> = {};
      
      if (user?.role === "admin") {
        // Admin can update all fields
        Object.keys(formData).forEach(key => {
          if (key !== 'id' && key !== 'rowIndex') {
            updates[key] = formData[key];
          }
        });
      } else {
        // Regular users: append to existing fields
        editableHeaders.forEach(header => {
          const newValue = formData[header];
          const oldValue = editingRecord[header];
          
          if (newValue && newValue.toString().trim()) {
            if (oldValue && oldValue.toString().trim()) {
              // Append new value to old value
              updates[header] = `${oldValue}\n${newValue}`;
            } else {
              // Just set the new value
              updates[header] = newValue;
            }
          }
        });
      }

      await updateRecord(editingRecord, updates);
      setEditingRecord(null);
      setFormData({});
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (fieldName: string) => {
    const isAdmin = user?.role === "admin";
    const value = formData[fieldName] || "";
    const oldValue = editingRecord?.[fieldName];

    return (
      <div className="space-y-2" key={fieldName}>
        <Label htmlFor={fieldName} className="text-sm font-medium">
          {fieldName}
        </Label>
        {isAdmin ? (
          <Textarea
            id={fieldName}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            data-testid={`input-${fieldName}`}
            rows={2}
            className="resize-none"
          />
        ) : (
          <div>
            {oldValue && (
              <div className="mb-2 p-3 bg-muted rounded-md text-sm">
                <span className="font-semibold text-muted-foreground">القيمة الحالية:</span>
                <p className="mt-1 whitespace-pre-wrap">{oldValue}</p>
              </div>
            )}
            <Textarea
              id={fieldName}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={oldValue ? "أضف معلومات جديدة هنا..." : "أدخل المعلومات..."}
              data-testid={`input-${fieldName}`}
              rows={2}
              className="resize-none"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">سجلات فاليو</h2>
          <p className="text-muted-foreground mt-1">عرض وتعديل السجلات القانونية من Google Sheets</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="بحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {headers.slice(0, 8).map((header, index) => (
                      <TableHead key={index} className="text-right font-semibold whitespace-nowrap">
                        {header || `-`}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!filteredRecords || filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1} className="text-center py-8 text-muted-foreground">
                        لا توجد سجلات متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50" data-testid={`row-record-${record.serial}`}>
                        {headers.slice(0, 8).map((header, index) => (
                          <TableCell key={index} className={index === 0 ? "font-medium" : ""}>
                            {record[header] || "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                            data-testid={`button-edit-${record.serial}`}
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل السجل</DialogTitle>
              <DialogDescription>
                السريل: {editingRecord.serial}
                {user?.role !== "admin" && (
                  <span className="block mt-2 text-sm text-blue-600">
                    ملاحظة: يمكنك إضافة بيانات جديدة فقط. البيانات السابقة محمية ومعروضة للمرجعية.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editableHeaders.map((header) => renderField(header))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                  data-testid="button-cancel"
                  disabled={isUpdating}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isUpdating} data-testid="button-save">
                  {isUpdating ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
