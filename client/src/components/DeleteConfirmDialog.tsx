import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">تأكيد الحذف</h3>
            <p className="text-muted-foreground mb-4">
              هل أنت متأكد من حذف هذا السجل؟ لن تتمكن من التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onCancel} data-testid="button-cancel-delete">
                إلغاء
              </Button>
              <Button variant="destructive" onClick={onConfirm} data-testid="button-confirm-delete">
                حذف السجل
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
