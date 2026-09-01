import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { RequestMethod, type Type } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import {
  OPENAPI_ROUTE_KEY,
  type OpenApiDtoType,
  type OpenApiRouteMeta,
} from '../common/decorators/api.decorators';
import { TradeController } from '../modules/trade/trade.controller';

const CONTROLLERS: Type[] = [TradeController];

const HTTP_METHODS: Record<number, string> = {
  [RequestMethod.GET]: 'get',
  [RequestMethod.POST]: 'post',
  [RequestMethod.PUT]: 'put',
  [RequestMethod.PATCH]: 'patch',
  [RequestMethod.DELETE]: 'delete',
};

const API_TAGS = 'swagger/apiUseTags';
const API_MODEL_PROPERTIES = 'swagger/apiModelProperties';
const API_MODEL_PROPERTIES_ARRAY = 'swagger/apiModelPropertiesArray';

type JsonSchema = Record<string, unknown>;

type PropertyMeta = {
  type?: unknown;
  isArray?: boolean;
  required?: boolean;
  nullable?: boolean;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  pattern?: string;
  description?: string;
  enum?: unknown[];
};

function joinPath(...parts: Array<string | string[] | undefined>) {
  const segments = parts
    .flatMap((part) => (Array.isArray(part) ? part : [part ?? '']))
    .flatMap((part) => String(part).split('/'))
    .filter((segment) => segment.length > 0);

  return `/${segments.join('/')}`.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function isDtoClass(value: unknown): value is OpenApiDtoType {
  return (
    typeof value === 'function' &&
    value !== String &&
    value !== Number &&
    value !== Boolean &&
    value !== Array &&
    value !== Object &&
    value !== Date
  );
}

function primitiveType(value: unknown): string {
  if (value === String || value === 'string') return 'string';
  if (value === Boolean || value === 'boolean') return 'boolean';
  if (value === Number || value === 'number') return 'number';
  if (value === 'integer') return 'integer';
  return 'string';
}

function propertyKeys(dto: OpenApiDtoType): string[] {
  const keys =
    (Reflect.getMetadata(API_MODEL_PROPERTIES_ARRAY, dto.prototype) as
      | string[]
      | undefined) ?? [];
  return keys.map((key) => key.replace(/^:/, ''));
}

function propertyMeta(dto: OpenApiDtoType, key: string): PropertyMeta {
  return (
    (Reflect.getMetadata(API_MODEL_PROPERTIES, dto.prototype, key) as
      | PropertyMeta
      | undefined) ?? {}
  );
}

function applyNullable(schema: JsonSchema, nullable?: boolean): JsonSchema {
  if (!nullable) return schema;
  return { anyOf: [schema, { type: 'null' }] };
}

function exploreDto(
  dto: OpenApiDtoType,
  schemas: Record<string, JsonSchema>,
): string {
  const name = dto.name;
  if (schemas[name]) return name;

  schemas[name] = { type: 'object' };

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const key of propertyKeys(dto)) {
    const meta = propertyMeta(dto, key);
    if (meta.type === undefined) {
      throw new Error(`Missing @ApiProperty({ type }) on ${name}.${key}`);
    }
    properties[key] = propertySchema(meta, schemas);
    if (meta.required !== false) {
      required.push(key);
    }
  }

  schemas[name] = {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  };

  return name;
}

function propertySchema(
  meta: PropertyMeta,
  schemas: Record<string, JsonSchema>,
): JsonSchema {
  let schema: JsonSchema;

  if (isDtoClass(meta.type)) {
    const name = exploreDto(meta.type, schemas);
    schema = { $ref: `#/components/schemas/${name}` };
  } else if (meta.enum) {
    schema = { type: 'string', enum: meta.enum };
  } else {
    schema = { type: primitiveType(meta.type) };
    if (meta.format) schema.format = meta.format;
    if (meta.minLength !== undefined) schema.minLength = meta.minLength;
    if (meta.maxLength !== undefined) schema.maxLength = meta.maxLength;
    if (meta.minimum !== undefined) schema.minimum = meta.minimum;
    if (meta.maximum !== undefined) schema.maximum = meta.maximum;
    if (meta.default !== undefined) schema.default = meta.default;
    if (meta.pattern) schema.pattern = meta.pattern;
    if (meta.description) schema.description = meta.description;
  }

  if (meta.isArray) {
    schema = { type: 'array', items: schema };
  }

  return applyNullable(schema, meta.nullable);
}

function dtoRef(
  dto: OpenApiDtoType,
  schemas: Record<string, JsonSchema>,
  options?: { isArray?: boolean; nullable?: boolean },
): JsonSchema {
  const name = exploreDto(dto, schemas);
  let schema: JsonSchema = { $ref: `#/components/schemas/${name}` };
  if (options?.isArray) {
    schema = { type: 'array', items: schema };
  }
  return applyNullable(schema, options?.nullable);
}

function parameterObjects(
  dto: OpenApiDtoType,
  location: 'query' | 'path',
  schemas: Record<string, JsonSchema>,
) {
  return propertyKeys(dto).map((name) => {
    const meta = propertyMeta(dto, name);
    const required = location === 'path' || meta.required !== false;
    return {
      in: location,
      name,
      schema: propertySchema(meta, schemas),
      ...(required ? { required: true } : {}),
    };
  });
}

function buildDocument() {
  const schemas: Record<string, JsonSchema> = {};
  const paths: Record<string, Record<string, JsonSchema>> = {};

  for (const ControllerClass of CONTROLLERS) {
    const controllerPath = Reflect.getMetadata(
      PATH_METADATA,
      ControllerClass,
    ) as string | string[] | undefined;
    const classTags =
      (Reflect.getMetadata(API_TAGS, ControllerClass) as
        | string[]
        | undefined) ?? [];
    const prototype = ControllerClass.prototype as Record<string, unknown>;

    for (const propertyKey of Object.getOwnPropertyNames(prototype)) {
      const handler = prototype[propertyKey];
      if (propertyKey === 'constructor' || typeof handler !== 'function') {
        continue;
      }

      const methodMeta = Reflect.getMetadata(METHOD_METADATA, handler) as
        | RequestMethod
        | undefined;
      const httpMethod =
        methodMeta === undefined ? undefined : HTTP_METHODS[methodMeta];
      if (!httpMethod) continue;

      const routeMeta = Reflect.getMetadata(OPENAPI_ROUTE_KEY, handler) as
        | OpenApiRouteMeta
        | undefined;
      if (!routeMeta?.response) {
        throw new Error(
          `Missing @ApiOk() on ${ControllerClass.name}.${propertyKey}`,
        );
      }

      const methodPath = Reflect.getMetadata(PATH_METADATA, handler) as
        | string
        | string[]
        | undefined;
      const fullPath = joinPath(controllerPath, methodPath);
      const tags = classTags.length > 0 ? classTags : undefined;
      const parameters = [
        ...(routeMeta.params
          ? parameterObjects(routeMeta.params, 'path', schemas)
          : []),
        ...(routeMeta.query
          ? parameterObjects(routeMeta.query, 'query', schemas)
          : []),
      ];

      const statusCode = String(routeMeta.status ?? 200);
      const responses: Record<string, JsonSchema> = routeMeta.noContent
        ? {
            [statusCode]: { description: routeMeta.summary ?? 'No content' },
          }
        : {
            [statusCode]: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: dtoRef(routeMeta.response, schemas, {
                    isArray: routeMeta.isArray,
                    nullable: routeMeta.nullable,
                  }),
                },
              },
            },
          };

      paths[fullPath] = {
        ...paths[fullPath],
        [httpMethod]: {
          tags,
          summary: routeMeta.summary,
          ...(parameters.length > 0 ? { parameters } : {}),
          requestBody: routeMeta.body
            ? {
                content: {
                  'application/json': {
                    schema: dtoRef(routeMeta.body, schemas),
                  },
                },
              }
            : undefined,
          responses,
        },
      };
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Trading Platform API',
      version: '1.0.0',
      description: 'REST API for equity trade management',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local development' }],
    paths,
    components: { schemas },
  };
}

const outFile = resolve(
  process.cwd(),
  '../../packages/api-contracts/openapi.json',
);

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(buildDocument(), null, 2)}\n`, 'utf8');
