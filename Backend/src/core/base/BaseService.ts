import { EntityTarget, FindManyOptions, ObjectLiteral } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { IDto, ListResponseDto, PaginationRequestDto } from './BaseDto';
import { PaginationRequestVO } from './BaseVO';
import { AppError } from '../errors/AppError';
import { BaseMapper } from './BaseMapper';

export class BaseService<Entity extends ObjectLiteral> {
  protected baseMapper: BaseMapper<Entity>;
  protected repository: BaseRepository<Entity>;
  protected entityName: string;
  
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
  }

  /**
   * Find entity by ID
   */
  async findById(id: number): Promise<IDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new AppError(`${this.entityName} with id ${id} not found`, 404);
    }
    return this.baseMapper.toResponseDto(entity);
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<IDto[]> {
    const entities = await this.repository.findAll();
    return entities.map(entity => this.baseMapper.toResponseDto(entity));
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
    const mappedData = result.items.map(entity => this.baseMapper.toResponseDto(entity));
    return new ListResponseDto<IDto>(mappedData, result.pagination.total, paginationVO.page, paginationVO.limit);
  }

  /**
   * Create new entity
   */
  async create(createDto: IDto): Promise<IDto> {
    await this.validateBeforeCreate(createDto);
    const entityData = this.baseMapper.toEntity(createDto);
    const entity = await this.repository.create(entityData as any);
    await this.afterCreate(entity);
    return this.baseMapper.toResponseDto(entity);
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
    const entityData = this.baseMapper.toEntityFromUpdate(updateDto, existingEntity);
    const entity = await this.repository.update(id, entityData as any);
    if (!entity) {
      throw new AppError(`Failed to update ${this.entityName} with id ${id}`, 500);
    }
    await this.afterUpdate(entity);
    return this.baseMapper.toResponseDto(entity);
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
