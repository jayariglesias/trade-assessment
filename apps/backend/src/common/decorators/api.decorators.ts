import { Body, Param, type Type } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export { ApiTags };

export const OPENAPI_ROUTE_KEY = 'openapi:route';

export type OpenApiDtoType = Type<object>;

export type OpenApiRouteMeta = {
  summary?: string;
  body?: OpenApiDtoType;
  query?: OpenApiDtoType;
  params?: OpenApiDtoType;
  response?: OpenApiDtoType;
  isArray?: boolean;
  nullable?: boolean;
  status?: number;
  noContent?: boolean;
};

function mergeRouteMeta(handler: object, patch: OpenApiRouteMeta) {
  const existing =
    (Reflect.getMetadata(OPENAPI_ROUTE_KEY, handler) as
      | OpenApiRouteMeta
      | undefined) ?? {};
  Reflect.defineMetadata(OPENAPI_ROUTE_KEY, { ...existing, ...patch }, handler);
}

function handlerFromTarget(
  target: object,
  propertyKey: string | symbol,
): object | undefined {
  const handler = (target as Record<string | symbol, unknown>)[propertyKey];
  return typeof handler === 'function' ? handler : undefined;
}

export function ApiOk(
  type: OpenApiDtoType | [OpenApiDtoType],
  summary: string,
  options?: { nullable?: boolean; status?: number; noContent?: boolean },
): MethodDecorator {
  const isArray = Array.isArray(type);
  const itemType = isArray ? type[0] : type;

  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    mergeRouteMeta(descriptor.value as object, {
      response: itemType,
      isArray,
      nullable: options?.nullable,
      summary,
      status: options?.status,
      noContent: options?.noContent,
    });
  };
}

export function ApiBodyDto(type: OpenApiDtoType): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      const handler = handlerFromTarget(target, propertyKey);
      if (handler) mergeRouteMeta(handler, { body: type });
    }
    Body()(target, propertyKey, parameterIndex);
  };
}

export function ApiParamDto(type: OpenApiDtoType): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      const handler = handlerFromTarget(target, propertyKey);
      if (handler) mergeRouteMeta(handler, { params: type });
    }
    Param()(target, propertyKey, parameterIndex);
  };
}
