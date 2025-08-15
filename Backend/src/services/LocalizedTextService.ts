import { BaseService } from '@/core/base/BaseService';
import { LocalizedText } from '@/entities/LocalizedText';
import { AppDataSource } from '@/config/database';
import { Repository } from 'typeorm';

export class LocalizedTextService extends BaseService<LocalizedText> {
  private localizedTextRepo: Repository<LocalizedText>;

  constructor() {
    super(LocalizedText);
    this.localizedTextRepo = AppDataSource.getRepository(LocalizedText);
  }

  /**
   * Get all translations for a reference ID
   */
  async getByReferenceId(referenceId: number): Promise<LocalizedText[]> {
    return this.localizedTextRepo.find({ where: { referenceId } });
  }

  /**
   * Save translations for a reference ID
   */
  async saveTranslations(referenceId: number, translations: { languageCode: string; textContent: string }[]): Promise<void> {
    for (const translation of translations) {
      if (translation.textContent.trim()) {
        const existingTranslation = await this.localizedTextRepo.findOne({
          where: { referenceId, languageCode: translation.languageCode }
        });

        if (existingTranslation) {
          await this.localizedTextRepo.update(existingTranslation.textId, {
            textContent: translation.textContent
          });
        } else {
          const newTranslation = this.localizedTextRepo.create({
            referenceId,
            languageCode: translation.languageCode,
            textContent: translation.textContent
          });
          await this.localizedTextRepo.save(newTranslation);
        }
      }
    }
  }

  /**
   * Create a new reference ID with Portuguese text and translations
   */
  async createReference(ptText: string, translations: { languageCode: string; textContent: string }[]): Promise<number> {
    // Generate a unique reference ID that fits in PostgreSQL integer range
    // Use a smaller number based on seconds since epoch + random
    const referenceId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);

    // Save Portuguese text first
    const ptTranslation = this.localizedTextRepo.create({
      referenceId,
      languageCode: 'pt',
      textContent: ptText
    });
    await this.localizedTextRepo.save(ptTranslation);

    // Save other translations
    for (const translation of translations) {
      if (translation.textContent.trim()) {
        const newTranslation = this.localizedTextRepo.create({
          referenceId,
          languageCode: translation.languageCode,
          textContent: translation.textContent
        });
        await this.localizedTextRepo.save(newTranslation);
      }
    }

    return referenceId;
  }
}
