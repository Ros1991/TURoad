import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { JwtToken } from './JwtToken';
import { UserFavoriteRoute } from './UserFavoriteRoute';
import { UserFavoriteCity } from './UserFavoriteCity';
import { UserFavoriteEvent } from './UserFavoriteEvent';
import { UserFavoriteLocation } from './UserFavoriteLocation';
import { UserVisitedRoute } from './UserVisitedRoute';
import { UserPushSettings } from './UserPushSettings';
import { PushNotificationLog } from './PushNotificationLog';
import { SoftDeleteBaseEntity } from '@/core/base/BaseEntity';

@Entity('users')
export class User extends SoftDeleteBaseEntity {
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

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ name: 'profile_picture_url', type: 'varchar', length: 255, nullable: true })
  profilePictureUrl?: string;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin!: boolean;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled!: boolean;

  // Relationships
  @OneToMany(() => JwtToken, (token) => token.user)
  tokens!: JwtToken[];

  @OneToMany(() => UserFavoriteRoute, (favorite) => favorite.user)
  favoriteRoutes!: UserFavoriteRoute[];

  @OneToMany(() => UserFavoriteCity, (favorite) => favorite.user)
  favoriteCities!: UserFavoriteCity[];

  @OneToMany(() => UserFavoriteEvent, (favorite) => favorite.user)
  favoriteEvents!: UserFavoriteEvent[];

  @OneToMany(() => UserFavoriteLocation, (favorite) => favorite.user)
  favoriteLocations!: UserFavoriteLocation[];

  @OneToMany(() => UserVisitedRoute, (visited) => visited.user)
  visitedRoutes!: UserVisitedRoute[];

  @OneToOne(() => UserPushSettings, (settings) => settings.user)
  pushSettings!: UserPushSettings;

  @OneToMany(() => PushNotificationLog, (log) => log.user)
  notificationLogs!: PushNotificationLog[];
}

