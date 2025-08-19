import crypto from 'crypto';
import { UserRepository } from '@/repositories/UserRepository';
import { JwtTokenRepository } from '@/repositories/JwtTokenRepository';
import { UserPushSettingsService } from '@/services/UserPushSettingsService';
import { PasswordUtils } from '@/utils/password';
import { JwtUtils } from '@/utils/jwt';
import { AppError, AuthenticationError, ConflictError, ValidationError } from '@/utils/AppError';
import { 
  LoginDto, 
  RegisterDto, 
  ChangePasswordDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokenResponseDto 
} from '@/dtos/AuthDto';
import { CreateUserDto } from '@/dtos/UserDto';
import { UserMapper } from '@/mappers/UserMapper';

export class AuthService {
  private userRepository: UserRepository;
  private jwtTokenRepository: JwtTokenRepository;
  private userPushSettingsService: UserPushSettingsService;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtTokenRepository = new JwtTokenRepository();
    this.userPushSettingsService = new UserPushSettingsService();
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailOrUsername(loginDto.emailOrUsername);
    
    if (!user) {
      throw new AuthenticationError('Invalid email/username or password');
    }

    if (!user.enabled) {
      throw new AuthenticationError('Account is disabled');
    }

    const isPasswordValid = await PasswordUtils.comparePassword(loginDto.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid username or password');
    }

    // Generate tokens
    const payload = {
      userId: user.userId,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    // Store refresh token hash in database
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expirationDate = JwtUtils.getTokenExpirationDate(refreshToken);
    
    if (expirationDate) {
      await this.jwtTokenRepository.createToken(user.userId, refreshTokenHash, expirationDate);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        enabled: user.enabled,
      },
      expiresIn: '24h', // Should match JWT config
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email already exists is handled below

    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new ValidationError('A senha não atende aos requisitos', passwordValidation.errors);
    }

    // Hash password
    const passwordHash = await PasswordUtils.hashPassword(registerDto.password);

    // Create user
    const createUserDto: CreateUserDto = {
      email: registerDto.email,
      password: registerDto.password, // Will be hashed in mapper
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      profilePictureUrl: registerDto.profilePictureUrl,
      isAdmin: false, // New users are not admin by default
      enabled: true,
    };

    const userEntity = UserMapper.toEntity(createUserDto);
    userEntity.passwordHash = passwordHash; // Override with hashed password
    
    const savedUser = await this.userRepository.create(userEntity);

    // Create default push notification settings for the new user
    try {
      await this.userPushSettingsService.createDefaultSettings(savedUser.userId);
    } catch (error) {
      console.error('Failed to create default push settings for user:', savedUser.userId, error);
      // Don't fail the registration if push settings creation fails
    }

    // Generate tokens for immediate login
    const payload = {
      userId: savedUser.userId,
      email: savedUser.email,
      isAdmin: savedUser.isAdmin,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    // Store refresh token hash in database
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expirationDate = JwtUtils.getTokenExpirationDate(refreshToken);
    
    if (expirationDate) {
      await this.jwtTokenRepository.createToken(savedUser.userId, refreshTokenHash, expirationDate);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        userId: savedUser.userId,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        isAdmin: savedUser.isAdmin,
        enabled: savedUser.enabled,
      },
      expiresIn: '24h',
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const tokenHash = crypto.createHash('sha256').update(refreshTokenDto.refreshToken).digest('hex');
    
    // Find token in database
    const storedToken = await this.jwtTokenRepository.findByTokenHash(tokenHash);
    if (!storedToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Verify token is not expired
    if (storedToken.expirationDate < new Date()) {
      await this.jwtTokenRepository.revokeToken(tokenHash);
      throw new AuthenticationError('Refresh token expired');
    }

    // Verify user still exists and is enabled
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || !user.enabled) {
      await this.jwtTokenRepository.revokeToken(tokenHash);
      throw new AuthenticationError('User not found or disabled');
    }

    // Generate new access token
    const payload = {
      userId: user.userId,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);

    return {
      accessToken,
      expiresIn: '24h',
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.jwtTokenRepository.revokeToken(tokenHash);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.jwtTokenRepository.revokeAllUserTokens(userId);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.comparePassword(
      changePasswordDto.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(changePasswordDto.newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
    }

    // Hash new password
    const newPasswordHash = await PasswordUtils.hashPassword(changePasswordDto.newPassword);

    // Update password
    await this.userRepository.update(userId, { passwordHash: newPasswordHash } as any);

    // Revoke all existing tokens to force re-login
    await this.jwtTokenRepository.revokeAllUserTokens(userId);
  }

  // Password recovery methods removed - User entity doesn't have email field

  async validateToken(token: string): Promise<boolean> {
    try {
      const payload = JwtUtils.verifyToken(token);
      const user = await this.userRepository.findById(payload.userId);
      return user !== null && user.enabled;
    } catch (error) {
      return false;
    }
  }

  async revokeToken(userId: number, tokenHash: string): Promise<void> {
    // Verify the token belongs to the user
    const token = await this.jwtTokenRepository.findByTokenHash(tokenHash);
    if (!token || token.userId !== userId) {
      throw new AppError('Token not found', 404);
    }

    await this.jwtTokenRepository.revokeToken(tokenHash);
  }

  async getActiveTokens(userId: number): Promise<any[]> {
    const tokens = await this.jwtTokenRepository.findActiveTokensForUser(userId);
    return tokens.map(token => ({
      tokenId: token.tokenId,
      createdAt: token.createdAt,
      expirationDate: token.expirationDate,
      // Don't return the actual token hash for security
    }));
  }

  async cleanupExpiredTokens(): Promise<number> {
    return await this.jwtTokenRepository.cleanupExpiredTokens();
  }
}

