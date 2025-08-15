import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { LocalizedText } from '@/entities/LocalizedText';
import { LocalizedTextService } from '@/services/LocalizedTextService';

export class LocalizedTextsController extends BaseController<LocalizedText> {
  private localizedTextService: LocalizedTextService;

  constructor() {
    super(LocalizedText);
    this.localizedTextService = new LocalizedTextService();
  }

  /**
   * Get translations by reference ID
   */
  async getTranslationsByReferenceId(req: Request, res: Response): Promise<void> {
    try {
      const { referenceId } = req.params;
      const translations = await this.localizedTextService.getByReferenceId(Number(referenceId));
      
      const translationsMap: Record<string, string> = {};
      translations.forEach((translation: LocalizedText) => {
        translationsMap[translation.languageCode] = translation.textContent;
      });
      
      res.json(translationsMap);
    } catch (error) {
      console.error('Error getting translations:', error);
      res.status(500).json({ error: 'Failed to get translations' });
    }
  }

  /**
   * Save translations for a reference ID
   */
  async saveByReference(req: Request, res: Response): Promise<void> {
    try {
      const referenceId = parseInt(req.params.referenceId || '0');
      if (isNaN(referenceId)) {
        res.status(400).json({ message: 'Invalid reference ID' });
        return;
      }

      const { translations } = req.body;
      if (!Array.isArray(translations)) {
        res.status(400).json({ message: 'Translations must be an array' });
        return;
      }

      await this.localizedTextService.saveTranslations(referenceId, translations);
      res.json({ message: 'Translations saved successfully' });
    } catch (error) {
      console.error('Error saving translations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Create a new reference ID with initial translations
   */
  async createReference(req: Request, res: Response): Promise<void> {
    try {
      const { ptText, translations } = req.body;
      
      if (!ptText || !Array.isArray(translations)) {
        res.status(400).json({ message: 'Portuguese text and translations array are required' });
        return;
      }

      const referenceId = await this.localizedTextService.createReference(ptText, translations);
      res.json({ referenceId });
    } catch (error) {
      console.error('Error creating reference:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
