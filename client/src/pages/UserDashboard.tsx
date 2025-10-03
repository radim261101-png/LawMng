import { useState } from 'react';
import { useRecords } from '@/contexts/RecordsContext';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import RecordsTable from '@/components/RecordsTable';
import RecordForm from '@/components/RecordForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserDashboard() {
  const { records, addRecord, updateRecord, deleteRecord } = useRecords();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddRecord = (data: any) => {
    if (user) {
      addRecord(data, user.username);
      setShowForm(false);
      toast({
        title: 'تم إضافة السجل بنجاح',
        description: 'تم إضافة السجل الجديد إلى النظام',
      });
    }
  };

  const handleUpdateRecord = (data: any) => {
    if (editingRecord) {
      updateRecord(editingRecord.id, data);
      setEditingRecord(null);
      toast({
        title: 'تم تحديث السجل بنجاح',
        description: 'تم حفظ التعديلات على السجل',
      });
    }
  };

  const handleDeleteRecord = () => {
    if (deletingRecordId) {
      deleteRecord(deletingRecordId);
      setDeletingRecordId(null);
      toast({
        title: 'تم حذف السجل',
        description: 'تم حذف السجل من النظام',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">سجلات القضايا</h2>
            <p className="text-muted-foreground mt-1">عرض وإضافة السجلات القانونية</p>
          </div>
          <Button onClick={() => setShowForm(true)} data-testid="button-add-record">
            <Plus className="w-4 h-4 ml-2" />
            إضافة سجل جديد
          </Button>
        </div>

        <RecordsTable
          records={records}
          isAdmin={false}
          currentUser={user?.username}
          onEdit={(record) => setEditingRecord(record)}
          onDelete={(id) => setDeletingRecordId(id)}
        />
      </main>

      {showForm && (
        <RecordForm
          onSubmit={handleAddRecord}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingRecord && (
        <RecordForm
          record={editingRecord}
          onSubmit={handleUpdateRecord}
          onCancel={() => setEditingRecord(null)}
        />
      )}

      {deletingRecordId && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteRecord}
          onCancel={() => setDeletingRecordId(null)}
        />
      )}
    </div>
  );
}
