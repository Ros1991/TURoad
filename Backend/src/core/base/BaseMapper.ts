import { ObjectLiteral } from "typeorm";
import { IDto } from "./BaseDto";

export class BaseMapper<Entity extends ObjectLiteral> {

  toEntity(createDto: IDto): Entity {
    return this.mapFields<Entity, IDto>(createDto);
  }

  toEntityFromUpdate(updateDto: IDto, existingEntity: Entity): Entity {
    Object.keys(updateDto).forEach((key) => {
      if (key in existingEntity) {
        const value = (updateDto as any)[key];
        if (value !== undefined && value !== null) {
          (existingEntity as any)[key] = value;
        }
      }
    });
    return existingEntity;
  }

  toResponseDto(entity: Entity): IDto {
    return this.mapFields<IDto, Entity>(entity);
  }

  toResponseDtoList(entities: Entity[]): IDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }

  updateEntityFields(updateDto: IDto, existingEntity: Entity): Entity {
    return this.toEntityFromUpdate(updateDto, existingEntity);
  }

  protected mapFields<TTarget extends object, TSource extends object>(source: TSource): TTarget {
    const target = {} as TTarget;
    Object.keys(source).forEach((key) => {
      (target as any)[key] = (source as any)[key];
    });
    return target;
  }
}