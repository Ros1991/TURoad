import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';
import localizedTextsService from '../../services/localizedTexts.service';
import FlagIcon from './FlagIcon';

interface TranslationDialogProps {
  fieldName: string;
  referenceId?: number;
  currentValue: string;
  onClose: (newReferenceId?: number, updatedPtText?: string) => void;
}

const TranslationDialog: React.FC<TranslationDialogProps> = ({
  fieldName,
  referenceId,
  currentValue,
  onClose
}) => {
  const [translations, setTranslations] = useState<{
    pt: string;
    en: string;
    es: string;
  }>({
    pt: currentValue,
    en: '',
    es: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (referenceId && referenceId > 0) {
      fetchTranslations();
    } else {
      setTranslations({
        pt: currentValue,
        en: '',
        es: ''
      });
    }
  }, [referenceId, currentValue]);

  const fetchTranslations = async () => {
    if (!referenceId) return;
    
    setLoading(true);
    try {
      const translationData = await localizedTextsService.getTranslationsByReferenceId(referenceId);
      
      const pt = translationData.pt || currentValue;
      const en = translationData.en || '';
      const es = translationData.es || '';
      
      setTranslations({ pt, en, es });
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast.error('Não foi possível carregar as traduções');
      setTranslations({
        pt: currentValue,
        en: '',
        es: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTranslations = async () => {
    setSaving(true);
    try {
      // Handle new record vs existing record differently
      if (!referenceId) {
        // For new records, we need to create a reference ID first
        const newReferenceId = await localizedTextsService.createReference(
          translations.pt, 
          [
            { languageCode: 'en', textContent: translations.en },
            { languageCode: 'es', textContent: translations.es }
          ]
        );
        
        toast.success('Traduções salvas com sucesso');
        // Pass back the new reference ID and updated Portuguese text
        onClose(newReferenceId, translations.pt);
      } else {
        // For existing records, just update the translations
        await localizedTextsService.saveTranslations(referenceId, [
          { languageCode: 'pt', textContent: translations.pt },
          { languageCode: 'en', textContent: translations.en },
          { languageCode: 'es', textContent: translations.es }
        ]);
        
        toast.success('Traduções salvas com sucesso');
        onClose(undefined, translations.pt);
      }
    } catch (error) {
      console.error('Error saving translations:', error);
      toast.error('Erro ao salvar as traduções');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Gerenciar Traduções</h3>
          <button 
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700" 
            onClick={() => onClose()}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-1">Campo</div>
          <div className="text-white font-medium">{fieldName}</div>
        </div>

        <div className="space-y-5">
          {/* Portuguese (original) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlagIcon country="br" size="md" />
              <label className="text-white">Português</label>
            </div>
            <input
              type="text"
              value={translations.pt}
              onChange={(e) => setTranslations({ ...translations, pt: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Digite o texto em português"
            />
          </div>

          {/* English */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlagIcon country="us" size="md" />
              <label className="text-white">English</label>
            </div>
            <input
              type="text"
              value={translations.en}
              onChange={(e) => setTranslations({ ...translations, en: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Enter English translation"
            />
          </div>

          {/* Spanish */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlagIcon country="es" size="md" />
              <label className="text-white">Español</label>
            </div>
            <input
              type="text"
              value={translations.es}
              onChange={(e) => setTranslations({ ...translations, es: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ingrese la traducción española"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => onClose()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={saveTranslations}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <FiSave size={16} />
                Salvar Traduções
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TranslationDialog;
