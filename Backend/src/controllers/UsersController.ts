import { BaseController } from '@/core/base/BaseController';
import { User } from '@/entities/User';
import { UserService } from '@/services/UserService';
import { Request, Response } from 'express';

export class UsersController extends BaseController<User> {
  declare service: UserService; // Override the service type

  constructor() {
    super(User);
    // Replace the default service with custom UserService
    this.service = new UserService();
  }

  /**
   * Toggle user status (enabled/disabled)
   */
  toggleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
        return;
      }

      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const user = await this.service.findById(userId) as User;
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Toggle the enabled status
      const updateData = { enabled: !user.enabled };
      const updatedUser = await this.service.update(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Status do usuário alterado com sucesso',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
}
