import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'blue' | 'green';
  onConfirm: () => void;
  onCancel: () => void;
  itemName?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  confirmColor = 'red',
  onConfirm,
  onCancel,
  itemName
}) => {
  if (!isOpen) return null;

  const confirmColorClasses = {
    red: 'bg-red-500 hover:bg-red-600 text-white',
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    green: 'bg-green-500 hover:bg-green-600 text-white'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <p className="text-gray-400 mb-6">
          {message}
          {itemName && (
            <span className="text-white font-medium"> "{itemName}"</span>
          )}
          ? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${confirmColorClasses[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
