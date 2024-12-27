import {
  plainToInstance,
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer';
import { Pagination } from 'nestjs-typeorm-paginate';

export class DataSerializer {
  static serialize<T>(
    dto: ClassConstructor<T>,
    data: any | any[],
    classTransformOptions?: ClassTransformOptions,
  ): T | T[] {
    const options: ClassTransformOptions = {
      ...classTransformOptions,
      excludeExtraneousValues: true,
      groups: ['default'],
      strategy: 'excludeAll',
    };
    return plainToInstance(dto, data, options);
  }

  static serializePaginatedData<T>(
    dto: ClassConstructor<T>,
    data: Pagination<any, any>,
    classTransformOptions?: ClassTransformOptions,
  ): Pagination<any, any> {
    const options: ClassTransformOptions = {
      ...classTransformOptions,
      excludeExtraneousValues: true,
      groups: ['default'],
      strategy: 'excludeAll',
    };
    const { items, ...rest } = data;
    const serItems = plainToInstance(dto, items, options);
    return {
      ...rest,
      items: serItems,
    };
  }
}
