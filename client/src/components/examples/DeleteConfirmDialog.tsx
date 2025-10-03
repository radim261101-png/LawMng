import { useState } from 'react';
import DeleteConfirmDialog from '../DeleteConfirmDialog';

export default function DeleteConfirmDialogExample() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="p-8 bg-background">
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-destructive text-white rounded-md"
        >
          فتح مربع التأكيد
        </button>
      </div>
    );
  }

  return (
    <DeleteConfirmDialog
      onConfirm={() => {
        console.log('Record deleted');
        setIsOpen(false);
      }}
      onCancel={() => setIsOpen(false)}
    />
  );
}
