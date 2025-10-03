import { LegalRecord } from '@/contexts/RecordsContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RecordsTableProps {
  records: LegalRecord[];
  onEdit?: (record: LegalRecord) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  currentUser?: string;
}

export default function RecordsTable({ records, onEdit, onDelete, isAdmin, currentUser }: RecordsTableProps) {
  const canEditRecord = (record: LegalRecord) => {
    return isAdmin || record.createdBy === currentUser;
  };
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right font-semibold">نوع المحضر</TableHead>
              <TableHead className="text-right font-semibold">رقم الحصر</TableHead>
              <TableHead className="text-right font-semibold">تاريخ التأجيل</TableHead>
              <TableHead className="text-right font-semibold">الحكم</TableHead>
              <TableHead className="text-right font-semibold">محكمة أول درجة</TableHead>
              <TableHead className="text-right font-semibold">المحامي</TableHead>
              <TableHead className="text-right font-semibold">تاريخ التحديث</TableHead>
              <TableHead className="text-center font-semibold">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات متاحة
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="hover-elevate" data-testid={`row-record-${record.id}`}>
                  <TableCell className="font-medium" data-testid={`text-recordType-${record.id}`}>
                    {record.recordType || '-'}
                  </TableCell>
                  <TableCell data-testid={`text-regNumber-${record.id}`}>
                    {record.registrationNumber || '-'}
                  </TableCell>
                  <TableCell data-testid={`text-postponementDate-${record.id}`}>
                    {record.postponementDate || '-'}
                  </TableCell>
                  <TableCell data-testid={`text-ruling-${record.id}`}>
                    {record.ruling || '-'}
                  </TableCell>
                  <TableCell data-testid={`text-court-${record.id}`}>
                    {record.firstInstanceCourt || '-'}
                  </TableCell>
                  <TableCell data-testid={`text-lawyer-${record.id}`}>
                    {record.lastUpdateLawyer || '-'}
                  </TableCell>
                  <TableCell data-testid={`text-updateDate-${record.id}`}>
                    {record.updateDate || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {canEditRecord(record) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit?.(record)}
                          data-testid={`button-edit-${record.id}`}
                        >
                          <Pencil className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete?.(record.id)}
                          data-testid={`button-delete-${record.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
