import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { JwtToken } from './JwtToken';
import { UserFavoriteRoute } from './UserFavoriteRoute';
import { UserFavoriteCity } from './UserFavoriteCity';
import { UserVisitedRoute } from './UserVisitedRoute';
import { UserPushSettings } from './UserPushSettings';
import { PushNotificationLog } from './PushNotificationLog';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { name: 'user_id' })
  userId!: number;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  // Alias for password_hash to match service expectations
  get password(): string {
    return this.passwordHash;
  }
  set password(value: string) {
    this.passwordHash = value;
  }

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName!: string;

  @Column({ name: 'profile_picture_url', type: 'varchar', length: 255, nullable: true })
  profilePictureUrl?: string;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin!: boolean;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled!: boolean;

  // Audit fields
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  // Soft delete fields
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  // Relationships
  @OneToMany(() => JwtToken, (token) => token.user)
  tokens!: JwtToken[];

  @OneToMany(() => UserFavoriteRoute, (favorite) => favorite.user)
  favoriteRoutes!: UserFavoriteRoute[];

  @OneToMany(() => UserFavoriteCity, (favorite) => favorite.user)
  favoriteCities!: UserFavoriteCity[];

  @OneToMany(() => UserVisitedRoute, (visited) => visited.user)
  visitedRoutes!: UserVisitedRoute[];

  @OneToOne(() => UserPushSettings, (settings) => settings.user)
  pushSettings!: UserPushSettings;

  @OneToMany(() => PushNotificationLog, (log) => log.user)
  notificationLogs!: PushNotificationLog[];
}

