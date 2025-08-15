import { ObjectLiteral } from 'typeorm';
import { BaseRepository } from '@/core/base/BaseRepository';
import { AppError } from '@/utils/AppError';

export abstract class BaseService<Entity extends ObjectLiteral, CreateDto, UpdateDto, ResponseDto> {
  protected repository: BaseRepository<Entity>;

  constructor(repository: BaseRepository<Entity>) {
    this.repository = repository;
  }

  // Abstract methods that must be implemented by concrete services
  protected abstract mapToResponseDto(entity: Entity): ResponseDto;
  protected abstract mapToResponseDtoList(entities: Entity[]): ResponseDto[];
  protected abstract mapToEntity(dto: CreateDto): Entity;
  protected abstract mapToEntityFromUpdate(dto: UpdateDto, existingEntity: Entity): Entity;

  async findById(id: number): Promise<ResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new AppError(`Entity with id ${id} not found`, 404);
    }
    return this.mapToResponseDto(entity);
  }

  async findAll(): Promise<ResponseDto[]> {
    const entities = await this.repository.findAll();
    return this.mapToResponseDtoList(entities);
  }

  async create(createDto: CreateDto): Promise<ResponseDto> {
    await this.validateCreate(createDto);
    const entity = this.mapToEntity(createDto);
    const savedEntity = await this.repository.create(entity);
    return this.mapToResponseDto(savedEntity);
  }

  async update(id: number, updateDto: UpdateDto): Promise<ResponseDto> {
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new AppError(`Entity with id ${id} not found`, 404);
    }

    await this.validateUpdate(id, updateDto);
    const updatedEntity = this.mapToEntityFromUpdate(updateDto, existingEntity);
    const savedEntity = await this.repository.update(id, updatedEntity);
    
    if (!savedEntity) {
      throw new AppError(`Failed to update entity with id ${id}`, 500);
    }

    return this.mapToResponseDto(savedEntity);
  }

  async delete(id: number): Promise<void> {
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new AppError(`Entity with id ${id} not found`, 404);
    }

    await this.validateDelete(id);
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError(`Failed to delete entity with id ${id}`, 500);
    }
  }

  async exists(id: number): Promise<boolean> {
    const entity = await this.repository.findById(id);
    return entity !== null;
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  // Hook methods for validation - to be overridden by subclasses
  protected async validateCreate(createDto: CreateDto): Promise<void> {
    // Override in subclasses for specific validation
  }

  protected async validateUpdate(id: number, updateDto: UpdateDto): Promise<void> {
    // Override in subclasses for specific validation
  }

  protected async validateDelete(id: number): Promise<void> {
    // Override in subclasses for specific validation
  }

  // Helper method for getting the repository
  protected getRepository(): BaseRepository<Entity> {
    return this.repository;
  }
}

