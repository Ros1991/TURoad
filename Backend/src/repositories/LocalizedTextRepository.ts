import { BaseRepository } from '@/core/base/BaseRepository';
import { LocalizedText } from '@/entities/LocalizedText';

export class LocalizedTextRepository extends BaseRepository<LocalizedText> {
  constructor() {
    super(LocalizedText, 'textId');
  }
}

// Export singleton instance
export const localizedTextRepository = new LocalizedTextRepository();
