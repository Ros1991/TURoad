import { LocalizedText } from '@/entities/LocalizedText';
import { CreateLocalizedTextDto, UpdateLocalizedTextDto, LocalizedTextResponseDto } from '@/dtos/LocalizedTextDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class LocalizedTextMapper extends BaseMapper<LocalizedText> {
  static toEntity(createDto: CreateLocalizedTextDto): LocalizedText {
    const localizedText = new LocalizedText();
    localizedText.referenceId = createDto.referenceId;
    localizedText.languageCode = createDto.languageCode;
    localizedText.textContent = createDto.textContent;
    return localizedText;
  }

  static toEntityFromUpdate(entity: LocalizedText, dto: UpdateLocalizedTextDto): void {
    if (dto.referenceId !== undefined) entity.referenceId = dto.referenceId;
    if (dto.languageCode !== undefined) entity.languageCode = dto.languageCode;
    if (dto.textContent !== undefined) entity.textContent = dto.textContent;
  }

  static toResponseDto(entity: LocalizedText): LocalizedTextResponseDto {
    return {
      id: entity.textId,
      textId: entity.textId,
      referenceId: entity.referenceId,
      languageCode: entity.languageCode,
      textContent: entity.textContent
    };
  }
}
