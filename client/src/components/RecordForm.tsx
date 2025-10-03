import { useState } from 'react';
import { LegalRecord } from '@/contexts/RecordsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface RecordFormProps {
  record?: LegalRecord;
  onSubmit: (data: Omit<LegalRecord, 'id'>) => void;
  onCancel: () => void;
}

export default function RecordForm({ record, onSubmit, onCancel }: RecordFormProps) {
  const [formData, setFormData] = useState<Omit<LegalRecord, 'id'>>({
    createdBy: record?.createdBy || '',
    recordType: record?.recordType || '',
    postponementDate: record?.postponementDate || '',
    postponementReason: record?.postponementReason || '',
    ruling: record?.ruling || '',
    registrationNumber: record?.registrationNumber || '',
    notes: record?.notes || '',
    firstInstanceCourt: record?.firstInstanceCourt || '',
    oppositionSessionDate: record?.oppositionSessionDate || '',
    oppositionRuling: record?.oppositionRuling || '',
    oppositionRegistrationNumber: record?.oppositionRegistrationNumber || '',
    appealFirstSessionDate: record?.appealFirstSessionDate || '',
    courtLocation: record?.courtLocation || '',
    clientAppealNumber: record?.clientAppealNumber || '',
    appealRulingText: record?.appealRulingText || '',
    appealRegistrationNumber: record?.appealRegistrationNumber || '',
    appealOppositionDate: record?.appealOppositionDate || '',
    appealOppositionRuling: record?.appealOppositionRuling || '',
    appealOppositionRegistrationNumber: record?.appealOppositionRegistrationNumber || '',
    settlementRequestDate: record?.settlementRequestDate || '',
    settlementConfirmationDate: record?.settlementConfirmationDate || '',
    depositReceiptStatus: record?.depositReceiptStatus || '',
    updateDate: record?.updateDate || new Date().toISOString().split('T')[0],
    lastUpdateLawyer: record?.lastUpdateLawyer || '',
    extract: record?.extract || '',
    sessionUpdateNotes: record?.sessionUpdateNotes || '',
    required: record?.required || '',
    report: record?.report || '',
    archivedCases: record?.archivedCases || '',
    recordPreparationLawyer: record?.recordPreparationLawyer || '',
    sessionAttendanceLawyer: record?.sessionAttendanceLawyer || '',
    extractionLawyer: record?.extractionLawyer || '',
    settlementLawyer: record?.settlementLawyer || '',
    claimSent: record?.claimSent || '',
    branchesReceived: record?.branchesReceived || '',
    receivingDate: record?.receivingDate || '',
    debtBondReturnDate: record?.debtBondReturnDate || '',
    debtBondReturnReason: record?.debtBondReturnReason || '',
    invoice: record?.invoice || '',
  });

  const handleChange = (field: keyof Omit<LegalRecord, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold">
            {record ? 'تعديل السجل' : 'إضافة سجل جديد'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel} data-testid="button-close-form">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="pb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">معلومات المحضر الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordType">نوع المحضر *</Label>
                  <Input
                    id="recordType"
                    value={formData.recordType}
                    onChange={(e) => handleChange('recordType', e.target.value)}
                    placeholder="محضر تكليف بالوفاء"
                    required
                    data-testid="input-recordType"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">رقم الحصر *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    placeholder="2024/12345"
                    required
                    data-testid="input-registrationNumber"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postponementDate">تاريخ تأجيل الجلسة</Label>
                  <Input
                    id="postponementDate"
                    type="date"
                    value={formData.postponementDate}
                    onChange={(e) => handleChange('postponementDate', e.target.value)}
                    data-testid="input-postponementDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postponementReason">سبب تأجيل الجلسة</Label>
                  <Input
                    id="postponementReason"
                    value={formData.postponementReason}
                    onChange={(e) => handleChange('postponementReason', e.target.value)}
                    placeholder="تأجيل لحضور الخصم"
                    data-testid="input-postponementReason"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruling">الحكم</Label>
                  <Input
                    id="ruling"
                    value={formData.ruling}
                    onChange={(e) => handleChange('ruling', e.target.value)}
                    placeholder="قيد النظر / صدور حكم"
                    data-testid="input-ruling"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateDate">تاريخ التحديث</Label>
                  <Input
                    id="updateDate"
                    type="date"
                    value={formData.updateDate}
                    onChange={(e) => handleChange('updateDate', e.target.value)}
                    data-testid="input-updateDate"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="أي ملاحظات إضافية"
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">محكمة أول درجة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstInstanceCourt">محكمة أول درجة</Label>
                  <Input
                    id="firstInstanceCourt"
                    value={formData.firstInstanceCourt}
                    onChange={(e) => handleChange('firstInstanceCourt', e.target.value)}
                    placeholder="محكمة القاهرة الابتدائية"
                    data-testid="input-firstInstanceCourt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courtLocation">مقر انعقاد المحكمة</Label>
                  <Input
                    id="courtLocation"
                    value={formData.courtLocation}
                    onChange={(e) => handleChange('courtLocation', e.target.value)}
                    placeholder="القاهرة"
                    data-testid="input-courtLocation"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">المعارضة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oppositionSessionDate">تاريخ جلسة المعارضة</Label>
                  <Input
                    id="oppositionSessionDate"
                    type="date"
                    value={formData.oppositionSessionDate}
                    onChange={(e) => handleChange('oppositionSessionDate', e.target.value)}
                    data-testid="input-oppositionSessionDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oppositionRuling">الحكم بجلسة المعارضة</Label>
                  <Input
                    id="oppositionRuling"
                    value={formData.oppositionRuling}
                    onChange={(e) => handleChange('oppositionRuling', e.target.value)}
                    data-testid="input-oppositionRuling"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oppositionRegistrationNumber">رقم حصر المعارضة</Label>
                  <Input
                    id="oppositionRegistrationNumber"
                    value={formData.oppositionRegistrationNumber}
                    onChange={(e) => handleChange('oppositionRegistrationNumber', e.target.value)}
                    data-testid="input-oppositionRegistrationNumber"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">الاستئناف</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appealFirstSessionDate">تاريخ أول جلسة مستأنف</Label>
                  <Input
                    id="appealFirstSessionDate"
                    type="date"
                    value={formData.appealFirstSessionDate}
                    onChange={(e) => handleChange('appealFirstSessionDate', e.target.value)}
                    data-testid="input-appealFirstSessionDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAppealNumber">رقم الاستئناف للعميل</Label>
                  <Input
                    id="clientAppealNumber"
                    value={formData.clientAppealNumber}
                    onChange={(e) => handleChange('clientAppealNumber', e.target.value)}
                    data-testid="input-clientAppealNumber"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="appealRulingText">منطوق حكم الاستئناف</Label>
                  <Textarea
                    id="appealRulingText"
                    value={formData.appealRulingText}
                    onChange={(e) => handleChange('appealRulingText', e.target.value)}
                    rows={2}
                    data-testid="input-appealRulingText"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appealRegistrationNumber">رقم حصر المستأنف</Label>
                  <Input
                    id="appealRegistrationNumber"
                    value={formData.appealRegistrationNumber}
                    onChange={(e) => handleChange('appealRegistrationNumber', e.target.value)}
                    data-testid="input-appealRegistrationNumber"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appealOppositionDate">تاريخ جلسة المعارضة الاستئنافية</Label>
                  <Input
                    id="appealOppositionDate"
                    type="date"
                    value={formData.appealOppositionDate}
                    onChange={(e) => handleChange('appealOppositionDate', e.target.value)}
                    data-testid="input-appealOppositionDate"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="appealOppositionRuling">منطوق حكم المعارضة الاستئنافية</Label>
                  <Textarea
                    id="appealOppositionRuling"
                    value={formData.appealOppositionRuling}
                    onChange={(e) => handleChange('appealOppositionRuling', e.target.value)}
                    rows={2}
                    data-testid="input-appealOppositionRuling"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appealOppositionRegistrationNumber">رقم حصر المعارضة الاستئنافية</Label>
                  <Input
                    id="appealOppositionRegistrationNumber"
                    value={formData.appealOppositionRegistrationNumber}
                    onChange={(e) => handleChange('appealOppositionRegistrationNumber', e.target.value)}
                    data-testid="input-appealOppositionRegistrationNumber"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">التصالح والمتابعة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settlementRequestDate">تاريخ ميل التصالح</Label>
                  <Input
                    id="settlementRequestDate"
                    type="date"
                    value={formData.settlementRequestDate}
                    onChange={(e) => handleChange('settlementRequestDate', e.target.value)}
                    data-testid="input-settlementRequestDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlementConfirmationDate">تاريخ إثبات التصالح</Label>
                  <Input
                    id="settlementConfirmationDate"
                    type="date"
                    value={formData.settlementConfirmationDate}
                    onChange={(e) => handleChange('settlementConfirmationDate', e.target.value)}
                    data-testid="input-settlementConfirmationDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositReceiptStatus">موقف إيصال الأمانة</Label>
                  <Input
                    id="depositReceiptStatus"
                    value={formData.depositReceiptStatus}
                    onChange={(e) => handleChange('depositReceiptStatus', e.target.value)}
                    placeholder="بالمكتب / بالمحكمة"
                    data-testid="input-depositReceiptStatus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debtBondReturnDate">تاريخ رد سند مديونية العميل للشركة</Label>
                  <Input
                    id="debtBondReturnDate"
                    type="date"
                    value={formData.debtBondReturnDate}
                    onChange={(e) => handleChange('debtBondReturnDate', e.target.value)}
                    data-testid="input-debtBondReturnDate"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="debtBondReturnReason">سبب رد سند مديونية العميل للشركة</Label>
                  <Textarea
                    id="debtBondReturnReason"
                    value={formData.debtBondReturnReason}
                    onChange={(e) => handleChange('debtBondReturnReason', e.target.value)}
                    rows={2}
                    data-testid="input-debtBondReturnReason"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimSent">إرسال المطالبة</Label>
                  <Input
                    id="claimSent"
                    value={formData.claimSent}
                    onChange={(e) => handleChange('claimSent', e.target.value)}
                    data-testid="input-claimSent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchesReceived">استلام الفروع</Label>
                  <Input
                    id="branchesReceived"
                    value={formData.branchesReceived}
                    onChange={(e) => handleChange('branchesReceived', e.target.value)}
                    data-testid="input-branchesReceived"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivingDate">تاريخ الاستلام</Label>
                  <Input
                    id="receivingDate"
                    type="date"
                    value={formData.receivingDate}
                    onChange={(e) => handleChange('receivingDate', e.target.value)}
                    data-testid="input-receivingDate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice">الفاتورة</Label>
                  <Input
                    id="invoice"
                    value={formData.invoice}
                    onChange={(e) => handleChange('invoice', e.target.value)}
                    data-testid="input-invoice"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">المحامون والمستخرجات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordPreparationLawyer">المحامي القائم بتحرير المحضر</Label>
                  <Input
                    id="recordPreparationLawyer"
                    value={formData.recordPreparationLawyer}
                    onChange={(e) => handleChange('recordPreparationLawyer', e.target.value)}
                    data-testid="input-recordPreparationLawyer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionAttendanceLawyer">المحامي القائم بحضور الجلسة</Label>
                  <Input
                    id="sessionAttendanceLawyer"
                    value={formData.sessionAttendanceLawyer}
                    onChange={(e) => handleChange('sessionAttendanceLawyer', e.target.value)}
                    data-testid="input-sessionAttendanceLawyer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extractionLawyer">المحامي القائم باستخراج</Label>
                  <Input
                    id="extractionLawyer"
                    value={formData.extractionLawyer}
                    onChange={(e) => handleChange('extractionLawyer', e.target.value)}
                    data-testid="input-extractionLawyer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlementLawyer">محامي قام بالتصالح</Label>
                  <Input
                    id="settlementLawyer"
                    value={formData.settlementLawyer}
                    onChange={(e) => handleChange('settlementLawyer', e.target.value)}
                    data-testid="input-settlementLawyer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastUpdateLawyer">المحامي القائم بآخر تحديث</Label>
                  <Input
                    id="lastUpdateLawyer"
                    value={formData.lastUpdateLawyer}
                    onChange={(e) => handleChange('lastUpdateLawyer', e.target.value)}
                    data-testid="input-lastUpdateLawyer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extract">المستخرج</Label>
                  <Input
                    id="extract"
                    value={formData.extract}
                    onChange={(e) => handleChange('extract', e.target.value)}
                    data-testid="input-extract"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">التقارير والأرشفة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="required">المطلوب</Label>
                  <Input
                    id="required"
                    value={formData.required}
                    onChange={(e) => handleChange('required', e.target.value)}
                    data-testid="input-required"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report">التقرير</Label>
                  <Input
                    id="report"
                    value={formData.report}
                    onChange={(e) => handleChange('report', e.target.value)}
                    data-testid="input-report"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="archivedCases">أرشيف الدعاوى التي تم صرفها</Label>
                  <Input
                    id="archivedCases"
                    value={formData.archivedCases}
                    onChange={(e) => handleChange('archivedCases', e.target.value)}
                    data-testid="input-archivedCases"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sessionUpdateNotes">ملاحظات تحديث جلسة</Label>
                  <Textarea
                    id="sessionUpdateNotes"
                    value={formData.sessionUpdateNotes}
                    onChange={(e) => handleChange('sessionUpdateNotes', e.target.value)}
                    rows={3}
                    data-testid="input-sessionUpdateNotes"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
              إلغاء
            </Button>
            <Button type="submit" data-testid="button-submit">
              {record ? 'تحديث السجل' : 'إضافة السجل'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
