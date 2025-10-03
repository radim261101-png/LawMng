import RecordsTable from '../RecordsTable';

const mockRecords = [
  {
    id: '1',
    createdBy: 'admin',
    recordType: 'محضر تكليف بالوفاء',
    registrationNumber: '2024/12345',
    postponementDate: '2024-01-15',
    ruling: 'قيد النظر',
    firstInstanceCourt: 'محكمة القاهرة الابتدائية',
    lastUpdateLawyer: 'أحمد محمد',
    updateDate: '2024-01-10',
  },
  {
    id: '2',
    createdBy: 'admin',
    recordType: 'محضر إعلان حكم',
    registrationNumber: '2024/67890',
    postponementDate: '2024-02-20',
    ruling: 'صدور حكم',
    firstInstanceCourt: 'محكمة الجيزة الابتدائية',
    lastUpdateLawyer: 'فاطمة أحمد',
    updateDate: '2024-02-15',
  },
];

export default function RecordsTableExample() {
  return (
    <div className="p-8 bg-background">
      <RecordsTable 
        records={mockRecords} 
        isAdmin={true}
        onEdit={(record) => console.log('Edit record:', record.id)}
        onDelete={(id) => console.log('Delete record:', id)}
      />
    </div>
  );
}
