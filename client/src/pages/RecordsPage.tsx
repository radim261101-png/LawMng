import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Search, BarChart3 } from "lucide-react";
import { ValuRecord } from "@shared/schema";
import { Link } from "wouter";

export default function RecordsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState<ValuRecord | null>(null);
  const [formData, setFormData] = useState<Partial<ValuRecord>>({});
  const [appendData, setAppendData] = useState<Record<string, string>>({});

  const { data: records, isLoading } = useQuery<ValuRecord[]>({
    queryKey: ["/api/records"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<ValuRecord> }) => {
      const res = await apiRequest("PATCH", `/api/records/${data.id}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      setEditingRecord(null);
      setAppendData({});
      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ التعديلات على السجل",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث السجل",
        variant: "destructive",
      });
    },
  });

  const filteredRecords = records?.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.clientName?.toLowerCase().includes(searchLower) ||
      record.accountNumber?.toLowerCase().includes(searchLower) ||
      record.nationalId?.toLowerCase().includes(searchLower) ||
      record.serial?.toString().includes(searchTerm)
    );
  });

  const handleEdit = (record: ValuRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setAppendData({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    let updates: Partial<ValuRecord>;
    
    if (user?.role === "admin") {
      updates = { ...formData };
      delete updates.id;
      delete updates.serial;
      delete updates.createdBy;
    } else {
      updates = { ...appendData };
    }

    updateMutation.mutate({ id: editingRecord.id, updates });
  };

  const handleInputChange = (field: string, value: string) => {
    if (user?.role === "admin") {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setAppendData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const renderField = (fieldName: string, label: string, type: "input" | "textarea" | "date" = "input") => {
    const isAdmin = user?.role === "admin";
    const value = isAdmin ? (formData[fieldName as keyof ValuRecord] as string || "") : "";
    const appendValue = isAdmin ? "" : (appendData[fieldName] || "");
    const oldValue = editingRecord?.[fieldName as keyof ValuRecord] as string;

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label}</Label>
        {isAdmin ? (
          type === "textarea" ? (
            <Textarea
              id={fieldName}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              data-testid={`input-${fieldName}`}
              rows={3}
            />
          ) : (
            <Input
              id={fieldName}
              type={type}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              data-testid={`input-${fieldName}`}
            />
          )
        ) : (
          <div>
            {oldValue && (
              <div className="mb-2 p-3 bg-muted rounded-md text-sm">
                <span className="font-semibold text-muted-foreground">القيمة الحالية:</span>
                <p className="mt-1 whitespace-pre-wrap">{oldValue}</p>
              </div>
            )}
            {type === "textarea" ? (
              <Textarea
                id={fieldName}
                value={appendValue}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                placeholder={oldValue ? "أضف معلومات جديدة هنا..." : "أدخل المعلومات..."}
                data-testid={`input-${fieldName}`}
                rows={2}
              />
            ) : (
              <Input
                id={fieldName}
                type={type}
                value={appendValue}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                placeholder={oldValue ? "أضف معلومات جديدة..." : "أدخل المعلومات..."}
                data-testid={`input-${fieldName}`}
              />
            )}
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
          <p className="text-muted-foreground mt-1">عرض وتعديل السجلات القانونية</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="بحث بالاسم، رقم الحساب، أو الرقم القومي..."
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
                    <TableHead className="text-right font-semibold">سريل</TableHead>
                    <TableHead className="text-right font-semibold">اسم العميل</TableHead>
                    <TableHead className="text-right font-semibold">رقم الحساب</TableHead>
                    <TableHead className="text-right font-semibold">الرقم القومي</TableHead>
                    <TableHead className="text-right font-semibold">رقم الجنحة</TableHead>
                    <TableHead className="text-right font-semibold">الحكم</TableHead>
                    <TableHead className="text-right font-semibold">المحافظة</TableHead>
                    <TableHead className="text-center font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!filteredRecords || filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        لا توجد سجلات متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50" data-testid={`row-record-${record.serial}`}>
                        <TableCell className="font-medium">{record.serial}</TableCell>
                        <TableCell>{record.clientName || "-"}</TableCell>
                        <TableCell>{record.accountNumber || "-"}</TableCell>
                        <TableCell>{record.nationalId || "-"}</TableCell>
                        <TableCell>{record.crimeNumber || "-"}</TableCell>
                        <TableCell>{record.ruling || "-"}</TableCell>
                        <TableCell>{record.governorate || "-"}</TableCell>
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
              <DialogTitle>تعديل السجل - {editingRecord.clientName}</DialogTitle>
              <DialogDescription>
                السريل: {editingRecord.serial} | رقم الحساب: {editingRecord.accountNumber}
                {user?.role !== "admin" && (
                  <span className="block mt-2 text-sm text-blue-600">
                    ملاحظة: يمكنك إضافة بيانات جديدة فقط. البيانات السابقة محمية ومعروضة للمرجعية.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">معلومات المحضر</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("reportType", "نوع المحضر")}
                    {renderField("postponementDate", "تاريخ تأجيل الجلسة", "date")}
                    {renderField("postponementReason", "سبب تأجيل الجلسة")}
                    {renderField("ruling", "الحكم")}
                    {renderField("inventoryNumber", "رقم الحصر")}
                    <div className="col-span-2">
                      {renderField("firstInstanceCourtNotes", "ملاحظات محكمة أول درجة", "textarea")}
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">معلومات المعارضة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("oppositionSessionDate", "تاريخ جلسة المعارضة", "date")}
                    {renderField("oppositionRuling", "الحكم بجلسة المعارضة")}
                    {renderField("oppositionInventoryNumber", "رقم حصر المعارضة")}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">معلومات الاستئناف</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("firstAppealSessionDate", "تاريخ أول جلسة مستأنف", "date")}
                    {renderField("appealCourtLocation", "مقر انعقاد المحكمة")}
                    {renderField("clientAppealNumber", "رقم الاستئناف للعميل")}
                    {renderField("appealRulingText", "منطوق حكم الاستئناف")}
                    {renderField("appealInventoryNumber", "رقم حصر المستأنف")}
                    {renderField("appealOppositionDate", "تاريخ جلسة المعارضة الاستئنافية", "date")}
                    {renderField("appealOppositionRuling", "منطوق حكم المعارضة الاستئنافية")}
                    {renderField("appealOppositionInventoryNumber", "رقم حصر المعارضة الاستئنافية")}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">معلومات التصالح</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("settlementMailDate", "تاريخ ميل التصالح", "date")}
                    {renderField("settlementConfirmationDate", "تاريخ إثبات التصالح", "date")}
                    {renderField("debtDocumentReturnDate", "تاريخ رد سند مديونية العميل", "date")}
                    {renderField("debtDocumentReturnReason", "سبب رد سند مديونية العميل")}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">المحامون المكلفون</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("reportPreparationLawyer", "المحامي القائم بتحرير المحضر")}
                    {renderField("sessionAttendanceLawyer", "المحامي القائم بحضور الجلسة")}
                    {renderField("extractionLawyer", "المحامي القائم باستخراج")}
                    {renderField("settlementLawyer", "محامي قام بالتصالح")}
                    {renderField("lastUpdateLawyer", "المحامي القائم بآخر تحديث")}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-primary">معلومات إضافية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("depositReceiptStatus", "موقف إيصال الأمانة")}
                    {renderField("updateDate", "تاريخ التحديث", "date")}
                    {renderField("extract", "المستخرج")}
                    {renderField("invoice", "الفاتورة")}
                    {renderField("claimSent", "إرسال المطالبة")}
                    {renderField("branchesReceipt", "استلام الفروع")}
                    {renderField("receiptDate", "تاريخ الاستلام", "date")}
                    {renderField("required", "المطلوب")}
                    {renderField("report", "التقرير")}
                    {renderField("archived", "أرشيف الدعاوي")}
                    {renderField("paidCases", "الدعاوي التي تم صرفها")}
                    <div className="col-span-2">
                      {renderField("sessionUpdate", "تحديث جلسة", "textarea")}
                    </div>
                    <div className="col-span-2">
                      {renderField("notes", "ملاحظات", "textarea")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                  data-testid="button-cancel"
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save">
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
