import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { ValidationError } from './AppError';

export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  data: any
): Promise<T> {
  const dto = plainToClass(dtoClass, data);
  const errors = await validate(dto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((error: ClassValidatorError) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
    }));

    // Get the first validation constraint message to show as the main error
    const firstError = errors[0];
    const firstConstraintMessage = firstError.constraints 
      ? Object.values(firstError.constraints)[0] 
      : 'Validation failed';

    throw new ValidationError(firstConstraintMessage as string, formattedErrors);
  }

  return dto;
}

export async function validateDtoArray<T extends object>(
  dtoClass: ClassConstructor<T>,
  dataArray: any[]
): Promise<T[]> {
  const validatedDtos: T[] = [];

  for (let i = 0; i < dataArray.length; i++) {
    try {
      const validatedDto = await validateDto(dtoClass, dataArray[i]);
      validatedDtos.push(validatedDto);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Validation failed at index ${i}`, error.errors);
      }
      throw error;
    }
  }

  return validatedDtos;
}

