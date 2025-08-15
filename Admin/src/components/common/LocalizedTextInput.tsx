import React, { useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { FiGlobe } from 'react-icons/fi';
import FlagIcon from './FlagIcon';

// Lazily load TranslationDialog to avoid circular references
const TranslationDialog = lazy(() => import('./TranslationDialog'));

interface LocalizedTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onReferenceIdChange?: (referenceId: number) => void;
  onBothChange?: (value: string, referenceId: number) => void;
  placeholder?: string;
  fieldName: string;
  referenceId?: number;
  className?: string;
  disabled?: boolean;
}

const LocalizedTextInput: React.FC<LocalizedTextInputProps> = ({
  value,
  onChange,
  onReferenceIdChange,
  onBothChange,
  placeholder = '',
  fieldName,
  referenceId,
  className = '',
  disabled = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenTranslationDialog = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = (newReferenceId?: number, updatedPtText?: string) => {
    setIsDialogOpen(false);
    
    if (newReferenceId && updatedPtText !== undefined && onBothChange) {
      onBothChange(updatedPtText, newReferenceId);
    } else {
      if (newReferenceId && onReferenceIdChange) {
        onReferenceIdChange(newReferenceId);
      }
      
      if (updatedPtText !== undefined) {
        onChange(updatedPtText);
      }
    }
  };

  return (
    <>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 pr-20 bg-gray-800 border border-gray-700 rounded-lg text-white ${className}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <FlagIcon country="br" size="md" />
          <button 
            className="p-1 text-gray-400 hover:text-white transition-colors"
            onClick={handleOpenTranslationDialog}
            type="button"
            disabled={disabled}
          >
            <FiGlobe size={16} />
          </button>
        </div>
      </div>

      {isDialogOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 max-w-md w-full">
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <div className="ml-2 text-white">Carregando traduções...</div>
              </div>
            </div>
          </div>
        }>
          <TranslationDialog
            fieldName={fieldName}
            referenceId={referenceId}
            currentValue={value}
            onClose={handleDialogClose}
          />
        </Suspense>
      )}
    </>
  );
};

export default LocalizedTextInput;
