import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

interface SwaggerConfig {
  name: string;
  description: string;
  version: string;
  prefix: string;
}

export function setupSwagger(app: INestApplication) {
  if (
    process.env.NODE_ENV === 'prod' ||
    process.env.NODE_ENV === 'production'
  ) {
    return;
  }
  const swaggerConfig: SwaggerConfig = {
    name: 'API Documentation',
    description: 'API Description',
    version: '1',
    prefix: `v1/docs`,
  };

  const documentBuild = new DocumentBuilder()
    .setTitle(swaggerConfig.name)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app as any, documentBuild, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup(swaggerConfig.prefix, app as any, document, {
    customSiteTitle: swaggerConfig.name,
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
      withCredentials: true,
    },
  });
}
