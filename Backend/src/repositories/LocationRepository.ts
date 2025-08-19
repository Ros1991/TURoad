import { BaseRepository } from '@/core/base/BaseRepository';
import { Location } from '@/entities/Location';
import { SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { PaginationRequestVO, ListResponseVO } from '@/core/base/BaseVO';

export class LocationRepository extends BaseRepository<Location> {
  constructor() {
    super(Location, 'locationId');
  }

  // Override findWithPagination to always include city and type relations with localized text
  override async findWithPagination(
    pagination: PaginationRequestVO & { search?: any }, 
    options?: FindManyOptions<Location>,
  ): Promise<ListResponseVO<Location>> {
    // First get the locations with city and type relations
    const optionsWithRelations = {
      ...options,
      relations: {
        ...options?.relations,
        city: true,
        type: true
      }
    };
    
    const result = await super.findWithPagination(pagination, optionsWithRelations);
    
    // Collect all text reference IDs
    const cityIds = result.items
      .map(location => location.city?.nameTextRefId)
      .filter(id => id !== undefined) as number[];
    
    const typeIds = result.items
      .map(location => location.type?.nameTextRefId)
      .filter(id => id !== undefined) as number[];
    
    const allTextRefIds = [...cityIds, ...typeIds];
    
    if (allTextRefIds.length > 0) {
      const localizedTexts = await this.repository.manager.query(
        `SELECT reference_id, text_content 
         FROM localized_texts 
         WHERE reference_id = ANY($1) AND language_code = $2`,
        [allTextRefIds, 'pt']
      );
      
      // Map localized texts
      const textMap = new Map<number, string>();
      localizedTexts.forEach((lt: any) => {
        textMap.set(lt.reference_id, lt.text_content);
      });
      
      // Add localized names to city and type objects
      result.items.forEach(location => {
        if (location.city?.nameTextRefId) {
          const localizedName = textMap.get(location.city.nameTextRefId);
          if (localizedName) {
            (location.city as any).name = localizedName;
          }
        }
        
        if (location.type?.nameTextRefId) {
          const localizedName = textMap.get(location.type.nameTextRefId);
          if (localizedName) {
            (location.type as any).name = localizedName;
          }
        }
      });
    }
    
    return result;
  }

  // Override findById to include city and type relations with localized text
  override async findById(id: number): Promise<Location | null> {
    const whereCondition = {} as any;
    whereCondition[this.primaryKeyFieldName] = id;
    if (this.isSoftDelete()) {
      whereCondition.isDeleted = false;
    }

    const location = await this.repository.findOne({
      where: whereCondition,
      relations: {
        city: true,
        type: true
      }
    });

    if (!location) {
      return null;
    }

    // Collect text reference IDs
    const textRefIds: number[] = [];
    if (location.city?.nameTextRefId) {
      textRefIds.push(location.city.nameTextRefId);
    }
    if (location.type?.nameTextRefId) {
      textRefIds.push(location.type.nameTextRefId);
    }

    if (textRefIds.length > 0) {
      const localizedTexts = await this.repository.manager.query(
        `SELECT reference_id, text_content 
         FROM localized_texts 
         WHERE reference_id = ANY($1) AND language_code = $2`,
        [textRefIds, 'pt']
      );

      // Map localized texts
      const textMap = new Map<number, string>();
      localizedTexts.forEach((lt: any) => {
        textMap.set(lt.reference_id, lt.text_content);
      });

      // Add localized names to city and type objects
      if (location.city?.nameTextRefId) {
        const localizedName = textMap.get(location.city.nameTextRefId);
        if (localizedName) {
          (location.city as any).name = localizedName;
        }
      }

      if (location.type?.nameTextRefId) {
        const localizedName = textMap.get(location.type.nameTextRefId);
        if (localizedName) {
          (location.type as any).name = localizedName;
        }
      }
    }

    return location;
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
    if(search && search.cityId) {
      qb.andWhere('entity.city_id = :cityId', { cityId: search.cityId });
    }
    if(search && search.typeId) {
      qb.andWhere('entity.type_id = :typeId', { typeId: search.typeId });
    }
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
