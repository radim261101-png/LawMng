import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Search, Download, X, Edit2 } from "lucide-react";
import { RecordsPagination } from "@/components/RecordsPagination";
import { exportToExcel } from "@/lib/excelExport";
import { useToast } from "@/hooks/use-toast";
import type { SheetRecord } from "@/hooks/useSheetRecords";
import { ColumnFilter } from "@/components/ColumnFilter";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function RecordsPage() {
  const { user } = useAuth();
  const { records, headers, isLoading, updateRecord } = useSheetRecords();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [editingRecord, setEditingRecord] = useState<SheetRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<Record<string, any>>({});

  const editableHeaders = useMemo(() => {
    return headers.slice(1).filter(h => h && h.trim());
  }, [headers]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    
    let filtered = records;

    // Apply column filters
    Object.keys(columnFilters).forEach(columnName => {
      const filterValues = columnFilters[columnName];
      if (filterValues && filterValues.size > 0) {
        filtered = filtered.filter(record => {
          const value = String(record[columnName] || '');
          return filterValues.has(value);
        });
      }
    });

    // Apply search term
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((record) =>
        Object.values(record).some(value => 
          value?.toString().toLowerCase().includes(searchLower)
        )
      );
    }
    
    return filtered;
  }, [records, debouncedSearchTerm, columnFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const handleEdit = useCallback((record: SheetRecord) => {
    setEditingRecord(record);
    const initialData: Record<string, any> = {};
    if (user?.role === "admin") {
      headers.forEach(header => {
        if (header && record[header] !== undefined) {
          initialData[header] = record[header];
        }
      });
    }
    setFormData(initialData);
  }, [user?.role, headers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsUpdating(true);
    try {
      const updates: Record<string, any> = {};
      
      if (user?.role === "admin") {
        Object.keys(formData).forEach(key => {
          if (key !== 'id' && key !== 'rowIndex') {
            updates[key] = formData[key];
          }
        });
      } else {
        editableHeaders.forEach(header => {
          const newValue = formData[header];
          const oldValue = editingRecord[header];
          
          if (newValue && newValue.toString().trim()) {
            if (oldValue && oldValue.toString().trim()) {
              updates[header] = `${oldValue}\n${newValue}`;
            } else {
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

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  const handleColumnFilterChange = useCallback((columnName: string, values: Set<string>) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: values
    }));
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(columnFilters).some(filter => filter && filter.size > 0) || !!searchTerm;
  }, [columnFilters, searchTerm]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedRecords.map(r => r.id));
      setSelectedRecords(allIds);
    } else {
      setSelectedRecords(new Set());
    }
  }, [paginatedRecords]);

  const handleSelectRecord = useCallback((recordId: string, checked: boolean) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(recordId);
      } else {
        newSet.delete(recordId);
      }
      return newSet;
    });
  }, []);

  const handleBulkEdit = useCallback(() => {
    setBulkEditData({});
    setBulkEditDialogOpen(true);
  }, []);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecords.size === 0) return;

    setIsUpdating(true);
    try {
      const recordsToUpdate = records?.filter(r => selectedRecords.has(r.id)) || [];
      
      for (const record of recordsToUpdate) {
        const updates: Record<string, any> = {};
        
        if (user?.role === "admin") {
          Object.keys(bulkEditData).forEach(key => {
            if (bulkEditData[key] && bulkEditData[key].toString().trim()) {
              updates[key] = bulkEditData[key];
            }
          });
        } else {
          editableHeaders.forEach(header => {
            const newValue = bulkEditData[header];
            const oldValue = record[header];
            
            if (newValue && newValue.toString().trim()) {
              if (oldValue && oldValue.toString().trim()) {
                updates[header] = `${oldValue}\n${newValue}`;
              } else {
                updates[header] = newValue;
              }
            }
          });
        }

        if (Object.keys(updates).length > 0) {
          await updateRecord(record, updates);
        }
      }

      setBulkEditDialogOpen(false);
      setSelectedRecords(new Set());
      setBulkEditData({});
      
      toast({
        title: 'تم التحديث الجماعي بنجاح',
        description: `تم تحديث ${recordsToUpdate.length} سجل بنجاح`,
      });
    } catch (error) {
      console.error('Bulk update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = useCallback(() => {
    try {
      exportToExcel({
        headers,
        records: filteredRecords,
        fileName: searchTerm ? 'filtered_records' : 'all_records'
      });
      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تحميل ملف Excel بنجاح',
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في التصدير',
        description: error.message || 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
      });
    }
  }, [headers, filteredRecords, searchTerm, toast]);

  const renderField = useCallback((fieldName: string) => {
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
  }, [user?.role, formData, editingRecord, handleInputChange]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">سجلات فاليو</h2>
          <p className="text-muted-foreground mt-1">عرض وتعديل السجلات القانونية من Google Sheets</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
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
            <div className="flex items-center gap-3">
              {searchTerm && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {filteredRecords.length} نتيجة
                </span>
              )}
              <Button
                onClick={handleExport}
                disabled={!filteredRecords.length || isLoading}
                variant="outline"
                data-testid="button-export-excel"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير لـ Excel
              </Button>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="gap-2"
                data-testid="button-clear-all-filters"
              >
                <X className="w-3 h-3" />
                مسح كل الفلاتر
              </Button>
            </div>
          )}
          {selectedRecords.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium">تم تحديد {selectedRecords.size} سجل</span>
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkEdit}
                className="gap-2"
                data-testid="button-bulk-edit"
              >
                <Edit2 className="w-4 h-4" />
                تعديل جماعي
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecords(new Set())}
                className="gap-2"
                data-testid="button-clear-selection"
              >
                <X className="w-3 h-3" />
                إلغاء التحديد
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={paginatedRecords.length > 0 && paginatedRecords.every(r => selectedRecords.has(r.id))}
                          onCheckedChange={handleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      {headers.slice(0, 8).map((header, index) => (
                        <TableHead key={index} className="text-right font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{header || `-`}</span>
                            {header && records && records.length > 0 && (
                              <ColumnFilter
                                columnName={header}
                                allValues={records.map(r => r[header])}
                                selectedValues={columnFilters[header] || new Set()}
                                onFilterChange={(values) => handleColumnFilterChange(header, values)}
                              />
                            )}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!paginatedRecords || paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headers.length + 1} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد سجلات متاحة"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-muted/50" data-testid={`row-record-${record.serial}`}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRecords.has(record.id)}
                              onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                              data-testid={`checkbox-record-${record.serial}`}
                            />
                          </TableCell>
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

            {filteredRecords.length > 0 && (
              <RecordsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={filteredRecords.length}
                className="mt-4"
              />
            )}
          </>
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

      {bulkEditDialogOpen && (
        <Dialog open={bulkEditDialogOpen} onOpenChange={() => setBulkEditDialogOpen(false)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل جماعي</DialogTitle>
              <DialogDescription>
                تعديل {selectedRecords.size} سجل في نفس الوقت
                {user?.role !== "admin" && (
                  <span className="block mt-2 text-sm text-blue-600">
                    ملاحظة: سيتم إضافة البيانات الجديدة إلى جميع السجلات المحددة
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBulkSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editableHeaders.map((header) => (
                  <div className="space-y-2" key={header}>
                    <Label htmlFor={`bulk-${header}`} className="text-sm font-medium">
                      {header}
                    </Label>
                    <Textarea
                      id={`bulk-${header}`}
                      value={bulkEditData[header] || ""}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, [header]: e.target.value }))}
                      placeholder={user?.role === "admin" ? "القيمة الجديدة..." : "أضف معلومات جديدة..."}
                      data-testid={`bulk-input-${header}`}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBulkEditDialogOpen(false)}
                  data-testid="button-bulk-cancel"
                  disabled={isUpdating}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isUpdating} data-testid="button-bulk-save">
                  {isUpdating ? "جاري الحفظ..." : `تحديث ${selectedRecords.size} سجل`}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
