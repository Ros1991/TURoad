import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from '../errors/AppError';

/**
 * Validate DTO using class-validator
 */
export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<T> {
  // Transform plain object to class instance
  const dto = plainToClass(dtoClass, data);
  
  // Validate the DTO
  const errors = await validate(dto as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
    validationError: { target: false }
  });
  
  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      const constraints = error.constraints || {};
      return {
        field: error.property,
        errors: Object.values(constraints)
      };
    });
    
    throw AppError.validationError('Validation failed', errorMessages);
  }
  
  return dto;
}

/**
 * Validate partial DTO (for updates)
 */
export async function validatePartialDto<T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<Partial<T>> {
  // Transform plain object to class instance
  const dto = plainToClass(dtoClass, data);
  
  // Validate the DTO with skipMissingProperties for partial updates
  const errors = await validate(dto as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: true,
    validationError: { target: false }
  });
  
  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      const constraints = error.constraints || {};
      return {
        field: error.property,
        errors: Object.values(constraints)
      };
    });
    
    throw AppError.validationError('Validation failed', errorMessages);
  }
  return dto;
}
