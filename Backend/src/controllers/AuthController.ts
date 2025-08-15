import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/AuthService';
import { validateDto } from '@/utils/validateDto';
import { 
  LoginDto, 
  RegisterDto, 
  ChangePasswordDto,
  RefreshTokenDto 
} from '@/dtos/AuthDto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto = await validateDto(LoginDto, req.body);
      const result = await this.authService.login(loginDto);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerDto = await validateDto(RegisterDto, req.body);
      const result = await this.authService.register(registerDto);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshTokenDto = await validateDto(RefreshTokenDto, req.body);
      const result = await this.authService.refreshToken(refreshTokenDto);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await this.authService.logoutAll(req.user.userId);
      
      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
      return;
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const changePasswordDto = await validateDto(ChangePasswordDto, req.body);
      await this.authService.changePassword(req.user.userId, changePasswordDto);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Password reset functionality removed - User entity doesn't have email field

  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      const isValid = await this.authService.validateToken(token);
      
      res.status(200).json({
        success: true,
        data: { isValid },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          userId: req.user.userId,
          email: req.user.email,
          isAdmin: req.user.isAdmin,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveTokens(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const tokens = await this.authService.getActiveTokens(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: tokens,
      });
      return;
    } catch (error) {
      next(error);
    }
  }

  async revokeToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const tokenHash = req.params.tokenHash;
      if (!tokenHash) {
        res.status(400).json({
          success: false,
          message: 'Token hash is required',
        });
        return;
      }
      await this.authService.revokeToken(req.user.userId, tokenHash);
      
      res.status(200).json({
        success: true,
        message: 'Token revoked successfully',
      });
      return;
    } catch (error) {
      next(error);
    }
  }

  async cleanupExpiredTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deletedCount = await this.authService.cleanupExpiredTokens();
      
      res.status(200).json({
        success: true,
        data: { deletedCount },
        message: `Cleaned up ${deletedCount} expired tokens`,
      });
    } catch (error) {
      next(error);
    }
  }
}

