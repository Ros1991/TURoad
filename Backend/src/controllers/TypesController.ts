import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { Type } from '@/entities/Type';
import { TypeMapper } from '@/mappers/TypeMapper';
import { TypeService } from '@/services/TypeService';

export class TypesController extends BaseController<Type> {
  constructor() {
    super(Type, TypeMapper);
    // Override the generic service with our custom TypeService
    this.service = new TypeService();
  }

  async getActive(req: Request, res: Response): Promise<Response> {
    try {
      const activeTypes = await this.service.findAll();
      return res.json({
        success: true,
        message: 'Active types retrieved successfully',
        data: activeTypes
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve active types',
        data: []
      });
    }
  }
}
