import { Request, Response } from 'express';
import { BaseService } from './BaseService';
import { ObjectLiteral } from 'typeorm';
import { BaseMapper } from './BaseMapper';

export class BaseController<Entity extends ObjectLiteral> {
  
  service: BaseService<Entity>;

  constructor(
    EntityClass?: new () => Entity,
    MapperClass?: new () => BaseMapper<Entity>) {
    this.service = new BaseService<Entity>(EntityClass, MapperClass);
  }

  /**
   * List tipos de torneio with pagination and filters
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const sourceData = req.query;
      const filterData = { ...sourceData };
      delete filterData.page;
      delete filterData.limit;
      delete filterData.sortBy;
      delete filterData.sortOrder;

      const paginationData = {
        page: sourceData.page ? parseInt(sourceData.page as string, 10) : undefined,
        limit: sourceData.limit ? parseInt(sourceData.limit as string, 10) : undefined,
        sortBy: sourceData.sortBy as string,
        sortOrder: sourceData.sortOrder as 'ASC' | 'DESC',
        search: filterData,
      };
      // Execute service method with pagination and filters
      const result = await this.service.findWithPagination(paginationData);
      res.status(200).json({
        success: true,
        message: 'Listagem realizada com sucesso',
        data: result,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Get tipo de torneio by ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }

      const result = await this.service.findById(id);

      res.status(200).json({
        success: true,
        message: 'Obtido com sucesso',
        data: result,
      });

    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Create new tipo de torneio
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const sourceData = req.body;
      
      const result = await this.service.create(sourceData);

      // Send success response
      res.status(201).json({
        success: true,
        message: 'Criado com sucesso',
        data: result,
      });

    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Update tipo de torneio
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }
      const result = await this.service.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Atualizado com sucesso',
        data: result,
      });

    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Delete tipo de torneio
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] as string, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
        });
        return;
      }
      const result = await this.service.delete(id);
      res.status(200).json({
        success: true,
        message: 'Excluído com sucesso',
        data: result,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  protected handleError(res: Response, error: any): void {
    console.error('Controller Error:', error);

    if (error.message?.includes('not found') || error.message?.includes('não encontrado')) {
      res.status(404).json({
        success: false,
        message: error.message || 'Recurso não encontrado',
      });
    } else if (error.message?.includes('already exists') || error.message?.includes('já existe')) {
      res.status(409).json({
        success: false,
        message: error.message || 'Recurso já existe',
      });
    } else if (error.message?.includes('validation') || error.message?.includes('validação')) {
      res.status(400).json({
        success: false,
        message: error.message || 'Dados inválidos',
      });
    } else if (error.message?.includes('Email ou senha incorretos')) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    } else if (
      error.message?.includes('Senha atual incorreta') ||
      error.message?.includes('Usuário não possui senha definida')
    ) {
      // Erros de validação de senha atual - 400 Bad Request (não é problema de autenticação)
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else if (
      error.message?.includes('Senha deve conter') ||
      error.message?.includes('Senha muito comum') ||
      error.message?.includes('Nova senha deve ter') ||
      error.message?.includes('senha deve ter pelo menos')
    ) {
      // Erros de validação de nova senha - 400 Bad Request
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else if (error.message?.includes('já foi registrada')) {
      // Erro de chegada/presença já registrada - 400 Bad Request
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      console.log('Erro não tratado:', error.message); // Log para debug
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
