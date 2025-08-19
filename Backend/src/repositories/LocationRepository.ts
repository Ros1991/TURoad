import { BaseRepository } from '@/core/base/BaseRepository';
import { Location } from '@/entities/Location';
import { SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { PaginationRequestVO, ListResponseVO } from '@/core/base/BaseVO';

export class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super(Location, 'locationId');
  }

  // Override findWithPagination to always include city relations with localized text
  override async findWithPagination(
    pagination: PaginationRequestVO & { search?: any }, 
    options?: FindManyOptions<Location>,
  ): Promise<ListResponseVO<Location>> {
    // First get the locations with city relations
    const optionsWithCity = {
      ...options,
      relations: {
        ...options?.relations,
        city: true
      }
    };
    
    const result = await super.findWithPagination(pagination, optionsWithCity);
    
    // Then fetch localized texts for cities
    const cityIds = result.items
      .map(location => location.city?.nameTextRefId)
      .filter(id => id !== undefined) as number[];
    
    if (cityIds.length > 0) {
      const localizedTexts = await this.repository.manager.query(
        `SELECT reference_id, text_content 
         FROM localized_texts 
         WHERE reference_id = ANY($1) AND language_code = $2`,
        [cityIds, 'pt']
      );
      
      // Map localized texts to cities
      const textMap = new Map<number, string>();
      localizedTexts.forEach((lt: any) => {
        textMap.set(lt.reference_id, lt.text_content);
      });
      
      // Add localized names to city objects
      result.items.forEach(location => {
        if (location.city?.nameTextRefId) {
          const localizedName = textMap.get(location.city.nameTextRefId);
          if (localizedName) {
            (location.city as any).name = localizedName;
          }
        }
      });
    }
    
    return result;
  }

  protected override applySearch(qb: SelectQueryBuilder<Location>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt', 'lt.reference_id = entity.name_text_ref_id OR lt.reference_id = entity.description_text_ref_id')
        .andWhere('(lt.text_content ILIKE :search AND lt.language_code = :language)', { 
          search: `%${search.search}%`,
          language: 'pt'
        });
    }
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
