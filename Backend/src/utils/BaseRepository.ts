import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial, ObjectLiteral } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from '@/core/base/BaseDto';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async findById(id: number): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findWithPagination(
    paginationDto: PaginationDto,
    options?: FindManyOptions<T>
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const findOptions: FindManyOptions<T> = {
      ...options,
      skip,
      take: limit,
    };

    if (paginationDto.sortBy) {
      findOptions.order = {
        [paginationDto.sortBy]: paginationDto.sortOrder || 'ASC',
      } as any;
    }

    const [data, total] = await this.repository.findAndCount(findOptions);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const newEntity = this.repository.create(entity);
    return await this.repository.save(newEntity);
  }

  async update(id: number, entity: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, entity as any);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findByIds(ids: number[]): Promise<T[]> {
    return await this.repository.findByIds(ids);
  }

  async bulkCreate(entities: DeepPartial<T>[]): Promise<T[]> {
    const newEntities = this.repository.create(entities);
    return await this.repository.save(newEntities);
  }

  async bulkUpdate(criteria: FindOptionsWhere<T>, entity: DeepPartial<T>): Promise<void> {
    await this.repository.update(criteria, entity as any);
  }

  async bulkDelete(criteria: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(criteria);
  }

  getRepository(): Repository<T> {
    return this.repository;
  }
}

