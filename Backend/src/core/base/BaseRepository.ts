import { 
  Repository, 
  FindManyOptions, 
  FindOneOptions, 
  DeepPartial,
  ObjectLiteral,
  EntityTarget,
  SelectQueryBuilder,
  FindOptionsOrder
} from 'typeorm';
import { AppDataSource } from '../../config/database';
import { SoftDeleteBaseEntity } from '../base/BaseEntity';
import { PaginationRequestVO, ListResponseVO} from './BaseVO';
/**
 * Base repository with common CRUD operations
 */
export class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;
  protected primaryKeyField: string;
  protected entityClass: EntityTarget<T>;
  
  constructor(entityClass: EntityTarget<T>, primaryKeyField?: string) {
    this.repository = AppDataSource.getRepository(entityClass);
    this.primaryKeyField = primaryKeyField || '';
    this.entityClass = entityClass;
  }

  get primaryKeyFieldName(): string {
    if(this.primaryKeyField && this.primaryKeyField.length > 0){
      return this.primaryKeyField;
    }
    if (!this.repository.metadata) {
      return 'id';
    }
    const primary = this.repository.metadata.primaryColumns[0];
    return primary?.propertyName ?? 'id';
  }

  protected isSoftDelete(): boolean {
    return (
      this.entityClass === SoftDeleteBaseEntity ||
      (this.entityClass as Function).prototype instanceof SoftDeleteBaseEntity
    );
  }

  /**
   * Find entity by ID (excludes soft deleted by default)
   */
  async findById(id: number, options?: FindOneOptions<T>): Promise<T | null> {
    const whereCondition = {} as any;
    whereCondition[this.primaryKeyFieldName] = id;
    if (this.isSoftDelete()) {
      whereCondition.isDeleted = false;
    }
    return await this.repository.findOne({
      where: whereCondition,
      ...options
    });
  }
  
  /**
   * Find all entities
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    const opts: FindManyOptions<T> = { ...options };
    if (this.isSoftDelete()) {
      const existingWhere = opts.where ?? {};
      opts.where = { ...(existingWhere as any), isDeleted: false };
    }
    return await this.repository.find(opts);
  }

  /**
   * Find entities with pagination (excludes soft deleted by default)
   */
  async findWithPagination(
    pagination: PaginationRequestVO & { search?: any }, 
    options?: FindManyOptions<T>,
  ): Promise<ListResponseVO<T>> {
    const { page = 1, limit = 10, sortBy = '', sortOrder = 'ASC', search } = pagination;
    const qb = this.repository.createQueryBuilder('entity');
    if (options?.where) {
      qb.where(options.where as any); // cast necessário pois qb espera string ou Brackets
    }
    if (this.isSoftDelete()) {
      if (options?.where) {
        qb.andWhere('entity.isDeleted = false');
      } else {
        qb.where('entity.isDeleted = false');
      }
    }
    if (search) {
      this.applySearch(qb, search);
    }
    if (options?.order) {
      qb.orderBy(options.order as any);
    } else if (sortBy && sortBy.length > 0){
      qb.orderBy(`entity.${sortBy}`, sortOrder);
    }
    qb.skip((page - 1) * limit).take(limit);
    if (options?.relations) {
      for (const relation of Object.keys(options.relations)) {
        qb.leftJoinAndSelect(`entity.${relation}`, relation);
      }
    }
    const [items, total] = await qb.getManyAndCount();
    return new ListResponseVO<T>(items, pagination, total);
  }
  
  /**
   * Apply search to query builder - override in child classes
   */
  protected applySearch(qb: SelectQueryBuilder<T>, search: any): void {
  }


  /**
   * Create new entity
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  /**
   * Update entity
   */
  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  /**
   * Delete entity
   */
  async delete(id: number): Promise<boolean> {
    if(this.isSoftDelete()) {
      return await this.softDelete(id);
    }
    return await this.hardDelete(id);
  }
  /**
   * Soft delete entity (logical deletion)
   */
  async softDelete(id: number): Promise<boolean> {
    const now = new Date();
    const result = await this.repository.update(id, {
      deletedAt: now,
      isDeleted: true
    } as any);
    return result.affected !== 0;
  }
  
  /**
   * Hard delete entity (permanent deletion)
   */
  async hardDelete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
  
  /**
   * Delete multiple entities
   */
  async deleteMany(ids: number[]): Promise<boolean> {
    if(this.isSoftDelete()) {
      return await this.softDeleteMany(ids);
    }
    return await this.hardDeleteMany(ids);
  }

  /**
   * Soft delete multiple entities (logical deletion)
   */
  async softDeleteMany(ids: number[]): Promise<boolean> {
    const now = new Date();
    const result = await this.repository.update(ids, {
      deletedAt: now,
      isDeleted: true
    } as any);
    return result.affected !== 0;
  }

  /**
   * Hard delete multiple entities (permanent deletion)
   */
  async hardDeleteMany(ids: number[]): Promise<boolean> {
    const result = await this.repository.delete(ids);
    return result.affected !== 0;
  }
  
  /**
   * Restore soft deleted entity
   */
  async restore(id: number): Promise<boolean> {
    const result = await this.repository.update(id, {
      deletedAt: null,
      isDeleted: false
    } as any);
    return result.affected !== 0;
  }

  /**
   * Count entities
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    const opts: FindManyOptions<T> = { ...options };
    if (this.isSoftDelete()) {
      const existingWhere = opts.where ?? {};
      opts.where = { ...(existingWhere as any), isDeleted: false };
    }
    return await this.repository.count(opts);
  }

  /**
   * Check if entity exists
   */
  async exists(id: number): Promise<boolean> {
    const whereCondition: any = { [this.primaryKeyFieldName]: id };
    if (this.isSoftDelete()) {
      whereCondition.isDeleted = false;
    }
    const count = await this.repository.count({ where: whereCondition });
    return count > 0;
  }
}







