import { BaseController } from '@/core/base/BaseController';
import { User } from '@/entities/User';
import { UserService } from '@/services/UserService';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export class UsersController extends BaseController<User> {
  declare service: UserService; // Override the service type

  constructor() {
    super(User);
    // Replace the default service with custom UserService
    this.service = new UserService();
  }

  /**
   * Get current logged user
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user ID from the authenticated request (set by auth middleware)
      const userId = (req as any).userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
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

      res.status(200).json({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
          isAdmin: user.isAdmin,
          enabled: user.enabled
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Upload profile image
   */
  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
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

      // For now, return a fixed profile image URL
      // In production, this would handle actual file upload to S3 or similar service
      const profileImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
      
      // Update user with new profile image URL
      const updatedUser = await this.service.update(userId, { profilePictureUrl: profileImageUrl });

      res.status(200).json({
        success: true,
        message: 'Imagem de perfil atualizada com sucesso',
        data: {
          profileImage: profileImageUrl,
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da imagem'
      });
    }
  };

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
