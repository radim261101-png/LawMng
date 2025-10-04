import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock, User, FileEdit } from 'lucide-react';
import { getUpdatesLog } from '@/lib/googleSheets';

interface RecordUpdate {
  id: string;
  serial?: string;
  updatedBy?: string;
  updatedAt?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}

const fieldLabels: Record<string, string> = {
  reportType: 'نوع البلاغ',
  postponementDate: 'تاريخ التأجيل',
  postponementReason: 'سبب التأجيل',
  ruling: 'الحكم',
  inventoryNumber: 'رقم الجرد',
  firstInstanceCourtNotes: 'ملاحظات محكمة أول درجة',
  oppositionSessionDate: 'تاريخ جلسة المعارضة',
  oppositionRuling: 'حكم المعارضة',
  oppositionInventoryNumber: 'رقم جرد المعارضة',
  firstAppealSessionDate: 'تاريخ جلسة الاستئناف الأولى',
  appealCourtLocation: 'موقع محكمة الاستئناف',
  clientAppealNumber: 'رقم استئناف العميل',
  appealRulingText: 'نص حكم الاستئناف',
  appealInventoryNumber: 'رقم جرد الاستئناف',
  appealOppositionDate: 'تاريخ معارضة الاستئناف',
  appealOppositionRuling: 'حكم معارضة الاستئناف',
  appealOppositionInventoryNumber: 'رقم جرد معارضة الاستئناف',
  settlementMailDate: 'تاريخ بريد التسوية',
  settlementConfirmationDate: 'تاريخ تأكيد التسوية',
  debtDocumentReturnDate: 'تاريخ إرجاع مستند الدين',
  debtDocumentReturnReason: 'سبب إرجاع مستند الدين',
  depositReceiptStatus: 'حالة إيصال الإيداع',
  updateDate: 'تاريخ التحديث',
  lastUpdateLawyer: 'آخر محامي محدث',
  extract: 'المستخرج',
  invoice: 'الفاتورة',
  notes: 'ملاحظات',
  sessionUpdate: 'تحديث الجلسة',
  required: 'مطلوب',
  report: 'التقرير',
  archived: 'مؤرشف',
  paidCases: 'القضايا المدفوعة',
  reportPreparationLawyer: 'محامي إعداد التقرير',
  sessionAttendanceLawyer: 'محامي حضور الجلسة',
  extractionLawyer: 'محامي الاستخراج',
  settlementLawyer: 'محامي التسوية',
  claimSent: 'تم إرسال المطالبة',
  branchesReceipt: 'إيصال الفروع',
  receiptDate: 'تاريخ الاستلام',
};

export default function UpdatesHistoryPage() {
  const { data: updates, isLoading } = useQuery<RecordUpdate[]>({
    queryKey: ['updates-log'],
    queryFn: getUpdatesLog,
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground text-right" data-testid="text-page-title">
            سجل التعديلات
          </h2>
          <p className="text-muted-foreground mt-1 text-right">
            جميع التعديلات التي تم إجراؤها على السجلات من قبل المستخدمين
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : !updates || updates.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">لا توجد تعديلات حتى الآن</CardTitle>
              <CardDescription className="text-right">
                سيتم عرض التعديلات هنا بعد إنشاء شيت UpdatesLog وتحديث Google Apps Script
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                تأكد من اتباع التعليمات أعلاه لتفعيل سجل التعديلات
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id} data-testid={`card-update-${update.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-right">
                    {update.fieldName ? (fieldLabels[update.fieldName] || update.fieldName) : 'تعديل'}
                    <FileEdit className="h-5 w-5 text-primary mr-auto" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground text-right">
                    <span data-testid={`text-serial-${update.id}`}>
                      رقم السجل: <strong>{update.serial || 'غير محدد'}</strong>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground text-right">
                    <span data-testid={`text-updatedby-${update.id}`}>
                      تم التعديل بواسطة: <strong>{update.updatedBy || 'غير معروف'}</strong>
                    </span>
                    <User className="h-4 w-4 mr-auto" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground text-right">
                    <span data-testid={`text-updatedat-${update.id}`}>
                      {update.updatedAt ? format(new Date(update.updatedAt), 'PPpp', { locale: ar }) : 'غير محدد'}
                    </span>
                    <Clock className="h-4 w-4 mr-auto" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground text-right">القيمة القديمة:</p>
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
                        <p className="text-sm whitespace-pre-wrap text-right" data-testid={`text-oldvalue-${update.id}`}>
                          {update.oldValue || <span className="text-muted-foreground italic">لا يوجد</span>}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground text-right">القيمة الجديدة:</p>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900">
                        <p className="text-sm whitespace-pre-wrap text-right" data-testid={`text-newvalue-${update.id}`}>
                          {update.newValue || <span className="text-muted-foreground italic">لا يوجد</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
