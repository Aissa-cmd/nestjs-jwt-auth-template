import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { DataSerializer } from './data-serializer';

export interface SerializerInterceptorOptions {
  dto: ClassConstructor<any>;
  paginated: boolean;
  classTransformOptions?: ClassTransformOptions;
}

@Injectable()
class SerializerInterceptor implements NestInterceptor {
  constructor(private readonly options: SerializerInterceptorOptions) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((handleResponse) => {
        if (this.options.paginated) {
          return DataSerializer.serializePaginatedData(
            this.options.dto,
            handleResponse,
            this.options.classTransformOptions,
          );
        }
        return DataSerializer.serialize(
          this.options.dto,
          handleResponse,
          this.options.classTransformOptions,
        );
      }),
    );
  }
}

export function UseCustomInterceptor(options: SerializerInterceptorOptions) {
  return applyDecorators(UseInterceptors(new SerializerInterceptor(options)));
}
