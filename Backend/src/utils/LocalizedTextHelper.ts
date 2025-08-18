import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { getLocalizedTextRefs } from '../decorators/LocalizedTextRef';

export interface LocalizedTextField {
  propertyName: string;
  columnName: string;
  isOptional: boolean;
}

export class LocalizedTextHelper {
  /**
   * Get all fields with @LocalizedTextRef decorator for a given entity class
   */
  static getLocalizedTextFields(entityClass: Function): LocalizedTextField[] {
    const fields: LocalizedTextField[] = [];
    
    // Get localized text refs from decorator metadata
    const localizedRefs = getLocalizedTextRefs(entityClass);
    
    // Get metadata storage from TypeORM
    const metadataStorage = getMetadataArgsStorage();
    
    // Get all columns for this entity
    const columns = metadataStorage.filterColumns(entityClass);
    
    // Check each column for the LocalizedTextRef decorator
    columns.forEach((column: any) => {
      // Check if this column is in the localized refs list
      if (localizedRefs.includes(column.propertyName)) {
        fields.push({
          propertyName: column.propertyName,
          columnName: column.options?.name || column.propertyName,
          isOptional: column.options?.nullable === true
        });
      }
    });
    
    return fields;
  }

  /**
   * Extract localized text fields from DTO and convert to entity format
   * Converts string fields (e.g., "name") to TextRefId fields (e.g., "nameTextRefId")
   */
  static extractLocalizedFieldsFromDto(dto: any, entityClass: Function): Map<string, string> {
    const localizedFields = new Map<string, string>();
    const fields = this.getLocalizedTextFields(entityClass);
    
    fields.forEach(field => {
      // Convert entity field name to DTO field name
      // e.g., "nameTextRefId" -> "name", "audioUrlRefId" -> "audioUrl"
      const dtoFieldName = field.propertyName.replace(/(Text)?RefId$/, '');
      
      if (dto[dtoFieldName] !== undefined && dto[dtoFieldName] !== null) {
        localizedFields.set(field.propertyName, dto[dtoFieldName]);
      }
    });
    
    return localizedFields;
  }

  /**
   * Generate a unique reference ID for localized text
   */
  static generateReferenceId(): number {
    // Generate a unique reference ID using timestamp and random number
    // This ensures uniqueness even when multiple texts are created simultaneously
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    // Combine timestamp and random, then use modulo to keep it within integer range
    const referenceId = parseInt(`${timestamp}${random}`.slice(-9));
    
    return referenceId;
  }

  /**
   * Map entity with TextRefIds to DTO with localized strings
   */
  static mapEntityToDto(entity: any, localizedTexts: Map<number, string>, entityClass: Function): any {
    const dto = { ...entity };
    const entityFields = this.getLocalizedTextFields(entityClass);
    
    entityFields.forEach(field => {
      const refId = entity[field.propertyName];
      
      if (refId && typeof refId === 'number' && localizedTexts.has(refId)) {
        // Convert from entity field name (e.g., "nameTextRefId" or "audioUrlRefId") to DTO field name (e.g., "name" or "audioUrl")
        const dtoFieldName = field.propertyName.replace(/(Text)?RefId$/, '');
        const localizedText = localizedTexts.get(refId);
        
        dto[dtoFieldName] = localizedText;
        
        // Ensure the original TextRefId field remains as number
        dto[field.propertyName] = refId;
      } else if (refId && typeof refId !== 'number') {
        // If refId is not a number, it might be corrupted data - log and skip
        console.warn(`[LocalizedTextHelper] Invalid reference ID for ${field.propertyName}: ${refId} (type: ${typeof refId})`);
      }
    });
    
    return dto;
  }

  /**
   * Check if an entity class has any localized text fields
   */
  static hasLocalizedTextFields(entityClass: Function): boolean {
    const refs = getLocalizedTextRefs(entityClass);
    return refs && refs.length > 0;
  }

  /**
   * Get the DTO field name from an entity field name
   * Example: "nameTextRefId" -> "name"
   */
  static getDtoFieldName(entityFieldName: string): string {
    return entityFieldName.replace(/TextRefId$/, '');
  }

  /**
   * Get the entity field name from a DTO field name
   * Example: "name" -> "nameTextRefId"
   */
  static getEntityFieldName(dtoFieldName: string): string {
    return `${dtoFieldName}TextRefId`;
  }
}
