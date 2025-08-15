import 'reflect-metadata';

/**
 * Metadata key for storing localized text reference information
 */
export const LOCALIZED_TEXT_REF_METADATA_KEY = Symbol('localizedTextRef');

/**
 * Custom decorator to mark properties that reference localized text entries
 * 
 * @example
 * ```typescript
 * class City {
 *   @LocalizedTextRef
 *   @Column()
 *   nameTextRefId!: number;
 * 
 *   @LocalizedTextRef
 *   @Column({ nullable: true })
 *   descriptionTextRefId?: number;
 * }
 * ```
 */
export function LocalizedTextRef(target: any, propertyName: string) {
  // Get existing metadata or create new array
  const existingProperties: string[] = 
    Reflect.getMetadata(LOCALIZED_TEXT_REF_METADATA_KEY, target.constructor) || [];
  
  // Add this property to the list
  existingProperties.push(propertyName);
  
  // Store updated metadata
  Reflect.defineMetadata(
    LOCALIZED_TEXT_REF_METADATA_KEY, 
    existingProperties, 
    target.constructor
  );
}

/**
 * Helper function to get all localized text references for a given entity class
 * 
 * @param entityClass - The entity class constructor
 * @returns Array of property names that are localized text references
 * 
 * @example
 * ```typescript
 * const refs = getLocalizedTextRefs(City);
 * console.log(refs); 
 * // ['nameTextRefId', 'descriptionTextRefId', 'whatToObserveTextRefId']
 * ```
 */
export function getLocalizedTextRefs(entityClass: Function): string[] {
  return Reflect.getMetadata(LOCALIZED_TEXT_REF_METADATA_KEY, entityClass) || [];
}

/**
 * Helper function to check if a property is a localized text reference
 * 
 * @param entityClass - The entity class constructor
 * @param propertyName - The property name to check
 * @returns True if property is a text reference, false otherwise
 */
export function isLocalizedTextRef(entityClass: Function, propertyName: string): boolean {
  const refs = getLocalizedTextRefs(entityClass);
  return refs.includes(propertyName);
}
