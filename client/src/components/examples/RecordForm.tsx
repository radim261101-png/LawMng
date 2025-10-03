import { useState } from 'react';
import RecordForm from '../RecordForm';

export default function RecordFormExample() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="p-8 bg-background">
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          فتح النموذج
        </button>
      </div>
    );
  }

  return (
    <RecordForm
      onSubmit={(data) => {
        console.log('Form submitted:', data);
        setIsOpen(false);
      }}
      onCancel={() => setIsOpen(false)}
    />
  );
}
