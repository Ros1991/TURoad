import { FAQ } from '@/entities/FAQ';
import { CreateFAQDto, UpdateFAQDto, FAQResponseDto } from '@/dtos/FAQDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class FAQMapper extends BaseMapper<FAQ> {
  static toEntity(createDto: CreateFAQDto): FAQ {
    const faq = new FAQ();
    faq.questionTextRefId = createDto.questionTextRefId;
    faq.answerTextRefId = createDto.answerTextRefId;
    return faq;
  }

  static toEntityFromUpdate(entity: FAQ, dto: UpdateFAQDto): void {
    if (dto.questionTextRefId !== undefined) entity.questionTextRefId = dto.questionTextRefId;
    if (dto.answerTextRefId !== undefined) entity.answerTextRefId = dto.answerTextRefId;
  }

  static toResponseDto(entity: FAQ): FAQResponseDto {
    return {
      id: entity.faqId,
      faqId: entity.faqId,
      questionTextRefId: entity.questionTextRefId,
      answerTextRefId: entity.answerTextRefId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
