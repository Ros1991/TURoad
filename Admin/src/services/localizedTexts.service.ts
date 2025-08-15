import api from './api';

export interface LocalizedText {
  textId: number;
  referenceId: number;
  languageCode: string;
  textContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferenceResponse {
  referenceId: number;
}

/**
 * Get translations for a reference ID
 */
const getTranslationsByReferenceId = async (referenceId: number): Promise<Record<string, string>> => {
  const response = await api.get<Record<string, string>>(`/localized-texts/reference/${referenceId}`);
  return response.data;
};

/**
 * Save translations for an existing reference
 */
const saveTranslations = async (
  referenceId: number,
  translations: { languageCode: string; textContent: string }[]
): Promise<void> => {
  await api.post(`/localized-texts/reference/${referenceId}`, { translations });
};

/**
 * Create a new reference ID and save initial translations
 * Used when creating a new entity with translations
 */
const createReference = async (
  ptText: string,
  translations: { languageCode: string; textContent: string }[]
): Promise<number> => {
  const response = await api.post<CreateReferenceResponse>(
    '/localized-texts/create-reference', 
    { 
      ptText,
      translations
    }
  );
  return response.data.referenceId;
};

const localizedTextsService = {
  getTranslationsByReferenceId,
  saveTranslations,
  createReference,
};

export default localizedTextsService;
