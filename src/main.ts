import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filter va interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors();

  // Static fayllar (yuklangan rasmlar) - GET /uploads/:filename
  app.useStaticAssets(join(process.cwd(), process.env.UPLOAD_DIR || './uploads'), {
    prefix: '/uploads/',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription("Sodda lekin to'liq e-commerce backend API")
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Products', 'Mahsulotlar bilan ishlash')
    .addTag('Categories', 'Kategoriyalar bilan ishlash')
    .addTag('Cart', "Savatni boshqarish")
    .addTag('Orders', 'Buyurtmalar bilan ishlash')
    .addTag('Admin', 'Admin paneli')
    .addTag('Upload', 'Fayl yuklash')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.APP_PORT || 3000;
  await app.listen(PORT);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs on http://localhost:${PORT}/api`);
}

bootstrap();
