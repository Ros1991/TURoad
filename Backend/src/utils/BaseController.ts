import { Request, Response, NextFunction } from 'express';
import { ObjectLiteral } from 'typeorm';
import { BaseService } from '@/core/base/BaseService';
import { PaginationDto } from '@/core/dto/PaginationDto';
import { AppError } from '@/utils/AppError';
import { validateDto } from '@/utils/validateDto';

export abstract class BaseController<Entity extends ObjectLiteral, CreateDto, UpdateDto, ResponseDto> {
  protected service: BaseService<Entity, CreateDto, UpdateDto, ResponseDto>;

  constructor(service: BaseService<Entity, CreateDto, UpdateDto, ResponseDto>) {
    this.service = service;
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new AppError('ID parameter is required', 400);
      }
      const id = parseInt(idParam);
      if (isNaN(id)) {
        throw new AppError('Invalid ID parameter', 400);
      }

      const result = await this.service.findById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.service.findAll();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async findWithPagination(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paginationDto = await validateDto(PaginationDto, req.query);
      const result = await this.service.findWithPagination(paginationDto);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createDto = await this.validateCreateDto(req.body);
      const result = await this.service.create(createDto);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Entity created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new AppError('ID parameter is required', 400);
      }
      const id = parseInt(idParam);
      if (isNaN(id)) {
        throw new AppError('Invalid ID parameter', 400);
      }

      const updateDto = await this.validateUpdateDto(req.body);
      const result = await this.service.update(id, updateDto);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Entity updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw new AppError('ID parameter is required', 400);
      }
      const id = parseInt(idParam);
      if (isNaN(id)) {
        throw new AppError('Invalid ID parameter', 400);
      }

      await this.service.delete(id);
      res.status(200).json({
        success: true,
        message: 'Entity deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async count(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.service.count();
      res.status(200).json({
        success: true,
        data: { count: result },
      });
    } catch (error) {
      next(error);
    }
  }

  // Abstract methods to be implemented by subclasses
  protected abstract validateCreateDto(body: any): Promise<CreateDto>;
  protected abstract validateUpdateDto(body: any): Promise<UpdateDto>;

  // Helper method for getting the service
  protected getService(): BaseService<Entity, CreateDto, UpdateDto, ResponseDto> {
    return this.service;
  }

  // Helper method for extracting user from request (for authenticated routes)
  protected getUserFromRequest(req: Request): any {
    return (req as any).user;
  }

  // Helper method for extracting language from request
  protected getLanguageFromRequest(req: Request): string {
    return req.headers['accept-language']?.split(',')[0] || 'pt';
  }
}

