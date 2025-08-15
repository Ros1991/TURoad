import { EntityTarget, FindManyOptions, ObjectLiteral } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { IDto, ListResponseDto, PaginationRequestDto } from './BaseDto';
import { PaginationRequestVO } from './BaseVO';
import { AppError } from '../errors/AppError';
import { BaseMapper } from './BaseMapper';
import { LocalizedTextHelper } from '../../utils/LocalizedTextHelper';
import { LocalizedTextRepository } from '../../repositories/LocalizedTextRepository';
import { LocalizedText } from '../../entities/LocalizedText';

export class BaseService<Entity extends ObjectLiteral> {
  protected baseMapper: BaseMapper<Entity>;
  protected repository: BaseRepository<Entity>;
  protected entityName: string;
  protected localizedTextRepository: LocalizedTextRepository;
  protected EntityClass?: new () => Entity;
  protected currentLanguage: string = 'pt';
  
  constructor(
    EntityClass?: new () => Entity,
    MapperClass?: new () => BaseMapper<Entity>,
    entityName: string = 'Entity'
  ) {
      this.repository = new BaseRepository<Entity>(EntityClass as EntityTarget<Entity>);
    if (MapperClass) {
      this.baseMapper = new MapperClass();
    } else {
      this.baseMapper = new BaseMapper<Entity>();
    }
    this.entityName = entityName;
    this.EntityClass = EntityClass;
    this.localizedTextRepository = new LocalizedTextRepository();
  }

  /**
   * Set the current language for localized text operations
   */
  setLanguage(language: string): void {
    this.currentLanguage = language || 'pt';
  }

  /**
   * Handle localized text fields for entity creation
   */
  private async handleLocalizedTextFieldsForCreate(dto: IDto, entity: any): Promise<void> {
    if (!this.EntityClass || !LocalizedTextHelper.hasLocalizedTextFields(this.EntityClass)) {
      return;
    }

    const localizedFields = LocalizedTextHelper.extractLocalizedFieldsFromDto(dto, this.EntityClass);
    
    // Check for existing reference IDs first (from frontend translation dialog)
    const localizedFieldsArray = Array.from(localizedFields.entries());
    
    for (const [fieldName, textContent] of localizedFieldsArray) {
      // fieldName is "nameTextRefId", check if DTO already has this reference ID
      const existingReferenceId = (dto as any)[fieldName];
      
      if (existingReferenceId && existingReferenceId > 0) {
        entity[fieldName] = existingReferenceId;
        continue;
      } else if (textContent) {
        const referenceId = LocalizedTextHelper.generateReferenceId();
        await this.localizedTextRepository.create({
          referenceId,
          languageCode: this.currentLanguage,
          textContent: textContent as string
        });
        entity[fieldName] = referenceId;
      }
    }
  }

  /**
   * Handle localized text fields for entity update
   */
  private async handleLocalizedTextFieldsForUpdate(dto: IDto, entity: any): Promise<void> {
    if (!this.EntityClass || !LocalizedTextHelper.hasLocalizedTextFields(this.EntityClass)) {
      return;
    }

    const localizedFields = LocalizedTextHelper.extractLocalizedFieldsFromDto(dto, this.EntityClass);
    
    for (const [fieldName, textContent] of localizedFields.entries()) {
      const referenceId = entity[fieldName];
      
      if (referenceId) {
        // Update existing localized text
        const existingTexts = await this.localizedTextRepository.findAll({
          where: { 
            referenceId, 
            languageCode: this.currentLanguage 
          } as any
        });
        const existingText = existingTexts.length > 0 ? existingTexts[0] : null;
        
        if (existingText) {
          await this.localizedTextRepository.update(existingText.textId, {
            textContent: textContent as string
          });
        } else {
          // Create new localized text for this language
          await this.localizedTextRepository.create({
            referenceId,
            languageCode: this.currentLanguage,
            textContent: textContent as string
          });
        }
      } else {
        // Create new localized text with new reference ID
        const newReferenceId = LocalizedTextHelper.generateReferenceId();
        await this.localizedTextRepository.create({
          referenceId: newReferenceId,
          languageCode: this.currentLanguage,
          textContent: textContent as string
        });
        entity[fieldName] = newReferenceId;
      }
    }
  }

  /**
   * Fetch localized text values for an entity
   */
  private async fetchLocalizedTextForEntity(entity: any): Promise<any> {
    if (!this.EntityClass || !LocalizedTextHelper.hasLocalizedTextFields(this.EntityClass)) {
      return entity;
    }

    const localizedFields = LocalizedTextHelper.getLocalizedTextFields(this.EntityClass);
    const localizedTexts = new Map<number, string>();
    
    // Collect all reference IDs
    const referenceIds: number[] = [];
    for (const field of localizedFields) {
      const refId = entity[field.propertyName];
      if (refId) {
        referenceIds.push(refId);
      }
    }
    
    if (referenceIds.length > 0) {
      // Import In operator from TypeORM
      const { In } = await import('typeorm');
      
      // Fetch all localized texts for these reference IDs
      const texts = await this.localizedTextRepository.findAll({
        where: {
          referenceId: In(referenceIds),
          languageCode: this.currentLanguage
        } as any
      });
      
      // Map reference IDs to text content
      texts.forEach((text: LocalizedText) => {
        localizedTexts.set(text.referenceId, text.textContent);
      });
    }
    
    // Map entity to DTO with localized strings
    return LocalizedTextHelper.mapEntityToDto(entity, localizedTexts, this.EntityClass);
  }

  /**
   * Find entity by ID
   */
  async findById(id: number): Promise<IDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new AppError(`${this.entityName} with id ${id} not found`, 404);
    }
    const entityWithLocalizedText = await this.fetchLocalizedTextForEntity(entity);
    
    // Preserve nameTextRefId from original entity
    if ((entity as any).nameTextRefId !== undefined) {
      (entityWithLocalizedText as any).nameTextRefId = (entity as any).nameTextRefId;
    }
    
    return this.baseMapper.toResponseDto(entityWithLocalizedText);
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<IDto[]> {
    const entities = await this.repository.findAll();
    const entitiesWithLocalizedText = await Promise.all(
      entities.map(entity => this.fetchLocalizedTextForEntity(entity))
    );
    return entitiesWithLocalizedText.map(entity => this.baseMapper.toResponseDto(entity));
  }

  /**
   * Find entities with pagination using new VO pattern
   */
  async findWithPagination(
    paginationDto: PaginationRequestDto,
    options?: FindManyOptions<Entity>,
  ): Promise<ListResponseDto<IDto>> {
    const paginationVO = new PaginationRequestVO(paginationDto);
    const result = await this.repository.findWithPagination(paginationVO, options);
    const entitiesWithLocalizedText = await Promise.all(
      result.items.map(entity => this.fetchLocalizedTextForEntity(entity))
    );
    const mappedData = entitiesWithLocalizedText.map(entity => this.baseMapper.toResponseDto(entity));
    return new ListResponseDto<IDto>(mappedData, result.pagination.total, paginationVO.page, paginationVO.limit);
  }

  /**
   * Create new entity
   */
  async create(createDto: IDto): Promise<IDto> {
    await this.validateBeforeCreate(createDto);
    
    // First, prepare entity data without localized text fields
    const entityData: any = {};
    
    // Copy non-localized fields from DTO
    for (const key in createDto) {
      if (createDto.hasOwnProperty(key)) {
        entityData[key] = (createDto as any)[key];
      }
    }
    
    // Handle localized text fields and set reference IDs
    await this.handleLocalizedTextFieldsForCreate(createDto, entityData);
    
    // Remove the string fields that were converted to reference IDs
    if (this.EntityClass && LocalizedTextHelper.hasLocalizedTextFields(this.EntityClass)) {
      const fields = LocalizedTextHelper.getLocalizedTextFields(this.EntityClass);
      fields.forEach(field => {
        const dtoFieldName = field.propertyName.replace('TextRefId', '');
        delete entityData[dtoFieldName];
      });
    }
    
    const entity = await this.repository.create(entityData as any);
    await this.afterCreate(entity);
    
    const entityWithLocalizedText = await this.fetchLocalizedTextForEntity(entity);
    return this.baseMapper.toResponseDto(entityWithLocalizedText);
  }

  /**
   * Update entity
   */
  async update(id: number, updateDto: IDto): Promise<IDto> {
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new AppError(`${this.entityName} with id ${id} not found`, 404);
    }
    await this.validateBeforeUpdate(id, updateDto, existingEntity);
    
    // Prepare entity data for update
    const entityData: any = { ...existingEntity };
    
    // Copy non-localized fields from DTO
    for (const key in updateDto) {
      if (updateDto.hasOwnProperty(key)) {
        entityData[key] = (updateDto as any)[key];
      }
    }
    
    // Handle localized text fields before updating entity
    await this.handleLocalizedTextFieldsForUpdate(updateDto, entityData);
    
    // Remove the string fields that were converted to reference IDs
    if (this.EntityClass && LocalizedTextHelper.hasLocalizedTextFields(this.EntityClass)) {
      const fields = LocalizedTextHelper.getLocalizedTextFields(this.EntityClass);
      fields.forEach(field => {
        const dtoFieldName = field.propertyName.replace('TextRefId', '');
        delete entityData[dtoFieldName];
      });
    }
    
    const entity = await this.repository.update(id, entityData as any);
    if (!entity) {
      throw new AppError(`Failed to update ${this.entityName} with id ${id}`, 500);
    }
    await this.afterUpdate(entity);
    
    const entityWithLocalizedText = await this.fetchLocalizedTextForEntity(entity);
    return this.baseMapper.toResponseDto(entityWithLocalizedText);
  }

  /**
   * Delete entity (uses soft delete for SoftDeleteBaseEntity, hard delete otherwise)
   */
  async delete(id: number): Promise<void> {
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new AppError(`${this.entityName} with id ${id} not found`, 404);
    }
    await this.validateBeforeDelete(id, existingEntity);
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError(`Failed to delete ${this.entityName} with id ${id}`, 500);
    }
    await this.afterDelete(existingEntity);
  }

  /**
   * Soft delete entity (force soft delete)
   */
  async softDelete(id: number): Promise<void> {
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new AppError(`${this.entityName} with id ${id} not found`, 404);
    }
    await this.validateBeforeDelete(id, existingEntity);
    const deleted = await this.repository.softDelete(id);
    if (!deleted) {
      throw new AppError(`Failed to soft delete ${this.entityName} with id ${id}`, 500);
    }
    await this.afterDelete(existingEntity);
  }

  /**
   * Hard delete entity (force permanent deletion)
   */
  async hardDelete(id: number): Promise<void> {
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new AppError(`${this.entityName} with id ${id} not found`, 404);
    }
    await this.validateBeforeDelete(id, existingEntity);
    const deleted = await this.repository.hardDelete(id);
    if (!deleted) {
      throw new AppError(`Failed to hard delete ${this.entityName} with id ${id}`, 500);
    }
    await this.afterDelete(existingEntity);
  }

  /**
   * Delete multiple entities
   */
  async deleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError(`${this.entityName} with id ${id} not found`, 404);
      }
    }
    const deleted = await this.repository.deleteMany(ids);
    if (!deleted) {
      throw new AppError(`Failed to delete ${this.entityName} entities`, 500);
    }
  }

  /**
   * Soft delete multiple entities
   */
  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError(`${this.entityName} with id ${id} not found`, 404);
      }
    }
    const deleted = await this.repository.softDeleteMany(ids);
    if (!deleted) {
      throw new AppError(`Failed to soft delete ${this.entityName} entities`, 500);
    }
  }

  /**
   * Hard delete multiple entities
   */
  async hardDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new AppError(`${this.entityName} with id ${id} not found`, 404);
      }
    }
    const deleted = await this.repository.hardDeleteMany(ids);
    if (!deleted) {
      throw new AppError(`Failed to hard delete ${this.entityName} entities`, 500);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: number): Promise<boolean> {
    return await this.repository.exists(id);
  }

  /**
   * Count entities
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }

  // ============== Validation Hooks (to be overridden) ==============

  /**
   * Validate before creating entity
   */
  protected async validateBeforeCreate(createDto: IDto): Promise<void> {
  }

  /**
   * Validate before updating entity
   */
  protected async validateBeforeUpdate(
    id: number, 
    updateDto: IDto, 
    existingEntity: Entity
  ): Promise<void> {
  }

  /**
   * Validate before deleting entity
   */
  protected async validateBeforeDelete(id: number, entity: Entity): Promise<void> {
  }

  // ============== Lifecycle Hooks (to be overridden) ==============

  /**
   * Hook called after entity creation
   */
  protected async afterCreate(entity: Entity): Promise<void> {
  }

  /**
   * Hook called after entity update
   */
  protected async afterUpdate(entity: Entity): Promise<void> {
  }

  /**
   * Hook called after entity deletion
   */
  protected async afterDelete(entity: Entity): Promise<void> {
  }
}
