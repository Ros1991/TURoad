import { BaseService } from '@/core/base/BaseService';
import { LocalizedText } from '@/entities/LocalizedText';

export class LocalizedTextService extends BaseService<LocalizedText> {
  constructor() {
    super(LocalizedText);
  }
}
