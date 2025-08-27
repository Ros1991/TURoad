import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { UserFavoriteEvent } from '@/entities/UserFavoriteEvent';

export class UserFavoriteEventRepository {
  private repository: Repository<UserFavoriteEvent>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserFavoriteEvent);
  }

  async findByUserId(userId: number): Promise<UserFavoriteEvent[]> {
    const favoriteEvents = await this.repository.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' }
    });

    // Load localized event names
    for (const favoriteEvent of favoriteEvents) {
      if (favoriteEvent.event?.nameTextRefId) {
        const localizedText = await this.repository.manager.query(
          `SELECT text_content 
           FROM localized_texts 
           WHERE reference_id = $1 AND language_code = $2`,
          [favoriteEvent.event.nameTextRefId, 'pt']
        );

        if (localizedText.length > 0) {
          (favoriteEvent.event as any).name = localizedText[0].text_content;
        }
      }
    }

    return favoriteEvents;
  }

  async findByUserIdAndEventId(userId: number, eventId: number): Promise<UserFavoriteEvent | null> {
    return await this.repository.findOne({
      where: { userId, eventId }
    });
  }

  async create(userId: number, eventId: number): Promise<UserFavoriteEvent> {
    const favoriteEvent = this.repository.create({
      userId,
      eventId
    });

    return await this.repository.save(favoriteEvent);
  }

  async remove(userId: number, eventId: number): Promise<void> {
    await this.repository.delete({ userId, eventId });
  }

  async getAvailableEvents(userId: number): Promise<any[]> {
    const result = await this.repository.manager.query(`
      SELECT e.event_id, e.event_date, e.image_url,
             COALESCE(lt.text_content, 'Event') as localized_name,
             'Event' as name,
             c.state as city_name
      FROM events e
      LEFT JOIN localized_texts lt ON e.name_text_ref_id = lt.reference_id 
        AND lt.language_code = 'pt'
      LEFT JOIN cities c ON e.city_id = c.city_id
      WHERE e.event_id NOT IN (
        SELECT ufe.event_id 
        FROM user_favorite_events ufe 
        WHERE ufe.user_id = $1
      )
      AND e."deletedAt" IS NULL
      ORDER BY e.event_date DESC
    `, [userId]);

    return result;
  }
}
